import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Fetch daily expense trend for current month
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

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const daysInMonth = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`

    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select('amount, date')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)

    // Group by day
    const dailyExpenses = new Map<number, number>()
    transactions?.forEach((t) => {
      const day = new Date(t.date).getDate()
      dailyExpenses.set(day, (dailyExpenses.get(day) || 0) + Number(t.amount))
    })

    // Create array for all days in month
    const expenseTrend = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      return {
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        amount: dailyExpenses.get(day) || 0,
      }
    })

    return NextResponse.json(expenseTrend)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

