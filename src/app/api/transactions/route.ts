import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Fetch all transactions for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        category:categories(*),
        tags:transaction_tags(
          tag:tags(*)
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, tags, ...transactionData } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Validate required fields
    if (!transactionData.description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }
    if (!transactionData.amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 })
    }
    if (!transactionData.date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }
    if (!transactionData.type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 })
    }
    if (!transactionData.payment_mode) {
      return NextResponse.json({ error: 'Payment mode is required' }, { status: 400 })
    }

    // Try to find category by name if category_id is not provided
    let categoryId = transactionData.category_id
    if (!categoryId && transactionData.category_name) {
      const { data: category } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('name', transactionData.category_name)
        .single()
      
      if (category) {
        categoryId = category.id
      }
    }

    // Prepare transaction data
    const transactionPayload: any = {
      user_id: userId,
      date: transactionData.date,
      amount: Number(transactionData.amount),
      description: transactionData.description,
      type: transactionData.type,
      payment_mode: transactionData.payment_mode,
      category_name: transactionData.category_name || null,
      notes: transactionData.notes || null,
    }

    if (categoryId) {
      transactionPayload.category_id = categoryId
    }

    // Insert transaction
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert(transactionPayload)
      .select()
      .single()

    if (transactionError) {
      console.error('Transaction insert error:', transactionError)
      return NextResponse.json(
        { error: transactionError.message || 'Failed to create transaction', details: transactionError },
        { status: 500 }
      )
    }

    // If tags are provided as an array of tag IDs, insert them
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const transactionTags = tags.map((tagId: string) => ({
        transaction_id: transaction.id,
        tag_id: tagId,
      }))

      const { error: tagsError } = await supabaseAdmin
        .from('transaction_tags')
        .insert(transactionTags)

      if (tagsError) {
        console.error('Tags insert error:', tagsError)
        // Don't fail the whole request if tags fail
      }
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error: any) {
    console.error('Transaction creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error', details: error },
      { status: 500 }
    )
  }
}

