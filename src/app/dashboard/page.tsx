"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { StatCard } from "@/components/cards/stat-card"
import { CategoryPieChart } from "@/components/charts/pie-chart"
import { MonthlyBarChart } from "@/components/charts/bar-chart"
import { ExpenseLineChart } from "@/components/charts/line-chart"
import { ExpenseCategoryChart } from "@/components/charts/expense-category-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, TrendingDown, Target, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
// Mock data commented out - using real API now
// import { currentMonthStats, categoryExpenses, monthlyStats, expenseTrend } from "@/mock/stats"
// import { transactions as mockTransactions } from "@/mock/transactions"

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [monthlyStats, setMonthlyStats] = useState<any[]>([])
  const [expenseTrend, setExpenseTrend] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    try {
      setLoading(true)
      const [statsData, transactionsData, monthlyData, trendData] = await Promise.all([
        api.stats.get(user.id),
        api.transactions.getAll(user.id),
        fetch(`/api/stats/monthly?userId=${user.id}`).then((r) => r.json()).catch(() => []),
        fetch(`/api/stats/expense-trend?userId=${user.id}`).then((r) => r.json()).catch(() => []),
      ])
      setStats(statsData)
      setTransactions(transactionsData || [])
      setMonthlyStats(monthlyData || [])
      setExpenseTrend(trendData || [])
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
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const recentTransactions = transactions.slice(0, 5)
  const currentMonthStats = stats || {
    totalBalance: 0,
    thisMonthIncome: 0,
    thisMonthExpense: 0,
    savingsRate: 0,
  }
  
  const categoryExpenses = (stats?.categoryExpenses || []).map((cat: any, index: number) => ({
    ...cat,
    color: cat.color || ["#8B5CF6", "#A855F7", "#C084FC", "#D8B4FE", "#E9D5FF", "#F3E8FF"][index % 6],
  }))

  // Aggregate expenses by description name
  const expenseByDescription = transactions
    .filter((t: any) => t.type === "expense")
    .reduce((acc: any, transaction: any) => {
      const description = transaction.description || transaction.category_name || "Uncategorized"
      if (!acc[description]) {
        acc[description] = 0
      }
      acc[description] += Number(transaction.amount) || 0
      return acc
    }, {})

  const totalExpenseAmount = Object.values(expenseByDescription).reduce(
    (sum: number, amount: any) => sum + Number(amount),
    0
  ) as number

  const descriptionExpenses = Object.entries(expenseByDescription)
    .map(([description, amount]: [string, any]) => ({
      name: description,
      amount: Number(amount),
      percentage: totalExpenseAmount > 0 ? ((Number(amount) / totalExpenseAmount) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  const getAIInsights = async () => {
    if (!user) return
    try {
      setLoadingAI(true)
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await response.json()
      setAiInsights(data)
    } catch (error) {
      console.error('Failed to get AI insights:', error)
    } finally {
      setLoadingAI(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
          </div>
          <Button onClick={getAIInsights} disabled={loadingAI} variant="outline">
            <Sparkles className="mr-2 h-4 w-4" />
            {loadingAI ? "Analyzing..." : "Get AI Insights"}
          </Button>
        </div>

        {aiInsights && (
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Financial Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiInsights.insights && aiInsights.insights.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Key Insights</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {Array.isArray(aiInsights.insights) ? (
                      aiInsights.insights.map((insight: string, i: number) => (
                        <li key={i}>{insight}</li>
                      ))
                    ) : (
                      <li>{aiInsights.insights}</li>
                    )}
                  </ul>
                </div>
              )}
              {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {aiInsights.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              {aiInsights.assessment && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">{aiInsights.assessment}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Balance"
            value={`₹${currentMonthStats.totalBalance.toLocaleString()}`}
            icon={<Wallet className="h-5 w-5" />}
          />
          <StatCard
            title="This Month Income"
            value={`₹${currentMonthStats.thisMonthIncome.toLocaleString()}`}
            change="+12% from last month"
            trend="up"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="This Month Expense"
            value={`₹${currentMonthStats.thisMonthExpense.toLocaleString()}`}
            change="-5% from last month"
            trend="down"
            icon={<TrendingDown className="h-5 w-5" />}
          />
          <StatCard
            title="Savings Rate"
            value={`${currentMonthStats.savingsRate}%`}
            change="+3% from last month"
            trend="up"
            icon={<Target className="h-5 w-5" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {categoryExpenses.length > 0 ? (
            <CategoryPieChart
              data={categoryExpenses.map((cat: any) => ({
                name: cat.category,
                value: Number(cat.amount),
                color: cat.color,
              }))}
              title="Category-wise Expense"
            />
          ) : (
            <Card className="glass">
              <CardHeader>
                <CardTitle>Category-wise Expense</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No expense data available</p>
              </CardContent>
            </Card>
          )}
          {monthlyStats.length > 0 ? (
            <MonthlyBarChart
              data={monthlyStats}
              title="Monthly Income vs Expense"
            />
          ) : (
            <Card className="glass">
              <CardHeader>
                <CardTitle>Monthly Income vs Expense</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No monthly data available</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Expense by Description - Horizontal Bar Chart */}
        {descriptionExpenses.length > 0 ? (
          <ExpenseCategoryChart
            data={descriptionExpenses}
            title="Where Your Money Goes - Top Expense Descriptions"
          />
        ) : (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Where Your Money Goes - Top Expense Descriptions</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No expense data available</p>
            </CardContent>
          </Card>
        )}

        {/* Expense Trend */}
        {expenseTrend.length > 0 ? (
          <ExpenseLineChart
            data={expenseTrend.map((item) => ({
              date: format(new Date(item.date), "MMM dd"),
              amount: Number(item.amount),
            }))}
            title="Daily Expense Trend"
          />
        ) : (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Daily Expense Trend</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No expense trend data available</p>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        transaction.type === "income"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {transaction.type === "income" ? "↑" : "↓"}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category} • {format(new Date(transaction.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === "income" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {transaction.paymentMode}
                    </Badge>
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-8">No recent transactions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

