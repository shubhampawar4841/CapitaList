"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BarChartData {
  month: string
  income: number
  expense: number
  savings?: number
}

interface BarChartProps {
  data: BarChartData[]
  title: string
}

export function MonthlyBarChart({ data, title }: BarChartProps) {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="month" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                border: "1px solid #1E293B",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="income" fill="#8B5CF6" name="Income" />
            <Bar dataKey="expense" fill="#EF4444" name="Expense" />
            {data[0]?.savings !== undefined && (
              <Bar dataKey="savings" fill="#10B981" name="Savings" />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}




