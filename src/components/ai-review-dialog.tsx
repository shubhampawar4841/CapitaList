"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2, Save } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AIReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSaved?: () => void
}

export function AIReviewDialog({ open, onOpenChange, userId, onSaved }: AIReviewDialogProps) {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [suggestedTransactions, setSuggestedTransactions] = useState<any[]>([])

  const handleAnalyze = async () => {
    if (!input.trim() || loading) return

    setLoading(true)
    setSuggestedTransactions([])

    try {
      // Get AI suggested transactions
      const response = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          context: input,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions')
      }

      const data = await response.json()
      setSuggestedTransactions(data.transactions || [])
    } catch (error: any) {
      console.error('Failed to analyze:', error)
      alert(error.message || 'Failed to analyze. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const [saving, setSaving] = useState<string | null>(null)

  const handleSaveTransaction = async (transaction: any, index?: number) => {
    if (saving) return
    
    setSaving(index !== undefined ? `single-${index}` : 'single')
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...transaction,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save transaction')
      }

      // Remove saved transaction from suggestions
      setSuggestedTransactions((prev) => prev.filter((t, i) => i !== index))
      
      if (onSaved) onSaved()
    } catch (error: any) {
      console.error('Failed to save:', error)
      alert(error.message || 'Failed to save transaction. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  const handleSaveAll = async () => {
    if (saving || suggestedTransactions.length === 0) return
    
    setSaving('all')
    try {
      // Save all transactions
      const savePromises = suggestedTransactions.map((transaction) =>
        fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            ...transaction,
          }),
        })
      )

      const results = await Promise.all(savePromises)
      const failed = results.filter((r) => !r.ok)

      if (failed.length > 0) {
        throw new Error(`Failed to save ${failed.length} transaction(s)`)
      }

      // Clear suggestions
      setSuggestedTransactions([])
      setInput("")
      
      if (onSaved) onSaved()
    } catch (error: any) {
      console.error('Failed to save all:', error)
      alert(error.message || 'Failed to save some transactions. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Transaction Helper
          </DialogTitle>
          <DialogDescription>
            Describe your transaction, and AI will suggest it in the correct format based on your transaction history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Input */}
          <div className="space-y-2">
            <Label htmlFor="review-input">Describe your transactions (you can add multiple at once)</Label>
            <Textarea
              id="review-input"
              placeholder="e.g., 100rs to papa and 2000 emi and 400 for shopping, or 5000 groceries today, 2000 salary received..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              disabled={loading}
            />
            <Button
              onClick={handleAnalyze}
              disabled={!input.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>

          {/* Suggested Transactions */}
          {suggestedTransactions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">
                  Suggested Transactions ({suggestedTransactions.length}):
                </h4>
                {suggestedTransactions.length > 1 && (
                  <Button
                    onClick={handleSaveAll}
                    disabled={saving === 'all'}
                    variant="default"
                    size="sm"
                  >
                    {saving === 'all' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving All...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save All ({suggestedTransactions.length})
                      </>
                    )}
                  </Button>
                )}
              </div>
              {suggestedTransactions.map((transaction, index) => (
                <Card key={index} className="glass border-primary/20">
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Description:</span>
                        <p className="font-medium">{transaction.description || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <p className="font-medium">₹{transaction.amount || 0}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                          {transaction.type || 'expense'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <p className="font-medium">{transaction.category_name || 'Uncategorized'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Payment Mode:</span>
                        <p className="font-medium">{transaction.payment_mode || 'cash'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <p className="font-medium">{transaction.date || new Date().toISOString().split('T')[0]}</p>
                      </div>
                      {transaction.notes && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Notes:</span>
                          <p className="text-sm">{transaction.notes}</p>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleSaveTransaction(transaction, index)}
                      disabled={saving === `single-${index}` || saving === 'all'}
                      className="w-full"
                      size="sm"
                    >
                      {saving === `single-${index}` ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Transaction
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

