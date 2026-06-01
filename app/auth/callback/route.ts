import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // Collect cookies written during exchangeCodeForSession so we can attach
  // them to the final redirect response. The shared cookies() store from
  // next/headers is read-only in Route Handlers, so we must manage them here.
  const pendingCookies: { name: string; value: string; options: CookieOptions }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          for (const c of cookiesToSet) {
            pendingCookies.push({ name: c.name, value: c.value, options: c.options ?? {} })
          }
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // Determine destination after exchange (session cookies are now in pendingCookies)
  let destination: string
  if (next) {
    destination = next
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }
    const { data: scan } = await supabase
      .from('scans')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    destination = scan ? '/dashboard' : '/onboarding'
  }

  const response = NextResponse.redirect(`${origin}${destination}`)

  // Attach the session cookies to the redirect so the browser receives them
  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(name, value, options)
  }

  return response
}
