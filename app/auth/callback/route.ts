import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (next) return NextResponse.redirect(`${origin}${next}`)

      // First-time user check: see if they have any scan data
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: scan } = await supabase
          .from('scans')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle()

        return NextResponse.redirect(`${origin}${scan ? '/dashboard' : '/onboarding'}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
