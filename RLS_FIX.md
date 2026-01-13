# Row Level Security (RLS) Fix

## Problem
The API routes were failing with "new row violates row-level security policy" because the Supabase client in API routes doesn't have the user's authentication context.

## Solution
Created `supabaseAdmin` client that uses the service role key to bypass RLS for server-side operations. Since we validate `userId` in all API routes, this is safe.

## Setup

### Option 1: Use Service Role Key (Recommended)
1. Go to Supabase Dashboard → Project Settings → API
2. Copy the **service_role** key (keep it secret!)
3. Add to `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### Option 2: Use Anon Key (Current - Works but less secure)
The code currently falls back to the anon key if service role is not set. This works but is less secure.

## Security Note
- The `supabaseAdmin` client bypasses RLS
- We validate `userId` in all API routes before making queries
- Only use `supabaseAdmin` in API routes, never in client-side code
- The regular `supabase` client (with anon key) is still used for client-side operations

## Files Updated
All API routes now use `supabaseAdmin`:
- `/api/transactions/*`
- `/api/budgets/*`
- `/api/loans/*`
- `/api/stats`
- `/api/categories`
- `/api/tags`
- `/api/ai/insights`



