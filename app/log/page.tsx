'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { PageHeader } from '@/components/shared/PageHeader'
import type { LogTimeframe, InstagramLogPost, LinkedInLogPost, LogResult } from '@/types/log'

// ── Prompt nudges ──────────────────────────────────────────────────────────────

const NUDGES = [
  'What did you ship, finish, or make progress on?',
  'What did you learn or realise?',
  'Any wins, milestones, or decisions made?',
  'What challenged or surprised you?',
]

const FORMAT_COLOR: Record<string, string> = {
  Reel:           'var(--accent)',
  Carousel:       'var(--green)',
  'Talking Head': 'var(--red)',
}

const LI_TYPE_COLOR: Record<string, string> = {
  story:    'var(--accent)',
  insight:  'var(--green)',
  progress: 'var(--yellow)',
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function LogPage() {
  const { scan } = useScan()
  const router = useRouter()

  const [timeframe, setTimeframe] = useState<LogTimeframe>('week')
  const [input, setInput] = useState('')
  const [platform, setPlatform] = useState<'instagram' | 'linkedin'>('instagram')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LogResult | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [expandedImg, setExpandedImg] = useState<number | null>(null)

  const [who, setWho] = useState('')
  const [niche, setNiche] = useState('')
  const [brandContext, setBrandContext] = useState('')

  // Restore draft and identity on mount / scan change
  useEffect(() => {
    try {
      const n = localStorage.getItem('ss:niche') ?? ''
      const name = localStorage.getItem('ss:name') ?? ''
      const handle = scan?.instagramProfile?.handle ?? scan?.handle ?? ''
      setNiche(n)
      setWho(handle ? `@${handle}${n ? ` — ${n}` : ''}` : n || name || 'content creator')
    } catch {}
    fetch('/api/user-context')
      .then(r => r.json())
      .then(d => {
        if (d.masterDocSummary) {
          const m = d.masterDocSummary
          setBrandContext(`niche=${m.niche}, tone=${m.tone}, audience=${m.targetAudience}`)
        }
      })
      .catch(() => {})
  }, [scan])

  // Restore log draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ss:log:draft')
      if (saved) setInput(saved)
    } catch {}
  }, [])

  // Auto-save draft as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (input) localStorage.setItem('ss:log:draft', input)
        else localStorage.removeItem('ss:log:draft')
      } catch {}
    }, 800)
    return () => clearTimeout(timer)
  }, [input])

  async function generate() {
    if (!input.trim()) { setError('Tell me what happened first'); return }
    setLoading(true); setError(null); setResult(null)
    const trendingKeywords = scan?.trendPulse
      ?.filter(t => t.breakout || t.direction === 'rising')
      .slice(0, 4)
      .map(t => t.keyword)
      .join(', ')

    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput: input, timeframe, who, brandContext: brandContext || undefined, niche: niche || undefined, trendingKeywords: trendingKeywords || undefined }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data as LogResult)
      try { localStorage.removeItem('ss:log:draft') } catch {} // Clear saved draft — it's been used
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  async function saveScript(id: string, payload: {
    format: string; tone: string; output: string; hookLine: string
  }) {
    if (saved[id] || saving === id) return
    setSaving(id)
    try {
      const res = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, input: input.slice(0, 300), pillar: '' }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(s => ({ ...s, [id]: true }))
    } catch {
      // Mark as save-failed so button re-enables
      setSaving(null)
    } finally {
      setSaving(null)
    }
  }

  const instagramPosts = result?.instagram ?? []
  const linkedinPosts  = result?.linkedin  ?? []

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        label="Create"
        title="Life Log"
        subtitle="Tell me what happened — get Instagram scripts and LinkedIn posts in your voice"
      />

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── LEFT — Input ── */}
        <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Timeframe toggle */}
          <div>
            <p className="section-label" style={{ marginBottom: 8 }}>Timeframe</p>
            <div className="segmented" style={{ width: '100%' }}>
              {(['day', 'week'] as const).map(t => (
                <button
                  key={t}
                  className={`segment${timeframe === t ? ' active' : ''}`}
                  style={{ flex: 1 }}
                  onClick={() => { setTimeframe(t); setResult(null) }}
                >
                  {t === 'day' ? 'Today' : 'This Week'}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p className="section-label">
                What happened {timeframe === 'day' ? 'today' : 'this week'}?
              </p>
              <span style={{ fontSize: 11, color: input.length > 900 ? 'var(--red)' : 'var(--text-tertiary)', fontWeight: input.length > 900 ? 600 : 400 }}>
                {input.length}/1000
              </span>
            </div>
            <textarea
              className="input"
              maxLength={1000}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Just dump it — rough notes are fine.\n\nE.g. "Finished the design system sprint, got feedback from the client, realised the component naming was inconsistent..."`}
              style={{ minHeight: 180, resize: 'vertical', fontSize: 13 }}
            />
          </div>

          {/* Nudges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {NUDGES.map((nudge, i) => (
              <button
                key={i}
                onClick={() => setInput(p => p ? `${p}\n${nudge} ` : `${nudge} `)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '7px 10px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 7,
                  cursor: 'pointer',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  transition: 'all 120ms ease',
                  lineHeight: 1.4,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>+</span>
                {nudge}
              </button>
            ))}
          </div>

          {error && (
            <p style={{ fontSize: 12, color: 'var(--red)', padding: '8px 12px', background: 'var(--red-subtle)', border: '1px solid rgba(229,72,77,0.2)', borderRadius: 7 }}>
              {error}
            </p>
          )}

          <button
            onClick={generate}
            disabled={loading || !input.trim()}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: 14 }}
          >
            {loading ? 'Generating...' : `Generate content →`}
          </button>

          {loading && (
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center' }}>
              {timeframe === 'week' ? 'Building 3 Instagram + 3 LinkedIn posts...' : 'Building your posts...'}
            </p>
          )}
        </div>

        {/* ── RIGHT — Output ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Platform tabs */}
          <div className="segmented" style={{ alignSelf: 'flex-start' }}>
            <button
              className={`segment${platform === 'instagram' ? ' active' : ''}`}
              onClick={() => setPlatform('instagram')}
            >
              Instagram
            </button>
            <button
              className={`segment${platform === 'linkedin' ? ' active' : ''}`}
              onClick={() => setPlatform('linkedin')}
            >
              LinkedIn
            </button>
          </div>

          {/* Empty / skeleton state */}
          {!result && !loading && (
            <div style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 10,
            }}>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                {timeframe === 'day'
                  ? 'Tell me what happened today and I\'ll turn it into 1 Instagram post and 1 LinkedIn post.'
                  : 'Tell me what happened this week and I\'ll generate 3 Instagram scripts and 3 LinkedIn posts.'}
              </p>
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, timeframe === 'week' ? 3 : null].filter(Boolean).map(i => (
                <div key={i} className="skeleton" style={{ height: 140, borderRadius: 10 }} />
              ))}
            </div>
          )}

          {/* Instagram output */}
          {result && platform === 'instagram' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {instagramPosts.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No Instagram posts generated.</p>
              )}
              {instagramPosts.map((post, i) => (
                <InstagramCard
                  key={i}
                  post={post}
                  onWriteThis={() => router.push(`/studio?idea=${encodeURIComponent(post.hook)}`)}
                  onCopy={() => copyText(`[HOOK]\n${post.hook}\n\n[BODY]\n${post.body}\n\n[CTA]\n${post.cta}`, `ig-${i}`)}
                  onSave={() => saveScript(`ig-${i}`, {
                    format: post.format,
                    tone: 'Casual',
                    output: `[HOOK]\n${post.hook}\n\n[BODY]\n${post.body}\n\n[CTA]\n${post.cta}`,
                    hookLine: post.hook,
                  })}
                  copied={copied === `ig-${i}`}
                  saved={saved[`ig-${i}`] ?? false}
                  saving={saving === `ig-${i}`}
                />
              ))}
            </div>
          )}

          {/* LinkedIn output */}
          {result && platform === 'linkedin' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {linkedinPosts.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No LinkedIn posts generated.</p>
              )}
              {linkedinPosts.map((post, i) => (
                <LinkedInCard
                  key={i}
                  post={post}
                  imgExpanded={expandedImg === i}
                  onToggleImg={() => setExpandedImg(expandedImg === i ? null : i)}
                  onCopyPost={() => copyText(`${post.hook}\n\n${post.body}\n\n${post.cta}\n\n${post.hashtags.join(' ')}`, `li-${i}`)}
                  onCopyImg={() => copyText(post.imagePrompt.prompt, `li-img-${i}`)}
                  onSave={() => saveScript(`li-${i}`, {
                    format: 'LinkedIn Post',
                    tone: 'Professional',
                    output: `${post.hook}\n\n${post.body}\n\n${post.cta}\n\n${post.hashtags.join(' ')}`,
                    hookLine: post.hook,
                  })}
                  copiedPost={copied === `li-${i}`}
                  copiedImg={copied === `li-img-${i}`}
                  saved={saved[`li-${i}`] ?? false}
                  saving={saving === `li-${i}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Instagram card ─────────────────────────────────────────────────────────────

function InstagramCard({ post, onWriteThis, onCopy, onSave, copied, saved, saving }: {
  post: InstagramLogPost
  onWriteThis: () => void
  onCopy: () => void
  onSave: () => void
  copied: boolean
  saved: boolean
  saving: boolean
}) {
  const fmtColor = FORMAT_COLOR[post.format] ?? 'var(--text-tertiary)'
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: fmtColor, background: `${fmtColor}18`, border: `1px solid ${fmtColor}30`,
          borderRadius: 4, padding: '2px 7px',
        }}>
          {post.format}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flex: 1 }}>{post.basedOn}</span>
      </div>

      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 6 }}>
          {post.title}
        </p>
        <p style={{ fontSize: 13, color: 'var(--accent-hover)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 8 }}>
          &ldquo;{post.hook}&rdquo;
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>{post.body}</p>
        <p style={{ fontSize: 12, color: 'var(--yellow)', fontWeight: 500 }}>{post.cta}</p>
      </div>

      {post.caption && (
        <div style={{ padding: '8px 10px', background: 'var(--bg-subtle)', borderRadius: 6, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Caption preview</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{post.caption}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onWriteThis} className="btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}>
          Write this →
        </button>
        <button onClick={onCopy} className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>
          {copied ? 'Copied ✓' : 'Copy script'}
        </button>
        <button
          onClick={onSave}
          disabled={saved || saving}
          className="btn-secondary"
          style={{ fontSize: 12, padding: '6px 14px', marginLeft: 'auto', color: saved ? 'var(--green)' : undefined, borderColor: saved ? 'rgba(48,164,108,0.3)' : undefined }}
        >
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>
    </div>
  )
}

// ── LinkedIn card ──────────────────────────────────────────────────────────────

function LinkedInCard({ post, imgExpanded, onToggleImg, onCopyPost, onCopyImg, onSave, copiedPost, copiedImg, saved, saving }: {
  post: LinkedInLogPost
  imgExpanded: boolean
  onToggleImg: () => void
  onCopyPost: () => void
  onCopyImg: () => void
  onSave: () => void
  copiedPost: boolean
  copiedImg: boolean
  saved: boolean
  saving: boolean
}) {
  const typeColor = LI_TYPE_COLOR[post.type] ?? 'var(--text-tertiary)'
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: typeColor, background: `${typeColor}18`, border: `1px solid ${typeColor}30`,
          borderRadius: 4, padding: '2px 7px',
        }}>
          {post.type}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>LinkedIn post</span>
      </div>

      {/* Post content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
          {post.hook}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {post.body}
        </p>
        {post.cta && (
          <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{post.cta}</p>
        )}
        {post.hashtags.length > 0 && (
          <p style={{ fontSize: 11, color: 'var(--accent-hover)' }}>{post.hashtags.join(' ')}</p>
        )}
      </div>

      {/* Image prompt section — LinkedIn only */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
        <button
          onClick={onToggleImg}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'inherit',
            width: '100%',
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
            🎨 Image Prompt
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 4 }}>
            {post.imagePrompt.worksWellWith.join(' · ')}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-tertiary)' }}>
            {imgExpanded ? '↑' : '↓'}
          </span>
        </button>

        {imgExpanded && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              padding: '10px 12px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 7,
              fontFamily: 'monospace',
              fontSize: 12,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}>
              {post.imagePrompt.prompt}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                {post.imagePrompt.aspectRatio} · Works with {post.imagePrompt.worksWellWith.join(', ')}
              </span>
              <button onClick={onCopyImg} className="btn-secondary" style={{ fontSize: 11, padding: '4px 10px', marginLeft: 'auto' }}>
                {copiedImg ? 'Copied ✓' : 'Copy prompt'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onCopyPost} className="btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}>
          {copiedPost ? 'Copied ✓' : 'Copy post'}
        </button>
        <button
          onClick={onSave}
          disabled={saved || saving}
          className="btn-secondary"
          style={{ fontSize: 12, padding: '6px 14px', color: saved ? 'var(--green)' : undefined, borderColor: saved ? 'rgba(48,164,108,0.3)' : undefined }}
        >
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save to board'}
        </button>
      </div>
    </div>
  )
}
