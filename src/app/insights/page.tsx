"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { motion } from "framer-motion"
// Mock data commented out - using real API now
// import { monthlyStats, categoryExpenses } from "@/mock/stats"
// import { transactions } from "@/mock/transactions"

export default function InsightsPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    try {
      setLoading(true)
      const [statsData, transactionsData] = await Promise.all([
        api.stats.get(user.id),
        api.transactions.getAll(user.id),
      ])
      setStats(statsData)
      setTransactions(transactionsData || [])
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Mock data for comparison - replace with real monthly data when available
  const monthlyStats = [
    { month: "Jul", income: 0, expense: 0, savings: 0 },
    { month: "Aug", income: 0, expense: 0, savings: 0 },
    { month: "Sep", income: 0, expense: 0, savings: 0 },
    { month: "Oct", income: 0, expense: 0, savings: 0 },
    { month: "Nov", income: 0, expense: 0, savings: 0 },
    { month: "Dec", income: 0, expense: 0, savings: 0 },
    { month: "Jan", income: stats?.thisMonthIncome || 0, expense: stats?.thisMonthExpense || 0, savings: (stats?.thisMonthIncome || 0) - (stats?.thisMonthExpense || 0) },
  ]
  const currentMonth = monthlyStats[monthlyStats.length - 1]
  const previousMonth = monthlyStats[monthlyStats.length - 2]

  const incomeChange = previousMonth
    ? ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100
    : 0
  const expenseChange = previousMonth
    ? ((currentMonth.expense - previousMonth.expense) / previousMonth.expense) * 100
    : 0
  const savingsChange = previousMonth
    ? ((currentMonth.savings - previousMonth.savings) / previousMonth.savings) * 100
    : 0

  // Top spending categories
  const categoryExpenses = stats?.categoryExpenses || []
  const topCategories = [...categoryExpenses]
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 5)

  // Month-over-month comparison
  const monthlyComparison = monthlyStats.slice(-6).map((stat, index) => ({
    month: stat.month,
    income: stat.income,
    expense: stat.expense,
    savings: stat.savings,
    savingsRate: ((stat.savings / stat.income) * 100).toFixed(1),
  }))

  // Expense heatmap data (simplified - showing daily expenses)
  const expenseByDay = Array.from({ length: 31 }, (_, i) => {
    const dayTransactions = transactions.filter(
      (t: any) => new Date(t.date).getDate() === i + 1 && t.type === "expense"
    )
    const total = dayTransactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0)
    return {
      day: i + 1,
      amount: total,
      intensity: total > 3000 ? "high" : total > 1500 ? "medium" : total > 0 ? "low" : "none",
    }
  })

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Insights</h1>
          <p className="text-muted-foreground">Smart insights about your finances</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Income Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {incomeChange >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-400" />
                )}
                <span className="text-2xl font-bold">
                  {incomeChange >= 0 ? "+" : ""}
                  {incomeChange.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                vs previous month
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Expense Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {expenseChange <= 0 ? (
                  <TrendingDown className="h-5 w-5 text-green-400" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-red-400" />
                )}
                <span className="text-2xl font-bold">
                  {expenseChange >= 0 ? "+" : ""}
                  {expenseChange.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                vs previous month
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Savings Rate Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {savingsChange >= 0 ? (
                  <ArrowUpRight className="h-5 w-5 text-green-400" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-red-400" />
                )}
                <span className="text-2xl font-bold">
                  {savingsChange >= 0 ? "+" : ""}
                  {savingsChange.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                vs previous month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="comparison" className="space-y-4">
          <TabsList>
            <TabsTrigger value="comparison">Month Comparison</TabsTrigger>
            <TabsTrigger value="categories">Top Categories</TabsTrigger>
            <TabsTrigger value="heatmap">Expense Heatmap</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Month-over-Month Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyComparison.map((month, index) => {
                    const prevMonth = monthlyComparison[index - 1]
                    const incomeDiff = prevMonth
                      ? month.income - prevMonth.income
                      : 0
                    const expenseDiff = prevMonth
                      ? month.expense - prevMonth.expense
                      : 0

                    return (
                      <motion.div
                        key={month.month}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-border pb-4 last:border-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{month.month}</h3>
                          <Badge variant="outline">
                            {month.savingsRate}% savings rate
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Income</p>
                            <p className="text-lg font-semibold text-green-400">
                              ₹{month.income.toLocaleString()}
                            </p>
                            {prevMonth && (
                              <p className="text-xs text-muted-foreground">
                                {incomeDiff >= 0 ? "+" : ""}₹
                                {Math.abs(incomeDiff).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Expense</p>
                            <p className="text-lg font-semibold text-red-400">
                              ₹{month.expense.toLocaleString()}
                            </p>
                            {prevMonth && (
                              <p className="text-xs text-muted-foreground">
                                {expenseDiff >= 0 ? "+" : ""}₹
                                {Math.abs(expenseDiff).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Savings</p>
                            <p className="text-lg font-semibold">
                              ₹{month.savings.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Top Spending Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.map((category, index) => (
                    <motion.div
                      key={category.category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between border-b border-border pb-4 last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                          <span className="text-lg">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{category.category}</p>
                          <p className="text-sm text-muted-foreground">
                            {category.percentage}% of total expenses
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          ₹{category.amount.toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Daily Expense Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {expenseByDay.map((day) => (
                    <div
                      key={day.day}
                      className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${
                        day.intensity === "high"
                          ? "bg-red-500/80 text-white"
                          : day.intensity === "medium"
                          ? "bg-yellow-500/60 text-white"
                          : day.intensity === "low"
                          ? "bg-green-500/40 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                      title={`Day ${day.day}: ₹${day.amount.toLocaleString()}`}
                    >
                      {day.day}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-red-500/80" />
                    <span>High (&gt;₹3000)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-yellow-500/60" />
                    <span>Medium (₹1500-₹3000)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-green-500/40" />
                    <span>Low (&lt;₹1500)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted" />
                    <span>No expense</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

