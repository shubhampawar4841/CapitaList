"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { AlertCircle, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import { motion } from "framer-motion"
// Mock data commented out - using real API now
// import { budgets } from "@/mock/budgets"

export default function BudgetsPage() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    category_id: "",
    category_name: "",
    monthly_limit: "",
    icon: "💰",
  })

  useEffect(() => {
    if (user) {
      loadBudgets()
      loadCategories()
    }
  }, [user])

  const loadCategories = async () => {
    if (!user) return
    try {
      const data = await api.categories.getAll(user.id, "expense")
      setCategories(data || [])
      // If no categories exist, create some default ones
      if (!data || data.length === 0) {
        const defaultCategories = [
          { name: "Food & Dining", type: "expense" },
          { name: "Shopping", type: "expense" },
          { name: "Transportation", type: "expense" },
          { name: "Entertainment", type: "expense" },
          { name: "Bills & Utilities", type: "expense" },
          { name: "Health & Fitness", type: "expense" },
        ]
        // Don't auto-create, just show message
      }
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const loadBudgets = async () => {
    if (!user) return
    try {
      setLoading(true)
      const currentDate = new Date()
      const data = await api.budgets.getAll(
        user.id,
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      )
      setBudgets(data || [])
    } catch (error) {
      console.error("Failed to load budgets:", error)
    } finally {
      setLoading(false)
    }
  }
  const getProgressPercentage = (spent: number, limit: number) => {
    return Math.min((spent / limit) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500"
    if (percentage >= 80) return "bg-yellow-500"
    return "bg-primary"
  }

  const handleSubmit = async () => {
    if (!user) return
    try {
      const currentDate = new Date()
      await api.budgets.create(user.id, {
        ...formData,
        monthly_limit: Number(formData.monthly_limit),
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      })
      setIsDialogOpen(false)
      setFormData({
        category_id: "",
        category_name: "",
        monthly_limit: "",
        icon: "💰",
      })
      await loadBudgets()
    } catch (error) {
      console.error("Failed to create budget:", error)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
            <p className="text-muted-foreground">Track your monthly spending limits</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>Add Budget</DialogTitle>
                <DialogDescription>
                  Set a monthly spending limit for a category.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {categories.length > 0 ? (
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => {
                        const category = categories.find((c) => c.id === value)
                        setFormData({
                          ...formData,
                          category_id: value,
                          category_name: category?.name || "",
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="z-[100]">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Label htmlFor="category_name">Category Name *</Label>
                    <Input
                      id="category_name"
                      value={formData.category_name}
                      onChange={(e) =>
                        setFormData({ ...formData, category_name: e.target.value })
                      }
                      placeholder="Food & Dining"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      No categories found. Enter a category name manually.
                    </p>
                  </div>
                )}
                {categories.length > 0 && (
                  <div className="grid gap-2">
                    <Label htmlFor="category_name">Category Name (or enter manually)</Label>
                    <Input
                      id="category_name"
                      value={formData.category_name}
                      onChange={(e) =>
                        setFormData({ ...formData, category_name: e.target.value })
                      }
                      placeholder="Food & Dining"
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="monthly_limit">Monthly Limit (₹)</Label>
                  <Input
                    id="monthly_limit"
                    type="number"
                    value={formData.monthly_limit}
                    onChange={(e) =>
                      setFormData({ ...formData, monthly_limit: e.target.value })
                    }
                    placeholder="5000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="icon">Icon (emoji)</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="🍔"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Create Budget</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-muted-foreground">Loading budgets...</p>
            </div>
          </div>
        ) : budgets.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No budgets set for this month. Create one to get started!</p>
            </CardContent>
          </Card>
        ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const currentSpent = Number(budget.current_spent || budget.currentSpent || 0)
            const monthlyLimit = Number(budget.monthly_limit || budget.monthlyLimit || 0)
            const percentage = getProgressPercentage(currentSpent, monthlyLimit)
            const remaining = monthlyLimit - currentSpent
            const isWarning = percentage >= 80

            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`glass ${isWarning ? "border-yellow-500/50" : ""}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">{budget.icon || "💰"}</span>
                        {budget.category_name || budget.category}
                      </CardTitle>
                      {isWarning && (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Spent</span>
                        <span className="text-sm font-semibold">
                          ₹{currentSpent.toLocaleString()} / ₹
                          {monthlyLimit.toLocaleString()}
                        </span>
                      </div>
                      <Progress
                        value={percentage}
                        className="h-2"
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% used
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            remaining >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {remaining >= 0
                            ? `₹${remaining.toLocaleString()} left`
                            : `₹${Math.abs(remaining).toLocaleString()} over`}
                        </span>
                      </div>
                    </div>
                    {isWarning && (
                      <Badge variant="outline" className="w-full justify-center border-yellow-500/50 text-yellow-500">
                        Warning: {percentage >= 100 ? "Budget exceeded!" : "Approaching limit"}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
        )}
      </div>
    </MainLayout>
  )
}

