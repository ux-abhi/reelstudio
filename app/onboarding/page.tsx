'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { ScanProgress } from '@/components/scan/ScanProgress'

function extractHandle(input: string): string {
  const trimmed = input.trim()
  // Accept full URL: instagram.com/handle or https://instagram.com/handle/
  const urlMatch = trimmed.match(/instagram\.com\/([a-zA-Z0-9._]+)\/?/)
  if (urlMatch) return urlMatch[1].toLowerCase()
  // Accept @handle or plain handle
  return trimmed.replace(/^@/, '').toLowerCase()
}

const FEATURES = [
  ['Account audit', 'Engagement rate, hook strength, bio score'],
  ['Content strategy', '5 pillars, 20 ideas ranked by trend score'],
  ['30-day calendar', 'Daily posts with hooks, times, and trigger words'],
  ['Trend pulse', 'Live Google Trends matched to your niche'],
  ['Priority actions', 'Your top 7 moves for the next 30 days'],
]

export default function OnboardingPage() {
  const router = useRouter()
  const { runScan, isScanning } = useScan()
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [handleInput, setHandleInput] = useState('')
  const [error, setError] = useState('')

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Enter your name'); return }
    setError('')
    setStep(2)
  }

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    const handle = extractHandle(handleInput)
    if (!handle) { setError('Enter your Instagram handle or paste your profile link'); return }
    setError('')
    try { localStorage.setItem('ss:name', name.trim()) } catch {}
    await runScan(handle)
    router.push('/dashboard')
  }

  return (
    <>
      <ScanProgress />
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-app)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
          }}
          className="page-enter"
        >
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 12,
            }}>
              Script Studio
            </p>
            <h1 style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.04em',
              lineHeight: 1.2,
              marginBottom: 8,
            }}>
              {step === 1 ? "Let's set up your workspace" : `Welcome, ${name} 👋`}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {step === 1
                ? 'Your AI-powered Instagram content command centre'
                : 'Enter your Instagram handle so we can build your personalised strategy'}
            </p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {[1, 2].map(s => (
              <div
                key={s}
                style={{
                  width: s === step ? 20 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: s === step ? 'var(--accent)' : s < step ? 'var(--accent)' : 'var(--bg-elevated)',
                  transition: 'all 240ms ease',
                }}
              />
            ))}
          </div>

          {/* Step 1: Name */}
          {step === 1 && (
            <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
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
                    Your name
                  </label>
                  <input
                    className="input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    autoFocus
                    autoComplete="given-name"
                  />
                  {error && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 6 }}>{error}</p>}
                </div>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '10px 16px', opacity: !name.trim() ? 0.5 : 1 }}
                >
                  Continue →
                </button>
              </div>

              {/* Feature list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {FEATURES.map(([title, desc]) => (
                  <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 6 }} />
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{title}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 6 }}>{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </form>
          )}

          {/* Step 2: Instagram handle */}
          {step === 2 && (
            <form onSubmit={handleScan} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
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
                    Instagram handle or profile link
                  </label>
                  <input
                    className="input"
                    value={handleInput}
                    onChange={e => setHandleInput(e.target.value)}
                    placeholder="@yourhandle or instagram.com/yourhandle"
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {error && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 6 }}>{error}</p>}
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>
                    Paste your profile link or type your handle — both work
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isScanning || !handleInput.trim()}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: 14,
                    padding: '10px 16px',
                    opacity: (isScanning || !handleInput.trim()) ? 0.5 : 1,
                    cursor: (isScanning || !handleInput.trim()) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isScanning ? 'Building your strategy...' : 'Build my strategy →'}
                </button>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', lineHeight: 1.5 }}>
                  Scrapes last 30 posts · Groq analysis · 30-day calendar — takes ~60s
                </p>
              </div>

              <button
                type="button"
                onClick={() => { setStep(1); setError('') }}
                style={{ fontSize: 12, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}
              >
                ← Back
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
