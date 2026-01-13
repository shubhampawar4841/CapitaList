"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon?: React.ReactNode
  trend?: "up" | "down"
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("glass hover:shadow-lg transition-shadow", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && <div className="text-primary">{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {change && (
            <p
              className={cn(
                "text-xs mt-1",
                trend === "up" ? "text-green-400" : "text-red-400"
              )}
            >
              {change}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}



