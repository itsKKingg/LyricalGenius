# Google OAuth Setup Guide

This guide will walk you through setting up Google Sign-In for your LyricalGenius application using Supabase OAuth.

## Implementation Summary

✅ **Google Sign-In has been added to:**
- Login page (`/auth/login`)
- Signup page (`/auth/signup`)

The implementation uses Supabase's `signInWithOAuth()` method with the Google provider and automatically redirects users to `/editor` after successful authentication.

## Setting Up Google OAuth Credentials

### Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in the required fields (App name, User support email, Developer contact)
   - Add scopes: `email` and `profile`
   - Save and continue

6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: `LyricalGenius` (or your preferred name)
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for local development)
     - `https://your-production-domain.com` (for production)
   - Authorized redirect URIs:
     - `https://your-supabase-project-ref.supabase.co/auth/v1/callback`
   
7. Click **Create** and copy your:
   - **Client ID**
   - **Client Secret**

### Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list of providers
5. Toggle **Enable Sign in with Google** to ON
6. Enter your Google OAuth credentials:
   - **Client ID**: Paste the Client ID from Google Cloud Console
   - **Client Secret**: Paste the Client Secret from Google Cloud Console
7. Click **Save**

### Step 3: Update Your Redirect URI in Google Cloud Console

1. In the Supabase provider settings, copy the **Callback URL (for OAuth)**
2. Go back to Google Cloud Console > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add the Supabase callback URL to **Authorized redirect URIs**
5. Save the changes

### Step 4: Test Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/login`

3. Click the **Sign in with Google** button

4. You should be redirected to Google's OAuth consent screen

5. After authorizing, you'll be redirected back to your app at `/editor`

## How It Works

### Login Page (`src/app/auth/login/page.tsx`)

```typescript
const handleGoogleSignIn = async () => {
  try {
    setError("");
    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/editor`,
      },
    });

    if (error) {
      setError(error.message);
    }
  } catch (err) {
    setError("Failed to initiate Google sign-in. Please try again.");
  }
};
```

### Authentication Flow

1. **User clicks "Sign in with Google"** → Calls `handleGoogleSignIn()`
2. **Supabase initiates OAuth flow** → Redirects to Google's consent screen
3. **User authorizes the app** → Google redirects back to Supabase callback URL
4. **Supabase processes the auth code** → Exchanges it for a session
5. **App callback handler** (`/auth/callback/route.ts`) → Redirects to `/editor`

### Callback Route (`src/app/auth/callback/route.ts`)

The existing callback route handles both email/password and OAuth authentication:

```typescript
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/editor'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
```

## UI Design

The Google Sign-In button:
- Uses Google's official brand colors
- Includes the official Google "G" logo
- Matches the app's purple-to-pink gradient theme
- Has hover states and smooth transitions
- Is positioned prominently above the email/password form

## Security Considerations

1. **OAuth 2.0 Flow**: Uses industry-standard OAuth 2.0 authorization code flow
2. **PKCE**: Supabase automatically implements PKCE for additional security
3. **Redirect URI Validation**: Only authorized redirect URIs are accepted
4. **Session Management**: Supabase handles secure session creation and storage

## Troubleshooting

### Issue: "redirect_uri_mismatch" error
**Solution**: Make sure the redirect URI in Google Cloud Console exactly matches the callback URL from Supabase (including the protocol `https://`)

### Issue: "Access blocked: Authorization Error"
**Solution**: 
- Ensure your OAuth consent screen is properly configured
- Add test users if your app is in "Testing" mode
- Verify the required scopes (`email`, `profile`) are added

### Issue: User is not redirected after authentication
**Solution**: 
- Check that the `/auth/callback` route exists
- Verify environment variables are set correctly
- Check browser console for errors

### Issue: "Invalid OAuth provider" error
**Solution**: 
- Ensure Google provider is enabled in Supabase Dashboard
- Verify Client ID and Secret are correctly entered in Supabase

## Production Deployment

Before deploying to production:

1. ✅ Add your production domain to Google Cloud Console authorized origins
2. ✅ Add the Supabase callback URL to Google Cloud Console authorized redirect URIs
3. ✅ Update OAuth consent screen for production use (may require Google verification)
4. ✅ Test the complete flow in production environment

## Additional Resources

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Need Help?** If you encounter any issues, check the browser console for error messages or refer to the Supabase and Google OAuth documentation.
