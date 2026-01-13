import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getGroqChatCompletion } from '@/lib/groq'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, transactionId, reviewType, context, transactionData } = body

    if (!userId || !context) {
      return NextResponse.json({ error: 'User ID and context are required' }, { status: 400 })
    }

    // Get user's recent transactions for context
    const { data: recentTransactions } = await supabaseAdmin
      .from('transactions')
      .select('description, amount, type, category_name, date, payment_mode')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(20)

    // Get category spending patterns
    const { data: categoryStats } = await supabaseAdmin
      .from('transactions')
      .select('category_name, amount, type')
      .eq('user_id', userId)
      .eq('type', 'expense')

    // Build context from user input and DB data
    let fullContext = `User's Question/Context: ${context}\n\n`

    if (recentTransactions && recentTransactions.length > 0) {
      fullContext += `Recent Transaction History (from database):\n`
      recentTransactions.forEach((t, i) => {
        fullContext += `${i + 1}. ${t.description} - ₹${Number(t.amount).toLocaleString()} (${t.type}) - ${t.category_name || 'Uncategorized'} - ${t.date}\n`
      })
    }

    if (categoryStats && categoryStats.length > 0) {
      const categoryTotals = new Map<string, number>()
      categoryStats.forEach((t) => {
        const cat = t.category_name || 'Uncategorized'
        categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + Number(t.amount))
      })

      fullContext += `\nSpending by Category (from database):\n`
      Array.from(categoryTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([cat, amount]) => {
          fullContext += `- ${cat}: ₹${amount.toLocaleString()}\n`
        })
    }

    // Create AI prompt - return transaction format (supports multiple transactions)
    const systemPrompt = `You are a financial assistant. The user may describe MULTIPLE transactions in one input (e.g., "100rs to papa and 2000 emi and 400 for shopping"). 

Parse ALL transactions mentioned and return them as a JSON array. Each transaction should follow this format:
{
  "description": "string (what the transaction is)",
  "amount": number (amount in rupees),
  "type": "income" or "expense",
  "category_name": "string (category like Food & Dining, Shopping, Transportation, Entertainment, Bills & Utilities, Health & Fitness, Salary, Freelance, Loan Payment, etc.)",
  "payment_mode": "cash" or "card" or "upi" or "bank_transfer",
  "date": "YYYY-MM-DD (use today's date if not specified)",
  "notes": "string (optional additional info)"
}

IMPORTANT:
- Parse EVERY transaction mentioned in the user's input
- If user says "100rs to papa" - create expense transaction with description "Payment to papa" or "Papa"
- If user says "2000 emi" - create expense transaction with description "EMI Payment", category "Loan Payment"
- If user says "400 for shopping" - create expense transaction with description "Shopping", category "Shopping"
- Use today's date (${new Date().toISOString().split('T')[0]}) if date not specified
- Default payment_mode to "upi" if not specified
- Default type to "expense" if not clear

Return ONLY a JSON array of transaction objects, no other text. Example: [{"description": "...", "amount": 100, ...}, {"description": "...", "amount": 2000, ...}]`

    const userPrompt = `User's input: ${context}\n\nTransaction history context:\n${fullContext}\n\nParse ALL transactions from the user's input and return as JSON array. Today's date is ${new Date().toISOString().split('T')[0]}.`

    // Get AI analysis
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]

    const aiResponse = await getGroqChatCompletion(messages)
    const content = aiResponse.choices[0]?.message?.content || '{}'

    // Parse AI response - should be array of transactions
    let transactions = []
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleanedContent)
      // Ensure it's an array
      transactions = Array.isArray(parsed) ? parsed : [parsed]
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      // Return empty array if parsing fails
      transactions = []
    }

    // Return suggested transactions in database format
    return NextResponse.json({ transactions })
  } catch (error: any) {
    console.error('AI review error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate review' }, { status: 500 })
  }
}

