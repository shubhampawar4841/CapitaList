# Authentication Setup Guide

## Google Sign-In Setup

1. **Enable Google Provider in Supabase:**
   - Go to your Supabase Dashboard
   - Navigate to **Authentication** > **Providers**
   - Find **Google** and click to enable it
   - You'll need to:
     - Create a Google OAuth Client ID and Secret
     - Add authorized redirect URLs

2. **Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Choose **Web application**
   - Add authorized redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret

3. **Configure in Supabase:**
   - Paste the Client ID and Client Secret in Supabase Google provider settings
   - Save the configuration

4. **Update Redirect URL in Code:**
   - The redirect URL in `src/contexts/auth-context.tsx` should match your app URL
   - For local development: `http://localhost:3000/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`

## How It Works

1. User clicks "Continue with Google" on `/login`
2. They're redirected to Google for authentication
3. After approval, Google redirects to `/auth/callback`
4. The callback route exchanges the code for a session
5. User is redirected to `/dashboard`
6. All API calls use the authenticated user's ID

## Testing

1. Start your dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. You'll be redirected to `/login`
4. Click "Continue with Google"
5. Sign in with your Google account
6. You'll be redirected back to the dashboard

## Notes

- The auth context automatically manages user sessions
- Protected routes check for authentication
- User ID is automatically passed to all API calls
- Sign out clears the session and redirects to login



