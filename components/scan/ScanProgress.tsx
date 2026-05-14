'use client'
import { useScan } from './ScanContext'

const ALL_STEPS = [
  'Reading your post data...',
  'Fetching Google Trends for your niche...',
  'Groq is analysing everything...',
  'Generating your content strategy...',
  'Building your 30-day calendar...',
]

export function ScanProgress() {
  const { isScanning, scanProgress, error } = useScan()

  if (!isScanning) return null

  return (
    <div className="scan-screen">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, width: 320, padding: '0 16px' }}>
        {/* Spinner */}
        <div style={{ position: 'relative', width: 48, height: 48 }}>
          <svg className="spin-ring" width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="var(--border-strong)" strokeWidth="3" />
            <circle cx="24" cy="24" r="20" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray="32 94" />
          </svg>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 6 }}>
            Scanning your account
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            Groq + Google Trends analysis
          </p>
        </div>

        {/* Steps */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ALL_STEPS.map((step, i) => {
            const done   = i < scanProgress.length
            const active = i === scanProgress.length
            return (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 600,
                    background: done ? 'var(--green-subtle)' : active ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                    border: `1px solid ${done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--border)'}`,
                    color: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--text-tertiary)',
                    transition: 'all 200ms ease',
                  }}
                >
                  {done ? '✓' : ''}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    color: done ? 'var(--text-primary)' : active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    transition: 'color 200ms ease',
                  }}
                >
                  {step}
                </span>
              </div>
            )
          })}
        </div>

        {error && (
          <p style={{ fontSize: 13, color: 'var(--red)', textAlign: 'center' }}>{error}</p>
        )}
      </div>
    </div>
  )
}
