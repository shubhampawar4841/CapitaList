"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "./sidebar"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { AIChat } from "@/components/ai-chat"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="container mx-auto p-4 md:p-8">
          <div className="mb-4 flex justify-end">
            <Button variant="ghost" onClick={signOut} size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
          {children}
        </div>
      </main>
      <AIChat />
    </div>
  )
}

