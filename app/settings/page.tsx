'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { PageHeader } from '@/components/shared/PageHeader'
import { createClient } from '@/lib/supabase/client'

function extractHandle(input: string): string {
  const trimmed = input.trim()
  const urlMatch = trimmed.match(/instagram\.com\/([a-zA-Z0-9._]+)\/?/)
  if (urlMatch) return urlMatch[1].toLowerCase()
  return trimmed.replace(/^@/, '').toLowerCase()
}

export default function SettingsPage() {
  const router = useRouter()
  const { scan, runScan, isScanning } = useScan()
  const [name, setName] = useState('')
  const [handleInput, setHandleInput] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [saved, setSaved] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      setName(localStorage.getItem('ss:name') ?? '')
      setHandleInput(localStorage.getItem('ss:handle') ?? '')
    } catch {}

    createClient().auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email)
    })
  }, [])

  function saveProfile() {
    const handle = extractHandle(handleInput)
    if (!handle) { setError('Enter a valid handle or profile link'); return }
    setError('')
    try {
      localStorage.setItem('ss:name', name.trim())
      localStorage.setItem('ss:handle', handle)
    } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function reScan() {
    const handle = extractHandle(handleInput)
    if (!handle) { setError('Save a handle first'); return }
    setScanning(true)
    setError('')
    await runScan(handle, true)
    setScanning(false)
    router.push('/dashboard')
  }

  const currentHandle = scan?.instagramProfile?.handle ?? scan?.handle ?? localStorage.getItem?.('ss:handle') ?? ''

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageHeader title="Settings" subtitle="Manage your profile and workspace" />

      {/* Profile */}
      <section>
        <p className="section-label" style={{ marginBottom: 16 }}>Profile</p>
        <div className="card" style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {userEmail && (
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>Google account</label>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{userEmail}</p>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>
              Your name
            </label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Abhishek"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>
              Instagram handle or profile link
            </label>
            <input
              className="input"
              value={handleInput}
              onChange={e => setHandleInput(e.target.value)}
              placeholder="@uxabhi_ or instagram.com/uxabhi_"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {error && <p style={{ fontSize: 12, color: 'var(--red)' }}>{error}</p>}

          <button
            onClick={saveProfile}
            className="btn-primary"
            style={{ alignSelf: 'flex-start' }}
          >
            {saved ? '✓ Saved' : 'Save changes'}
          </button>
        </div>
      </section>

      {/* Scan */}
      <section>
        <p className="section-label" style={{ marginBottom: 16 }}>Scan</p>
        <div className="card" style={{ maxWidth: 480 }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Re-scan your account</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Forces a fresh scrape of your Instagram data and rebuilds your full strategy. Takes ~60 seconds.
              {currentHandle && (
                <span style={{ color: 'var(--text-tertiary)' }}> Will scan <strong style={{ color: 'var(--text-primary)' }}>@{currentHandle}</strong>.</span>
              )}
            </p>
          </div>
          <button
            onClick={reScan}
            disabled={isScanning || scanning || !handleInput.trim()}
            className="btn-secondary"
            style={{ opacity: (isScanning || scanning || !handleInput.trim()) ? 0.5 : 1, cursor: (isScanning || scanning || !handleInput.trim()) ? 'not-allowed' : 'pointer' }}
          >
            {isScanning || scanning ? 'Scanning...' : 'Run new scan →'}
          </button>
        </div>
      </section>

      {/* Danger zone */}
      <section>
        <p className="section-label" style={{ marginBottom: 16 }}>Account</p>
        <div className="card" style={{ maxWidth: 480 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Sign out</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>You&apos;ll be redirected to the login page.</p>
          <button
            onClick={async () => {
              await createClient().auth.signOut()
              router.push('/login')
            }}
            className="btn-secondary"
            style={{ borderColor: 'rgba(229,72,77,0.25)', color: 'var(--red)' }}
          >
            Sign out
          </button>
        </div>
      </section>
    </div>
  )
}
