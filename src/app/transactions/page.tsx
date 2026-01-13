"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Sparkles } from "lucide-react"
import { AIReviewDialog } from "@/components/ai-review-dialog"
import { format } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import { motion } from "framer-motion"
// Mock data commented out - using real API now
// import { transactions as mockTransactions, type Transaction } from "@/mock/transactions"

type Transaction = {
  id: string
  date: string
  amount: number
  category: string
  description: string
  type: "income" | "expense"
  paymentMode: "cash" | "card" | "upi" | "bank_transfer"
  tags: string[]
  category_name?: string
  payment_mode?: string
}

const categories = [
  "Food & Dining",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Bills & Utilities",
  "Health & Fitness",
  "Salary",
  "Freelance",
]

const paymentModes = ["cash", "card", "upi", "bank_transfer"]

export default function TransactionsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  const loadTransactions = async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await api.transactions.getAll(user.id)
      // Transform API data to match component format
      const transformed = data.map((t: any) => {
        // Handle tags - could be array of objects or array of strings
        let tagsArray: string[] = []
        if (t.tags && Array.isArray(t.tags)) {
          tagsArray = t.tags.map((tt: any) => {
            if (typeof tt === 'string') return tt
            if (tt.tag && typeof tt.tag === 'object') return tt.tag.name || tt.tag_id
            return String(tt.tag_id || tt)
          })
        }
        
        return {
          id: t.id,
          date: t.date,
          amount: Number(t.amount),
          category: t.category_name || t.category?.name || 'Uncategorized',
          description: t.description,
          type: t.type,
          paymentMode: t.payment_mode || t.paymentMode || 'cash',
          tags: tagsArray,
        }
      })
      setTransactions(transformed)
    } catch (error) {
      console.error("Failed to load transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    type: "expense" as "income" | "expense",
    paymentMode: "cash" as Transaction["paymentMode"],
    date: format(new Date(), "yyyy-MM-dd"),
    tags: "",
  })

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter
    const matchesType = typeFilter === "all" || t.type === typeFilter
    const matchesPaymentMode = paymentModeFilter === "all" || t.paymentMode === paymentModeFilter
    return matchesSearch && matchesCategory && matchesType && matchesPaymentMode
  })

  const handleAdd = () => {
    setEditingTransaction(null)
    setFormData({
      description: "",
      amount: "",
      category: "",
      type: "expense",
      paymentMode: "cash",
      date: format(new Date(), "yyyy-MM-dd"),
      tags: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      category: transaction.category || "",
      type: transaction.type,
      paymentMode: transaction.paymentMode,
      date: transaction.date,
      tags: Array.isArray(transaction.tags) ? transaction.tags.join(", ") : (transaction.tags || ""),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return
    }
    
    try {
      await api.transactions.delete(id)
      await loadTransactions()
    } catch (error: any) {
      console.error("Failed to delete transaction:", error)
      alert(error.message || "Failed to delete transaction. Please try again.")
    }
  }

  const handleSubmit = async () => {
    if (!user) return
    
    // Validate form
    if (!formData.description || !formData.amount || !formData.date || !formData.type || !formData.paymentMode) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const transactionData = {
        date: formData.date,
        amount: Number(formData.amount),
        description: formData.description,
        type: formData.type,
        payment_mode: formData.paymentMode,
        category_name: formData.category || null,
        notes: formData.tags || null,
      }

      if (editingTransaction) {
        await api.transactions.update(editingTransaction.id, transactionData)
        await loadTransactions()
      } else {
        await api.transactions.create(user.id, transactionData)
        await loadTransactions()
      }
      setIsDialogOpen(false)
      // Reset form
      setFormData({
        description: "",
        amount: "",
        category: "",
        type: "expense",
        paymentMode: "cash",
        date: format(new Date(), "yyyy-MM-dd"),
        tags: "",
      })
    } catch (error: any) {
      console.error("Failed to save transaction:", error)
      alert(error.message || "Failed to save transaction. Please try again.")
    }
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground">Manage all your financial transactions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setReviewDialogOpen(true)} variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Review
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? "Edit Transaction" : "Add Transaction"}
                </DialogTitle>
                <DialogDescription>
                  {editingTransaction
                    ? "Update the transaction details below."
                    : "Add a new transaction to your records."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "income" | "expense") =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <Select
                    value={formData.paymentMode}
                    onValueChange={(value: Transaction["paymentMode"]) =>
                      setFormData({ ...formData, paymentMode: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentModes.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {mode.replace("_", " ").toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="food, dining, social"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentModeFilter} onValueChange={setPaymentModeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  {paymentModes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode.replace("_", " ").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                  <p className="text-muted-foreground">Loading transactions...</p>
                </div>
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border"
                  >
                    <TableCell>
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.type === "income" ? "default" : "secondary"
                        }
                      >
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={
                        transaction.type === "income"
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {transaction.type === "income" ? "+" : "-"}₹
                      {transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.paymentMode.replace("_", " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {transaction.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Review Dialog */}
      {user && (
        <AIReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          userId={user.id}
          onSaved={() => {
            // Optionally refresh data or show success message
          }}
        />
      )}
    </MainLayout>
  )
}

