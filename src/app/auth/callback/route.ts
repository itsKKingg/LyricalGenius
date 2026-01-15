import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/editor'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      // Redirect to auth-code-error with error details
      const errorParams = new URLSearchParams({
        error: error.message || 'auth_failed',
        error_description: error.message || 'Authentication failed'
      })
      return NextResponse.redirect(`${origin}/auth/auth-code-error?${errorParams}`)
    }
  }

  // Handle missing code or other errors
  const errorParams = new URLSearchParams({
    error: 'missing_auth_code',
    error_description: 'No authentication code was provided in the callback'
  })
  
  return NextResponse.redirect(`${origin}/auth/auth-code-error?${errorParams}`)
}
