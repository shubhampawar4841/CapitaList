// API service utility for making requests to our Next.js API routes

const API_BASE = '/api'

export const api = {
  // Transactions
  transactions: {
    getAll: async (userId: string) => {
      const res = await fetch(`${API_BASE}/transactions?userId=${userId}`)
      if (!res.ok) throw new Error('Failed to fetch transactions')
      return res.json()
    },
    getById: async (id: string) => {
      const res = await fetch(`${API_BASE}/transactions/${id}`)
      if (!res.ok) throw new Error('Failed to fetch transaction')
      return res.json()
    },
    create: async (userId: string, data: any) => {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to create transaction')
      }
      return res.json()
    },
    update: async (id: string, data: any) => {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to update transaction')
      }
      return res.json()
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to delete transaction')
      }
      return res.json()
    },
  },

  // Budgets
  budgets: {
    getAll: async (userId: string, month?: number, year?: number) => {
      const params = new URLSearchParams({ userId })
      if (month) params.append('month', month.toString())
      if (year) params.append('year', year.toString())
      const res = await fetch(`${API_BASE}/budgets?${params}`)
      if (!res.ok) throw new Error('Failed to fetch budgets')
      return res.json()
    },
    create: async (userId: string, data: any) => {
      const res = await fetch(`${API_BASE}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      })
      if (!res.ok) throw new Error('Failed to create budget')
      return res.json()
    },
    update: async (id: string, data: any) => {
      const res = await fetch(`${API_BASE}/budgets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update budget')
      return res.json()
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/budgets/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete budget')
      return res.json()
    },
  },

  // Loans
  loans: {
    getAll: async (userId: string) => {
      const res = await fetch(`${API_BASE}/loans?userId=${userId}`)
      if (!res.ok) throw new Error('Failed to fetch loans')
      return res.json()
    },
    create: async (userId: string, data: any) => {
      const res = await fetch(`${API_BASE}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      })
      if (!res.ok) throw new Error('Failed to create loan')
      return res.json()
    },
    update: async (id: string, data: any) => {
      const res = await fetch(`${API_BASE}/loans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update loan')
      return res.json()
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/loans/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete loan')
      return res.json()
    },
  },

  // Stats
  stats: {
    get: async (userId: string, month?: number, year?: number) => {
      const params = new URLSearchParams({ userId })
      if (month) params.append('month', month.toString())
      if (year) params.append('year', year.toString())
      const res = await fetch(`${API_BASE}/stats?${params}`)
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
  },

  // Categories
  categories: {
    getAll: async (userId: string, type?: 'income' | 'expense') => {
      const params = new URLSearchParams({ userId })
      if (type) params.append('type', type)
      const res = await fetch(`${API_BASE}/categories?${params}`)
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
    create: async (userId: string, data: any) => {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      })
      if (!res.ok) throw new Error('Failed to create category')
      return res.json()
    },
  },

  // Tags
  tags: {
    getAll: async (userId: string) => {
      const res = await fetch(`${API_BASE}/tags?userId=${userId}`)
      if (!res.ok) throw new Error('Failed to fetch tags')
      return res.json()
    },
    create: async (userId: string, data: any) => {
      const res = await fetch(`${API_BASE}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      })
      if (!res.ok) throw new Error('Failed to create tag')
      return res.json()
    },
  },
}

