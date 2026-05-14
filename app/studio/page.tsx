'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { FormatChips } from '@/components/studio/FormatChips'
import { ToneChips } from '@/components/studio/ToneChips'
import { TrendHint } from '@/components/studio/TrendHint'
import { ScriptOutput } from '@/components/studio/ScriptOutput'

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

  const trendingKeywords = scan?.trendPulse
    ?.filter(t => t.direction === 'rising' || t.breakout)
    .map(t => t.keyword).slice(0, 5).join(', ') ?? ''

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
        prompt = `Write 3 Instagram hooks for @uxabhi_ (Abhishek Jha — UX designer, HCI master's Germany, Indian in Europe).
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

      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 1500 }),
      })
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
      await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, tone, pillar: '', input: idea, output, hookLine }),
      })
      setSaved(true)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page-enter flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.92)' }}>Script Studio</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>Write, rewrite, and hook any content idea</p>
        <hr className="divider mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Input */}
        <div className="flex flex-col gap-5">
          <div>
            <Label>Format</Label>
            <FormatChips selected={format} onChange={setFormat} />
          </div>
          <div>
            <Label>Tone</Label>
            <ToneChips selected={tone} onChange={setTone} />
          </div>
          <div>
            <Label>Your idea</Label>
            <textarea
              className="input"
              rows={5}
              value={idea}
              onChange={e => setIdea(e.target.value)}
              placeholder="Drop your raw idea, bullet points, or messy notes here..."
            />
            <div className="mt-2"><TrendHint idea={idea} /></div>
          </div>

          {/* Quick inject */}
          <div>
            <Label>Quick inject hooks</Label>
            <div className="flex flex-col gap-1.5">
              {displayHooks.slice(0, 6).map((hook, i) => (
                <button
                  key={i}
                  onClick={() => setIdea(hook)}
                  className="text-left text-xs px-3 py-2 rounded-lg transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)', border: '0.5px solid rgba(255,255,255,0.08)' }}
                >
                  {hook}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => callGroq('full')}
              disabled={loading || !idea.trim()}
              className="py-2.5 rounded-full text-sm font-medium transition-all"
              style={{ background: loading ? 'rgba(110,106,255,0.30)' : '#6e6aff', color: '#fff' }}
            >
              {loading ? 'Writing...' : 'Rewrite & Hook It'}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => callGroq('hooks')} disabled={loading || !idea.trim()} className="py-2 rounded-full text-sm font-medium transition-all" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.70)', border: '0.5px solid rgba(255,255,255,0.12)' }}>
                3 Hooks Only
              </button>
              <button onClick={() => callGroq('caption')} disabled={loading || !idea.trim()} className="py-2 rounded-full text-sm font-medium transition-all" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.70)', border: '0.5px solid rgba(255,255,255,0.12)' }}>
                Write Caption
              </button>
            </div>
          </div>
        </div>

        {/* Right — Output */}
        <div className="rounded-2xl p-5 min-h-64 flex flex-col" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 relative">
                  <svg className="spin-ring w-8 h-8" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="12" stroke="rgba(110,106,255,0.20)" strokeWidth="3" />
                    <circle cx="16" cy="16" r="12" stroke="#6e6aff" strokeWidth="3" strokeLinecap="round" strokeDasharray="20 56" />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>Groq is writing...</p>
              </div>
            </div>
          )}
          {error && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <p className="text-sm" style={{ color: '#FF453A' }}>{error}</p>
              <button onClick={() => callGroq('full')} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,69,58,0.12)', color: '#FF453A' }}>Retry</button>
            </div>
          )}
          {!loading && !error && !output && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.20)' }}>Your script will appear here</p>
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

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{children}</p>
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="page-enter"><p style={{ color: 'rgba(255,255,255,0.40)' }}>Loading...</p></div>}>
      <StudioContent />
    </Suspense>
  )
}
