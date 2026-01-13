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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import { format, differenceInMonths, parseISO } from "date-fns"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
// Mock data commented out - using real API now
// import { loans } from "@/mock/loans"

const loanTypeColors: Record<string, string> = {
  home: "#8B5CF6",
  car: "#A855F7",
  personal: "#C084FC",
  education: "#D8B4FE",
  credit_card: "#EF4444",
}

const loanTypeIcons: Record<string, string> = {
  home: "🏠",
  car: "🚗",
  personal: "💼",
  education: "📚",
  credit_card: "💳",
}

export default function LoansPage() {
  const { user } = useAuth()
  const [loans, setLoans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    total_amount: "",
    remaining_amount: "",
    monthly_payment: "",
    interest_rate: "",
    start_date: "",
    end_date: "",
    type: "personal",
    lender_name: "",
  })

  useEffect(() => {
    if (user) {
      loadLoans()
    }
  }, [user])

  const loadLoans = async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await api.loans.getAll(user.id)
      setLoans(data || [])
    } catch (error) {
      console.error("Failed to load loans:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthsLeft = (endDate: string) => {
    return Math.max(0, differenceInMonths(parseISO(endDate), new Date()))
  }

  const calculateInterestPaid = (loan: typeof loans[0]) => {
    const totalAmount = loan.total_amount || loan.totalAmount || 0
    const remainingAmount = loan.remaining_amount || loan.remainingAmount || 0
    const interestRate = loan.interest_rate || loan.interestRate || 0
    const totalPaid = totalAmount - remainingAmount
    const principalPaid = totalPaid / (1 + interestRate / 100)
    return totalPaid - principalPaid
  }

  const loanChartData = loans.map((loan) => ({
    name: loan.name,
    remaining: loan.remaining_amount || loan.remainingAmount || 0,
    paid: (loan.total_amount || loan.totalAmount || 0) - (loan.remaining_amount || loan.remainingAmount || 0),
  }))

  const pieData = loans.map((loan) => ({
    name: loan.name,
    value: loan.remaining_amount || loan.remainingAmount || 0,
    color: loanTypeColors[loan.type] || "#8B5CF6",
  }))

  const handleSubmit = async () => {
    if (!user) return
    try {
      await api.loans.create(user.id, {
        ...formData,
        total_amount: Number(formData.total_amount),
        remaining_amount: Number(formData.remaining_amount),
        monthly_payment: Number(formData.monthly_payment),
        interest_rate: Number(formData.interest_rate),
      })
      setIsDialogOpen(false)
      setFormData({
        name: "",
        total_amount: "",
        remaining_amount: "",
        monthly_payment: "",
        interest_rate: "",
        start_date: "",
        end_date: "",
        type: "personal",
        lender_name: "",
      })
      await loadLoans()
    } catch (error) {
      console.error("Failed to create loan:", error)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Loans</h1>
            <p className="text-muted-foreground">Track your loans and debt</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Loan
              </Button>
            </DialogTrigger>
            <DialogContent className="glass max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Loan</DialogTitle>
                <DialogDescription>
                  Add a new loan to track your debt.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Loan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Home Loan"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Loan Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="total_amount">Total Amount (₹)</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    value={formData.total_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, total_amount: e.target.value })
                    }
                    placeholder="5000000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="remaining_amount">Remaining Amount (₹)</Label>
                  <Input
                    id="remaining_amount"
                    type="number"
                    value={formData.remaining_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, remaining_amount: e.target.value })
                    }
                    placeholder="3200000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monthly_payment">Monthly Payment (₹)</Label>
                  <Input
                    id="monthly_payment"
                    type="number"
                    value={formData.monthly_payment}
                    onChange={(e) =>
                      setFormData({ ...formData, monthly_payment: e.target.value })
                    }
                    placeholder="45000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    step="0.1"
                    value={formData.interest_rate}
                    onChange={(e) =>
                      setFormData({ ...formData, interest_rate: e.target.value })
                    }
                    placeholder="8.5"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lender_name">Lender Name (Optional)</Label>
                  <Input
                    id="lender_name"
                    value={formData.lender_name}
                    onChange={(e) =>
                      setFormData({ ...formData, lender_name: e.target.value })
                    }
                    placeholder="Bank Name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Add Loan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-muted-foreground">Loading loans...</p>
            </div>
          </div>
        ) : loans.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No loans added yet. Add a loan to get started!</p>
            </CardContent>
          </Card>
        ) : (
        <>
        {/* Loan Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {loans.map((loan) => {
            const monthsLeft = calculateMonthsLeft(loan.end_date || loan.endDate)
            const interestPaid = calculateInterestPaid(loan)
            const paidAmount = (loan.total_amount || loan.totalAmount) - (loan.remaining_amount || loan.remainingAmount)
            const totalAmount = loan.total_amount || loan.totalAmount
            const progressPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0

            return (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">{loanTypeIcons[loan.type]}</span>
                        {loan.name}
                      </CardTitle>
                      <Badge variant="outline">{loan.type.replace("_", " ").toUpperCase()}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-semibold">
                          {progressPercentage.toFixed(1)}% paid
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-lg font-semibold">₹{(loan.total_amount || loan.totalAmount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <p className="text-lg font-semibold text-red-400">
                          ₹{(loan.remaining_amount || loan.remainingAmount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Payment</p>
                        <p className="text-lg font-semibold">₹{(loan.monthly_payment || loan.monthlyPayment || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Interest Rate</p>
                        <p className="text-lg font-semibold">{loan.interest_rate || loan.interestRate || 0}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Months Left</p>
                        <p className="text-lg font-semibold">{monthsLeft}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Interest Paid</p>
                        <p className="text-lg font-semibold text-yellow-400">
                          ₹{interestPaid.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Started: {format(parseISO(loan.start_date || loan.startDate), "MMM dd, yyyy")} • Ends:{" "}
                        {format(parseISO(loan.end_date || loan.endDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Remaining vs Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={loanChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      border: "1px solid #1E293B",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="remaining" fill="#EF4444" name="Remaining" />
                  <Bar dataKey="paid" fill="#10B981" name="Paid" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Loan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      border: "1px solid #1E293B",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        </>
        )}
      </div>
    </MainLayout>
  )
}

