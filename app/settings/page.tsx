'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { PageHeader } from '@/components/shared/PageHeader'
import { createClient } from '@/lib/supabase/client'
import { MasterDocSummary } from '@/lib/db'

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
  const [niche, setNiche] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [saved, setSaved] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')

  // Master document state
  const fileRef = useRef<HTMLInputElement>(null)
  const [docName, setDocName] = useState<string | null>(null)
  const [docSummary, setDocSummary] = useState<MasterDocSummary | null>(null)
  const [docLoading, setDocLoading] = useState(false)
  const [docError, setDocError] = useState('')
  const [docSaved, setDocSaved] = useState(false)
  const [docInitLoading, setDocInitLoading] = useState(true)

  useEffect(() => {
    try {
      setName(localStorage.getItem('ss:name') ?? '')
      setHandleInput(localStorage.getItem('ss:handle') ?? '')
      setNiche(localStorage.getItem('ss:niche') ?? '')
    } catch {}

    createClient().auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email)
    })

    // Load existing master doc context
    fetch('/api/user-context')
      .then(r => r.json())
      .then(data => {
        if (data.masterDocName) setDocName(data.masterDocName)
        if (data.masterDocSummary) setDocSummary(data.masterDocSummary)
      })
      .catch(() => {})
      .finally(() => setDocInitLoading(false))
  }, [])

  function saveProfile() {
    const handle = extractHandle(handleInput)
    if (!handle) { setError('Enter a valid handle or profile link'); return }
    setError('')
    try {
      localStorage.setItem('ss:name', name.trim())
      localStorage.setItem('ss:handle', handle)
      if (niche.trim()) localStorage.setItem('ss:niche', niche.trim())
      else localStorage.removeItem('ss:niche')
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) { setDocError('File too large — max 500KB'); return }

    setDocLoading(true)
    setDocError('')
    setDocSaved(false)

    try {
      const text = await file.text()
      const res = await fetch('/api/user-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, name: file.name }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setDocName(data.name)
      setDocSummary(data.summary)
      setDocSaved(true)
      setTimeout(() => setDocSaved(false), 3000)
    } catch (err: unknown) {
      setDocError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setDocLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function removeDoc() {
    setDocLoading(true)
    await fetch('/api/user-context', { method: 'DELETE' })
    setDocName(null)
    setDocSummary(null)
    setDocLoading(false)
  }

  const currentHandle = scan?.instagramProfile?.handle ?? scan?.handle ?? extractHandle(handleInput)

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
              placeholder="Your name"
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
              placeholder="@yourhandle or instagram.com/yourhandle"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>
              Content niche
              <span style={{ marginLeft: 6, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— used to personalise all AI outputs</span>
            </label>
            <input
              className="input"
              value={niche}
              onChange={e => setNiche(e.target.value)}
              placeholder="e.g. UX design, fitness coaching, personal finance..."
              autoComplete="off"
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

      {/* Master Document */}
      <section>
        <p className="section-label" style={{ marginBottom: 4 }}>Master Document</p>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>
          Upload your brand strategy, content brief, or account notes — Groq analyses it and uses it to personalise all content generation for your account.
        </p>
        <div className="card" style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {docInitLoading ? (
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Loading...</p>
          ) : docName && docSummary ? (
            <>
              {/* Current document */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{docName}</p>
                  <p style={{ fontSize: 11, color: 'var(--green)', marginTop: 2 }}>✓ Analysed by Groq</p>
                </div>
                <button
                  onClick={removeDoc}
                  disabled={docLoading}
                  className="btn-ghost"
                  style={{ color: 'var(--red)', fontSize: 13, width: 28, height: 28 }}
                  title="Remove document"
                >
                  ✕
                </button>
              </div>

              {/* Summary */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <SummaryRow label="Niche" value={docSummary.niche} />
                <SummaryRow label="Tone" value={docSummary.tone} />
                <SummaryRow label="Audience" value={docSummary.targetAudience} />
                {docSummary.keyTopics?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Key Topics</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {docSummary.keyTopics.map((t, i) => (
                        <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {docSummary.uniqueAngles?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Unique Angles</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {docSummary.uniqueAngles.map((a, i) => (
                        <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>→ {a}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Replace */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={docLoading}
                className="btn-secondary"
                style={{ alignSelf: 'flex-start', fontSize: 12 }}
              >
                {docLoading ? 'Analysing...' : 'Replace document'}
              </button>
            </>
          ) : (
            <>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No document uploaded yet</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Upload a .txt or .md file — your brand brief, content strategy, or account notes.
                  Groq will extract your niche, tone, key topics, and unique angles to personalise all generation.
                </p>
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={docLoading}
                className="btn-primary"
                style={{ alignSelf: 'flex-start' }}
              >
                {docLoading ? 'Analysing...' : docSaved ? '✓ Saved' : 'Upload document'}
              </button>
            </>
          )}

          {docError && <p style={{ fontSize: 12, color: 'var(--red)' }}>{docError}</p>}

          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{value}</p>
    </div>
  )
}
