# API Usage Guide

All API routes are available at `/api/*` and follow RESTful conventions.

## Authentication

**Note:** Currently, the API requires a `userId` parameter. In production, you should get this from the authenticated user session.

For now, you can:
1. Create a test user in Supabase Auth
2. Get the user ID from Supabase dashboard
3. Use that ID in your API calls

## API Endpoints

### Transactions

- `GET /api/transactions?userId={userId}` - Get all transactions
- `GET /api/transactions/{id}` - Get single transaction
- `POST /api/transactions` - Create transaction
  ```json
  {
    "userId": "uuid",
    "date": "2024-01-15",
    "amount": 1000,
    "category_id": "uuid",
    "category_name": "Food & Dining",
    "description": "Lunch",
    "type": "expense",
    "payment_mode": "card",
    "tags": ["tag-uuid-1", "tag-uuid-2"]
  }
  ```
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Budgets

- `GET /api/budgets?userId={userId}&month={month}&year={year}` - Get budgets
- `POST /api/budgets` - Create budget
  ```json
  {
    "userId": "uuid",
    "category_id": "uuid",
    "category_name": "Food & Dining",
    "monthly_limit": 5000,
    "month": 1,
    "year": 2024,
    "icon": "🍔"
  }
  ```
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

### Loans

- `GET /api/loans?userId={userId}` - Get all loans
- `POST /api/loans` - Create loan
  ```json
  {
    "userId": "uuid",
    "name": "Home Loan",
    "total_amount": 5000000,
    "remaining_amount": 3200000,
    "monthly_payment": 45000,
    "interest_rate": 8.5,
    "start_date": "2020-01-15",
    "end_date": "2035-01-15",
    "type": "home"
  }
  ```
- `PUT /api/loans/{id}` - Update loan
- `DELETE /api/loans/{id}` - Delete loan

### Stats

- `GET /api/stats?userId={userId}&month={month}&year={year}` - Get statistics

### Categories

- `GET /api/categories?userId={userId}&type={income|expense}` - Get categories
- `POST /api/categories` - Create category

### Tags

- `GET /api/tags?userId={userId}` - Get tags
- `POST /api/tags` - Create tag

## Using the API Service

```typescript
import { api } from '@/lib/api'

// Get all transactions
const transactions = await api.transactions.getAll(userId)

// Create a transaction
const newTransaction = await api.transactions.create(userId, {
  date: '2024-01-15',
  amount: 1000,
  description: 'Lunch',
  type: 'expense',
  payment_mode: 'card',
  category_name: 'Food & Dining',
})

// Get stats
const stats = await api.stats.get(userId)
```

## Next Steps

1. Add authentication to get userId from session
2. Update your components to use the API instead of mock data
3. Add error handling and loading states
4. Add optimistic updates for better UX




