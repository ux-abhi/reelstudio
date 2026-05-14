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
    <div className="scan-overlay">
      <div className="flex flex-col items-center gap-8 max-w-sm w-full px-6">
        {/* Animated ring */}
        <div className="relative w-16 h-16">
          <svg className="spin-ring w-16 h-16" viewBox="0 0 64 64" fill="none">
            <circle
              cx="32" cy="32" r="28"
              stroke="rgba(110,106,255,0.15)"
              strokeWidth="4"
            />
            <circle
              cx="32" cy="32" r="28"
              stroke="#6e6aff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="44 132"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl">⚡</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.92)' }}>
            Scanning your account
          </p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Groq is analysing everything...
          </p>
        </div>

        {/* Steps */}
        <div className="w-full flex flex-col gap-3">
          {ALL_STEPS.map((step, i) => {
            const done = i < scanProgress.length
            const active = i === scanProgress.length

            return (
              <div key={step} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                  style={{
                    background: done
                      ? 'rgba(52,199,89,0.20)'
                      : active
                      ? 'rgba(110,106,255,0.20)'
                      : 'rgba(255,255,255,0.06)',
                    border: `0.5px solid ${done ? 'rgba(52,199,89,0.40)' : active ? 'rgba(110,106,255,0.40)' : 'rgba(255,255,255,0.10)'}`,
                  }}
                >
                  {done ? '✓' : active ? '·' : ''}
                </div>
                <span
                  className="text-sm"
                  style={{
                    color: done
                      ? 'rgba(52,199,89,0.90)'
                      : active
                      ? 'rgba(255,255,255,0.92)'
                      : 'rgba(255,255,255,0.25)',
                  }}
                >
                  {step}
                </span>
              </div>
            )
          })}
        </div>

        {error && (
          <p className="text-sm text-center" style={{ color: '#FF453A' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
