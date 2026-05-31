'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const C = {
  bg:     '#E3E2DE',
  blue:   '#1351AA',
  black:  '#141414',
  gray:   '#444343',
  muted:  '#7A7A7A',
  border: '#C7C7C7',
}

function LoginContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('error') === 'auth_failed') {
      setError('Authentication failed — please try again')
    }
  }, [searchParams])

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Nav bar */}
      <nav style={{
        height: 64,
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2.5rem',
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textDecoration: 'none',
          color: C.muted,
          fontSize: '0.8125rem',
          fontWeight: 500,
          letterSpacing: '0.02em',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = C.black)}
          onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 2L4 7l5 5" />
          </svg>
          draftr.uxabhi.com
        </Link>
        <span style={{
          fontSize: '0.8125rem',
          fontWeight: 800,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: C.black,
        }}>
          Draftr
        </span>
      </nav>

      {/* Login card */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: C.muted,
              marginBottom: '0.75rem',
            }}>
              Sign in
            </p>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              color: C.black,
              letterSpacing: '-0.03em',
              lineHeight: 0.95,
              marginBottom: '0.75rem',
            }}>
              Welcome<br />
              <span style={{ color: C.blue }}>back.</span>
            </h1>
            <p style={{
              fontSize: '0.9375rem',
              color: C.gray,
              lineHeight: 1.5,
            }}>
              Turn your real week into Instagram scripts and LinkedIn posts.
            </p>
          </div>

          {/* Auth card */}
          <div style={{
            background: '#FFFFFF',
            border: `1px solid ${C.border}`,
            borderRadius: 0,
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '12px 20px',
                background: loading ? '#f5f5f3' : C.black,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 0,
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s linear',
                fontFamily: 'inherit',
                width: '100%',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.blue }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = C.black }}
            >
              {!loading && (
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loading ? 'Redirecting to Google...' : 'Continue with Google'}
            </button>

            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(196,43,47,0.06)',
                border: `1px solid rgba(196,43,47,0.20)`,
                fontSize: '0.8125rem',
                color: '#C42B2F',
                lineHeight: 1.4,
              }}>
                {error}
              </div>
            )}

            <p style={{ fontSize: '0.75rem', color: C.muted, textAlign: 'center', lineHeight: 1.5 }}>
              By continuing you agree to our terms. New users are set up automatically after login.
            </p>
          </div>

          {/* Bottom link */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link href="/" style={{
              fontSize: '0.8125rem',
              color: C.muted,
              textDecoration: 'none',
              letterSpacing: '0.02em',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = C.black)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >
              ← Back to Draftr
            </Link>
          </div>
        </div>
      </div>

      {/* Footer line */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        padding: '1rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>
          Draftr — by @uxabhi_
        </span>
        <span style={{ fontSize: '0.75rem', color: C.muted }}>
          New? You&apos;ll be set up after login.
        </span>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#E3E2DE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 13, color: '#7A7A7A' }}>Loading...</span>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
