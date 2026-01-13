import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

// Client for browser (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseKey)

// Server-side client with service role (bypasses RLS - use carefully!)
// For API routes, we validate userId ourselves, so this is safe
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey, // Fallback to anon key if service role not set
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

