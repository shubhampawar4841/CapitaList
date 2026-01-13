import { NextRequest, NextResponse } from 'next/server'
import { getGroqChatCompletion } from '@/lib/groq'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, userId } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    // If userId is provided, fetch user's transaction data for context
    let transactionContext = ''
    if (userId) {
      try {
        const { data: transactions } = await supabaseAdmin
          .from('transactions')
          .select('description, amount, type, category_name, date, payment_mode')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(50)

        if (transactions && transactions.length > 0) {
          // Calculate summary stats FIRST (most important for quick answers)
          const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0)
          const totalExpense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0)

          transactionContext = `=== USER'S FINANCIAL SUMMARY ===\n`
          transactionContext += `Total Income: ₹${totalIncome.toLocaleString()}\n`
          transactionContext += `Total Expenses: ₹${totalExpense.toLocaleString()}\n`
          transactionContext += `Current Balance: ₹${(totalIncome - totalExpense).toLocaleString()}\n\n`
          
          // All transactions (detailed list)
          transactionContext += `=== ALL TRANSACTIONS (${transactions.length} total) ===\n`
          transactions.forEach((t, i) => {
            transactionContext += `${i + 1}. ${t.date} - ${t.description} - ₹${Number(t.amount).toLocaleString()} (${t.type}) - Category: ${t.category_name || 'Uncategorized'} - Payment: ${t.payment_mode || 'N/A'}\n`
          })
          transactionContext += `\n`

          // Category breakdown
          const categoryMap = new Map<string, number>()
          transactions
            .filter((t) => t.type === 'expense')
            .forEach((t) => {
              const cat = t.category_name || 'Uncategorized'
              categoryMap.set(cat, (categoryMap.get(cat) || 0) + Number(t.amount))
            })

          if (categoryMap.size > 0) {
            transactionContext += `\nSpending by Category:\n`
            Array.from(categoryMap.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .forEach(([cat, amount]) => {
                transactionContext += `- ${cat}: ₹${amount.toLocaleString()}\n`
              })
          }
        }
      } catch (error) {
        console.error('Error fetching transactions for context:', error)
        // Continue without context if fetch fails
      }
    }

    // Add system message with context if available
    const systemMessage = {
      role: 'system',
      content: `You are a helpful AI financial assistant. ${transactionContext ? `You have FULL ACCESS to the user's transaction history. Here is their complete transaction data:\n\n${transactionContext}\n\nIMPORTANT RULES:
1. Keep responses SHORT and CONCISE - maximum 2-3 sentences
2. When asked about spending, just give the total amount and brief breakdown
3. DO NOT list every single transaction - just summarize
4. Use actual numbers from the transaction history
5. DO NOT say you don't have access - you DO have access
6. Be direct and to the point - no long explanations

Example good response: "You've spent ₹4,250 on papa (7 transactions) and ₹0 on tempo. Total: ₹4,250."

Example bad response: "To calculate the total amount spent on 'papa' and 'Tempo', I'll go through the transaction history. For 'papa', I found the following transactions: [long list]..."` : 'You currently do not have access to the user\'s transaction history. If they ask about their transactions, politely let them know you need their transaction data.'}`,
    }

    // Prepend system message to messages
    const messagesWithContext = [systemMessage, ...messages]

    // Get AI response
    const response = await getGroqChatCompletion(messagesWithContext)

    const content = response.choices[0]?.message?.content || ''

    return NextResponse.json({ content })
  } catch (error: any) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get AI response' }, { status: 500 })
  }
}

