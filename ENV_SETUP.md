# Environment Variables Setup

Create a `.env.local` file in the root of your project with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abbvjjvvngojuiamixns.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_yy6rOHMTbTcsLWnwL3zNWg_UTCT0bNX
```

Make sure `.env.local` is in your `.gitignore` file!

**Note:** The GROQ_API_KEY is already set in the code as a fallback, but it's better to add it to `.env.local` for security.

