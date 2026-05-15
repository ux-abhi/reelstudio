'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { ScanProgress } from '@/components/scan/ScanProgress'

export default function OnboardingPage() {
  const router = useRouter()
  const { runScan, isScanning } = useScan()
  const [handle, setHandle] = useState('uxabhi_')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clean = handle.replace('@', '').trim()
    if (!clean) { setError('Enter your Instagram handle'); return }
    setError('')
    await runScan(clean)
    router.push('/dashboard')
  }

  return (
    <>
      <ScanProgress />
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '80px 16px 48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
        }}
        className="page-enter"
      >
        {/* Logo / heading */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 12 }}>
            @uxabhi_ Studio
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 10 }}>
            Your AI Instagram<br />command centre
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Enter your handle. Apify scrapes your real data.<br />
            Groq builds your full strategy in 60 seconds.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>
              Instagram handle
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 14, color: 'var(--text-tertiary)', pointerEvents: 'none',
              }}>
                @
              </span>
              <input
                className="input"
                style={{ paddingLeft: 28, fontSize: 15 }}
                value={handle}
                onChange={e => setHandle(e.target.value.replace('@', ''))}
                placeholder="uxabhi_"
                autoFocus
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            {error && (
              <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 6 }}>{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isScanning || !handle.trim()}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: 14,
              padding: '10px 16px',
              opacity: (isScanning || !handle.trim()) ? 0.5 : 1,
              cursor: (isScanning || !handle.trim()) ? 'not-allowed' : 'pointer',
            }}
          >
            {isScanning ? 'Running scan...' : 'Run my scan →'}
          </button>

          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', lineHeight: 1.5 }}>
            Scrapes your last 30 posts · Analyses with Groq · Builds a 30-day calendar
          </p>
        </form>

        {/* What you get */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['Account audit', 'Engagement rate, hook strength, bio score'],
            ['Content strategy', '5 pillars, 20 ideas ranked by trend score'],
            ['30-day calendar', 'Daily posts with hooks, times, and CTA type'],
            ['Trend pulse', 'Live Google Trends matched to your niche'],
            ['Priority actions', '7 high-impact moves for the next 30 days'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 6 }} />
              <div>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{title}</span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 6 }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
