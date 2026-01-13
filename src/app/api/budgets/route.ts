import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Fetch all budgets for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let query = supabaseAdmin
      .from('budgets')
      .select('*')
      .eq('user_id', userId)

    if (month) query = query.eq('month', parseInt(month))
    if (year) query = query.eq('year', parseInt(year))

    const { data: budgets, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    // Calculate current_spent for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const { data: transactions } = await supabaseAdmin
          .from('transactions')
          .select('amount')
          .eq('user_id', userId)
          .eq('category_id', budget.category_id)
          .eq('type', 'expense')
          .gte('date', `${budget.year}-${String(budget.month).padStart(2, '0')}-01`)
          .lt('date', `${budget.year}-${String(budget.month + 1).padStart(2, '0')}-01`)

        const currentSpent = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

        return {
          ...budget,
          current_spent: currentSpent,
        }
      })
    )

    return NextResponse.json(budgetsWithSpent)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a new budget
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...budgetData } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('budgets')
      .insert({
        ...budgetData,
        user_id: userId,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

