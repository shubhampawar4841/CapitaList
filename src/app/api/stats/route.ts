import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Fetch statistics for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const monthParam = searchParams.get('month')
    const yearParam = searchParams.get('year')
    
    const month = monthParam ? parseInt(monthParam) : new Date().getMonth() + 1
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get current month transactions
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-01`

    const { data: transactions, error: transactionsError } = await supabaseAdmin
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lt('date', endDate)

    if (transactionsError) throw transactionsError

    const income = transactions
      ?.filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const expense = transactions
      ?.filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const savings = income - expense
    const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0

    // Get category expenses
    const { data: categoryData, error: categoryError } = await supabaseAdmin
      .from('transactions')
      .select('amount, category_name')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lt('date', endDate)

    if (categoryError) throw categoryError

    const categoryMap = new Map<string, number>()
    categoryData?.forEach((t) => {
      const category = t.category_name || 'Uncategorized'
      categoryMap.set(category, (categoryMap.get(category) || 0) + Number(t.amount))
    })

    const categoryExpenses = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: expense > 0 ? ((amount / expense) * 100).toFixed(1) : 0,
    }))

    // Get total balance (sum of all income - all expenses)
    const { data: allTransactions, error: balanceError } = await supabaseAdmin
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)

    if (balanceError) throw balanceError

    const totalBalance =
      allTransactions?.reduce(
        (sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)),
        0
      ) || 0

    return NextResponse.json({
      totalBalance,
      thisMonthIncome: income,
      thisMonthExpense: expense,
      savingsRate,
      categoryExpenses,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

