"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ExpenseCategoryData {
  category: string
  amount: number
  percentage: string | number
}

interface ExpenseCategoryChartProps {
  data: ExpenseCategoryData[]
  title?: string
}

const COLORS = ["#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E", "#10B981", "#14B8A6", "#06B6D4", "#3B82F6"]

export function ExpenseCategoryChart({ data, title = "Expense by Category" }: ExpenseCategoryChartProps) {
  // Sort data by amount (highest to lowest) and limit to top 10
  const sortedData = [...data]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 10)
    .map((item, index) => ({
      ...item,
      amount: Number(item.amount),
      percentage: Number(item.percentage),
      color: COLORS[index % COLORS.length],
    }))

  if (sortedData.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No expense data available</p>
        </CardContent>
      </Card>
    )
  }

  const totalExpense = sortedData.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Showing top {sortedData.length} categories • Total: ₹{totalExpense.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis 
              type="number" 
              stroke="#94A3B8"
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              type="category" 
              dataKey="category" 
              stroke="#94A3B8"
              width={90}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                border: "1px solid #1E293B",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string, props: any) => [
                `₹${value.toLocaleString()} (${props.payload.percentage.toFixed(1)}%)`,
                "Amount"
              ]}
            />
            <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {sortedData.slice(0, 5).map((item, index) => (
            <div key={item.category} className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground truncate">{item.category}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

