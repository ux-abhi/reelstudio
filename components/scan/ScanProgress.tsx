'use client'
import { useScan } from './ScanContext'

const ALL_STEPS = [
  'Reading your post data...',
  'Fetching Google Trends for your niche...',
  'Groq is analysing everything...',
  'Generating your content strategy...',
  'Building your content calendar...',
]

export function ScanProgress() {
  const { isScanning, scanProgress, scanError, clearScanError } = useScan()

  if (!isScanning && !scanError) return null

  return (
    <div className="scan-screen">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, width: 320, padding: '0 16px' }}>

        {isScanning ? (
          <>
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
          </>
        ) : (
          /* Error state */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--red-subtle)',
              border: '1px solid rgba(229,72,77,0.30)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              color: 'var(--red)',
            }}>
              ✕
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 8 }}>
                Scan failed
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 280 }}>
                {scanError}
              </p>
            </div>
            <button
              onClick={clearScanError}
              className="btn-secondary"
              style={{ minWidth: 120 }}
            >
              Dismiss
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
