# Supabase Database Setup Guide

This guide will help you set up the Supabase database for your Personal Finance Tracker.

## Steps to Set Up

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to be provisioned

### 2. Run the SQL Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **Run** (or press Ctrl+Enter)
5. Wait for all tables, policies, and functions to be created

### 3. Verify Tables Were Created

Go to **Table Editor** in Supabase dashboard. You should see:
- `profiles`
- `categories`
- `tags`
- `transactions`
- `transaction_tags`
- `budgets`
- `loans`
- `loan_payments`

### 4. Set Up Authentication (Optional - for testing)

If you want to test with seed data:
1. Go to **Authentication** > **Users**
2. Create a test user or use the one created during signup
3. Copy the user's UUID
4. In SQL Editor, run the seed data queries from `supabase-seed-data.sql` (replace `YOUR_USER_ID` with actual UUID)

### 5. Get Your Supabase Credentials

1. Go to **Project Settings** > **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (for client-side)
   - **service_role key** (for server-side - keep secret!)

### 6. Install Supabase Client in Your Next.js App

```bash
npm install @supabase/supabase-js
```

### 7. Create Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 8. Create Supabase Client Utility

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Database Schema Overview

### Tables

1. **profiles** - User profile information (extends auth.users)
2. **categories** - Income/expense categories
3. **tags** - Transaction tags for organization
4. **transactions** - All financial transactions
5. **transaction_tags** - Many-to-many relationship between transactions and tags
6. **budgets** - Monthly budget limits per category
7. **loans** - Loan tracking information
8. **loan_payments** - Payment history for loans

### Security

- **Row Level Security (RLS)** is enabled on all tables
- Users can only access their own data
- Policies are automatically enforced by Supabase

### Features

- Automatic `updated_at` timestamps via triggers
- Automatic profile creation on user signup
- Helper view `budgets_with_spent` for easy budget queries
- Indexes for optimal query performance

## Next Steps

After setting up the database, you'll need to:

1. Replace mock data with Supabase queries
2. Add authentication to your app
3. Create API routes or use Supabase client directly
4. Update components to fetch real data

## Useful Queries

### Get current month transactions
```sql
SELECT * FROM transactions
WHERE user_id = auth.uid()
  AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY date DESC;
```

### Get budgets with spent amounts
```sql
SELECT * FROM budgets_with_spent
WHERE user_id = auth.uid()
  AND month = EXTRACT(MONTH FROM CURRENT_DATE)
  AND year = EXTRACT(YEAR FROM CURRENT_DATE);
```

### Get monthly stats
```sql
SELECT 
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
  SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as savings
FROM transactions
WHERE user_id = auth.uid()
  AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE);
```




