import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Fetch monthly stats for the last 6 months
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const currentDate = new Date()
    const monthlyStats = []

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      const monthName = date.toLocaleString('default', { month: 'short' })

      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const { data: transactions } = await supabaseAdmin
        .from('transactions')
        .select('amount, type')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)

      const income = transactions
        ?.filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0

      const expense = transactions
        ?.filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0

      monthlyStats.push({
        month: monthName,
        income,
        expense,
        savings: income - expense,
      })
    }

    return NextResponse.json(monthlyStats)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}



