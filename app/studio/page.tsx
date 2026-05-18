'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { FormatChips } from '@/components/studio/FormatChips'
import { ToneChips } from '@/components/studio/ToneChips'
import { TrendHint } from '@/components/studio/TrendHint'
import { ScriptOutput } from '@/components/studio/ScriptOutput'
import { PageHeader } from '@/components/shared/PageHeader'

const FALLBACK_HOOKS = [
  "I don't know how this Figma plugin is still free",
  "Every Indian designer posting 'AI will replace you' — let's talk",
  "Your portfolio isn't landing interviews and it's not because your work is bad",
  "I built this at 2am and it saved me 4 hours the next morning",
  "Main ye soch raha tha ki ye kaise kaam karta hai — phir maine banaya",
  "Stop putting Figma under Technical Skills in your portfolio",
]

function StudioContent() {
  const searchParams = useSearchParams()
  const { scan } = useScan()
  const [format, setFormat] = useState('Reel 30–45s')
  const [tone, setTone] = useState('Casual')
  const [idea, setIdea] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const param = searchParams.get('idea')
    if (param) setIdea(decodeURIComponent(param))
  }, [searchParams])

  const hooks = scan?.hooks?.slice(0, 6) ?? []
  const displayHooks = hooks.length > 0 ? hooks.map(h => h.text) : FALLBACK_HOOKS
  const trendingKeywords = scan?.trendPulse?.filter(t => t.direction === 'rising' || t.breakout).map(t => t.keyword).slice(0, 5).join(', ') ?? ''
  const recentPosts = scan?.posts?.slice(0, 5).map(p => p.topic).join(', ') ?? ''
  const triggerWords = scan?.triggerWords?.map(t => t.word).join(', ') ?? 'FRAMER, TOOLS, PORTFOLIO'

  async function callGroq(promptType: 'full' | 'hooks' | 'caption') {
    if (!idea.trim()) return
    setLoading(true); setError(null); setOutput(''); setSaved(false)
    try {
      let prompt = ''
      if (promptType === 'full') {
        prompt = `You are writing an Instagram script for @uxabhi_ — Abhishek Jha.
PROFILE: UX designer + HCI master's student in Germany. Indian designer in Europe. Speaks Hindi/Hinglish naturally.
TONE: ${tone} — like texting a design friend, never presenting to a crowd.
FORMAT: ${format}
CURRENTLY TRENDING: ${trendingKeywords || 'figma, framer, ai design tools'}
RECENT POSTS (don't repeat): ${recentPosts}
VIRAL FORMULA: Result shown first → practical shortcut revealed → comment trigger or save CTA.
RAW IDEA: ${idea}
Write the complete script:
[HOOK] — scroll-stopping first line, no "Hey guys", no slow intro
[BODY] — punchy, natural pacing, every sentence earns its place
[CTA] — comment trigger ("Comment 'X' and I'll DM you") OR save prompt
Return script only. No explanation.`
      } else if (promptType === 'hooks') {
        prompt = `Write 3 Instagram hooks for @uxabhi_ (UX designer, HCI master's Germany, Indian in Europe).
Trending: ${trendingKeywords || 'figma, framer, ai tools'}
Topic: ${idea}
[CURIOSITY] — creates open loop
[RELATABLE] — calls out a pain they've felt
[HOT-TAKE] — controversial claim
Each hook works in 2 seconds. No greetings. Sound like Abhishek texting a friend.`
      } else {
        prompt = `Write an Instagram caption for @uxabhi_ (UX designer, HCI master's Germany).
Format: ${format}. Trending: ${trendingKeywords}. Triggers: ${triggerWords}.
Topic: ${idea}
Opens punchy (no greeting). Includes comment trigger if relevant. Ends with SAVE prompt or question.
7-10 hashtags from: #figmatips #figmadesign #framerwebsite #uxtools #designtools #uxstudent #uxportfolio #indiandesigner #designineurope #uxcareer
Return only the caption.`
      }
      const res = await fetch('/api/groq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, maxTokens: 1500 }) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setOutput(data.text)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!output) return
    setIsSaving(true)
    const hookMatch = output.match(/\[HOOK\]([\s\S]*?)(?=\[BODY\]|$)/)
    const hookLine = hookMatch?.[1]?.trim().split('\n')[0] ?? output.split('\n')[0]
    try {
      await fetch('/api/scripts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ format, tone, pillar: '', input: idea, output, hookLine }) })
      setSaved(true)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title="Script Studio" subtitle="Write, rewrite, and hook any content idea" />

      {/* Split panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left — Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <FieldLabel>Format</FieldLabel>
            <FormatChips selected={format} onChange={setFormat} />
          </div>
          <div>
            <FieldLabel>Tone</FieldLabel>
            <ToneChips selected={tone} onChange={setTone} />
          </div>
          <div>
            <FieldLabel>Your idea</FieldLabel>
            <textarea
              className="input"
              rows={5}
              value={idea}
              onChange={e => setIdea(e.target.value)}
              placeholder="Drop your raw idea, bullet points, or messy notes here..."
            />
            <div style={{ marginTop: 8 }}><TrendHint idea={idea} /></div>
          </div>

          {/* Quick inject */}
          <div>
            <FieldLabel>Quick inject</FieldLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {displayHooks.slice(0, 6).map((hook, i) => (
                <button
                  key={i}
                  onClick={() => setIdea(hook)}
                  style={{
                    textAlign: 'left',
                    fontSize: 12,
                    padding: '8px 12px',
                    borderRadius: 7,
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                    fontFamily: 'inherit',
                    lineHeight: 1.4,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
                >
                  {hook}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => callGroq('full')} disabled={loading || !idea.trim()} className="btn-primary" style={{ width: '100%' }}>
              {loading ? 'Writing...' : 'Rewrite & Hook It'}
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button onClick={() => callGroq('hooks')} disabled={loading || !idea.trim()} className="btn-secondary" style={{ fontSize: 12 }}>
                3 Hooks Only
              </button>
              <button onClick={() => callGroq('caption')} disabled={loading || !idea.trim()} className="btn-secondary" style={{ fontSize: 12 }}>
                Write Caption
              </button>
            </div>
          </div>
        </div>

        {/* Right — Output */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '20px',
            minHeight: 420,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ position: 'relative', width: 32, height: 32 }}>
                <svg className="spin-ring" width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="12" stroke="var(--border-strong)" strokeWidth="3" />
                  <circle cx="16" cy="16" r="12" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray="20 56" />
                </svg>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Groq is writing...</p>
            </div>
          )}
          {error && !loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <p style={{ fontSize: 13, color: 'var(--red)' }}>{error}</p>
              <button onClick={() => callGroq('full')} className="btn-secondary" style={{ fontSize: 12 }}>Retry</button>
            </div>
          )}
          {!loading && !error && !output && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center' }}>Your script will appear here</p>
            </div>
          )}
          {!loading && !error && output && (
            <ScriptOutput output={output} onSave={handleSave} isSaving={isSaving} saved={saved} />
          )}
        </div>
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 8 }}>
      {children}
    </p>
  )
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Loading...</div>}>
      <StudioContent />
    </Suspense>
  )
}
