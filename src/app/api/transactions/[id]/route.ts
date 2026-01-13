import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Fetch a single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        category:categories(*),
        tags:transaction_tags(
          tag:tags(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update a transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { tags, ...transactionData } = body

    // Update transaction
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .update(transactionData)
      .eq('id', id)
      .select()
      .single()

    if (transactionError) {
      console.error('Transaction update error:', transactionError)
      throw transactionError
    }

    // Update tags if provided
    if (tags !== undefined && Array.isArray(tags)) {
      // Delete existing tags
      await supabaseAdmin
        .from('transaction_tags')
        .delete()
        .eq('transaction_id', id)

      // Insert new tags
      if (tags.length > 0) {
        const transactionTags = tags.map((tagId: string) => ({
          transaction_id: id,
          tag_id: tagId,
        }))

        const { error: tagsError } = await supabaseAdmin
          .from('transaction_tags')
          .insert(transactionTags)

        if (tagsError) {
          console.error('Tags update error:', tagsError)
          // Don't fail the whole request if tags fail
        }
      }
    }

    return NextResponse.json(transaction)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete a transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // First delete transaction_tags (due to foreign key constraint)
    await supabaseAdmin
      .from('transaction_tags')
      .delete()
      .eq('transaction_id', id)

    // Then delete the transaction
    const { error } = await supabaseAdmin
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Transaction delete error:', error)
      throw error
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete transaction' }, { status: 500 })
  }
}

