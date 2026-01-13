import { NextRequest, NextResponse } from 'next/server'
import { getFinancialInsights } from '@/lib/groq'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Fetch user's financial data
    const [transactionsRes, budgetsRes, loansRes] = await Promise.all([
      supabaseAdmin.from('transactions').select('*').eq('user_id', userId),
      supabaseAdmin.from('budgets').select('*').eq('user_id', userId),
      supabaseAdmin.from('loans').select('*').eq('user_id', userId),
    ])

    const transactions = transactionsRes.data || []
    const budgets = budgetsRes.data || []
    const loans = loansRes.data || []

    // Get AI insights
    const insights = await getFinancialInsights(transactions, budgets, loans)

    return NextResponse.json(insights)
  } catch (error: any) {
    console.error('AI insights error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

