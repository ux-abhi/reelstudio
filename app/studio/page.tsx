'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { FormatChips } from '@/components/studio/FormatChips'
import { ToneChips } from '@/components/studio/ToneChips'
import { TrendHint } from '@/components/studio/TrendHint'
import { ScriptOutput } from '@/components/studio/ScriptOutput'
import { PageHeader } from '@/components/shared/PageHeader'
import { parseScript } from '@/lib/scriptUtils'
import {
  buildInstagramScriptPrompt,
  buildInstagramHooksPrompt,
  buildInstagramCaptionPrompt,
  buildInstagramSectionRegenPrompt,
  buildInstagramVariantsPrompt,
  instagramGroqPayload,
} from '@/lib/prompts/contentWriter'

type Language = 'English' | 'Hinglish' | 'Hindi'

const LANGUAGES: Language[] = ['English', 'Hinglish', 'Hindi']

const LANG_INSTRUCTION: Record<Language, string> = {
  English:  'Write entirely in English. Casual and direct — never stiff, never a brand voice.',
  Hinglish: 'Write in Hinglish — mix Hindi and English naturally. Use Devanagari words in Roman script. Never force it; let it flow.',
  Hindi:    'Write primarily in Hindi using Devanagari script. Keep minimal English only for technical terms. Make it feel natural, not translated.',
}

const FALLBACK_HOOKS = [
  "I can't believe this tool is still free",
  "Nobody talks about this part of the process honestly",
  "Your content isn't landing and it's not what you think",
  "I built this at 2am and it saved me 4 hours the next day",
  "The one thing nobody tells you when you're starting out",
  "Stop doing this if you want people to watch past 3 seconds",
]

interface DocSummary { niche: string; tone: string; targetAudience: string; keyTopics: string[]; uniqueAngles: string[] }

function StudioContent() {
  const searchParams = useSearchParams()
  const { scan } = useScan()
  const [format, setFormat] = useState('Reel 30–45s')
  const [tone, setTone] = useState('Casual')
  const [language, setLanguage] = useState<Language>('English')
  const [idea, setIdea] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [masterDoc, setMasterDoc] = useState<DocSummary | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [sectionLoading, setSectionLoading] = useState<'hook' | 'body' | 'cta' | null>(null)
  const [regenError, setRegenError] = useState<string | null>(null)
  const [variantError, setVariantError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [variants, setVariants] = useState<string[]>([])
  const [variantsLoading, setVariantsLoading] = useState(false)

  useEffect(() => {
    const param = searchParams.get('idea')
    if (param) setIdea(decodeURIComponent(param))
  }, [searchParams])

  useEffect(() => {
    fetch('/api/user-context')
      .then(r => r.json())
      .then(data => { if (data.masterDocSummary) setMasterDoc(data.masterDocSummary) })
      .catch(() => {})
  }, [])

  const hooks = scan?.hooks?.slice(0, 6) ?? []
  const displayHooks = hooks.length > 0 ? hooks.map(h => h.text) : FALLBACK_HOOKS
  const trendingKeywords = scan?.trendPulse?.filter(t => t.direction === 'rising' || t.breakout).map(t => t.keyword).slice(0, 5).join(', ') ?? ''
  const recentPosts = scan?.posts?.slice(0, 5).map(p => p.topic).join(', ') ?? ''
  const triggerWords = scan?.triggerWords?.map(t => t.word).join(', ') ?? 'TOOLS, TEMPLATE, RESOURCE'

  const userHandle = scan?.instagramProfile?.handle ?? scan?.handle ?? ''
  const userBio = scan?.instagramProfile?.bio ?? masterDoc?.targetAudience ?? ''
  const userNiche = masterDoc?.niche
    ?? (typeof window !== 'undefined' ? localStorage.getItem('ss:niche') : null)
    ?? scan?.pillars?.slice(0, 2).map(p => p.name).join(', ')
    ?? 'content creator'
  const hashtags = [
    ...(scan?.hashtagClusters?.primary ?? []),
    ...(scan?.hashtagClusters?.secondary ?? []),
    ...(scan?.hashtagClusters?.niche ?? []),
  ].slice(0, 20).map(h => `#${h}`).join(' ')
  const who = userHandle ? `@${userHandle} — ${userNiche}` : userNiche
  const docContext = masterDoc
    ? `Brand context: niche=${masterDoc.niche}, tone=${masterDoc.tone}, audience=${masterDoc.targetAudience}, topics=${masterDoc.keyTopics?.join(', ')}`
    : ''

  function pushToHistory(text: string) {
    if (!text) return
    setHistory(prev => [text, ...prev].slice(0, 5))
  }

  async function callGroq(promptType: 'full' | 'hooks' | 'caption') {
    if (!idea.trim()) return
    if (output) pushToHistory(output)
    setLoading(true); setError(null); setOutput(''); setSaved(false)
    const langInstruction = LANG_INSTRUCTION[language]
    try {
      let payload: { prompt: string; systemPrompt: string; maxTokens: number }
      const baseCtx = {
        who, bio: userBio, brandContext: docContext,
        trendingKeywords: trendingKeywords || undefined,
        recentPostTopics: recentPosts || undefined,
        topHooks: scan?.hooks?.slice(0, 4).map(h => h.text),
        triggerWords: triggerWords || undefined,
        hashtags: hashtags || undefined,
        language: langInstruction,
        tone, format, idea,
      }
      if (promptType === 'full') {
        payload = instagramGroqPayload(buildInstagramScriptPrompt(baseCtx), 1600)
      } else if (promptType === 'hooks') {
        payload = instagramGroqPayload(buildInstagramHooksPrompt(baseCtx), 600)
      } else {
        payload = instagramGroqPayload(buildInstagramCaptionPrompt(baseCtx), 800)
      }
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  async function regenSection(section: 'hook' | 'body' | 'cta') {
    setSectionLoading(section)
    setRegenError(null)
    const parts = parseScript(output)
    const sectionText = parts[section]
    const regenPrompt = buildInstagramSectionRegenPrompt(
      section, sectionText, idea, format, tone, LANG_INSTRUCTION[language], who, docContext
    )
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instagramGroqPayload(regenPrompt, 400)),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const newText = data.text.trim()
      if (!newText) throw new Error('Got empty response — try again')
      pushToHistory(output)
      const rebuilt = [
        '[HOOK]', section === 'hook' ? newText : parts.hook,
        '[BODY]', section === 'body' ? newText : parts.body,
        '[CTA]',  section === 'cta'  ? newText : parts.cta,
      ].join('\n')
      setOutput(rebuilt)
    } catch (e: unknown) {
      setRegenError(e instanceof Error ? e.message : `Failed to rewrite ${section}`)
    } finally {
      setSectionLoading(null)
    }
  }

  async function generateVariants() {
    if (!idea.trim()) return
    setVariantsLoading(true)
    setVariants([])
    setVariantError(null)
    try {
      const variantsPrompt = buildInstagramVariantsPrompt(idea, format, tone, who, docContext, trendingKeywords)
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instagramGroqPayload(variantsPrompt, 350)),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const lines = (data.text as string).split('\n').filter(l => /^\d+\./.test(l.trim()))
      const parsed = lines.map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)
      if (parsed.length === 0) throw new Error('No hook variants returned — try again')
      setVariants(parsed)
    } catch (e: unknown) {
      setVariantError(e instanceof Error ? e.message : 'Variant generation failed')
    } finally {
      setVariantsLoading(false)
    }
  }

  async function handleSave() {
    if (!output) return
    setIsSaving(true)
    setSaveError(null)
    setSaved(false)
    const hookMatch = output.match(/\[HOOK\]([\s\S]*?)(?=\[BODY\]|$)/)
    const hookLine = hookMatch?.[1]?.trim().split('\n')[0] ?? output.split('\n')[0]
    try {
      const res = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, tone, pillar: '', input: idea, output, hookLine }),
      })
      if (!res.ok) throw new Error('Failed to save — try again')
      setSaved(true)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  function selectHistory(text: string) {
    pushToHistory(output)
    setOutput(text)
    setHistory(prev => prev.filter(h => h !== text))
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader label="Create" title="Studio" subtitle="Write, rewrite, and hook any content idea" />

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

          {/* Language tabs */}
          <div>
            <FieldLabel>Language</FieldLabel>
            <div className="segmented" style={{ width: '100%' }}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`segment${language === lang ? ' active' : ''}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <FieldLabel>Your idea</FieldLabel>
              <span style={{ fontSize: 11, color: idea.length > 450 ? 'var(--red)' : 'var(--text-tertiary)', fontWeight: idea.length > 450 ? 600 : 400 }}>
                {idea.length}/500
              </span>
            </div>
            <textarea
              className="input"
              rows={5}
              maxLength={500}
              value={idea}
              onChange={e => setIdea(e.target.value)}
              placeholder="Drop your raw idea, bullet points, or messy notes here..."
            />
            <div style={{ marginTop: 8 }}><TrendHint idea={idea} /></div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => callGroq('full')}
              disabled={loading || !idea.trim()}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? 'Writing...' : `Rewrite & Hook It in ${language}`}
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button onClick={() => callGroq('hooks')} disabled={loading || !idea.trim()} className="btn-secondary" style={{ fontSize: 12 }}>
                3 Hooks Only
              </button>
              <button onClick={() => callGroq('caption')} disabled={loading || !idea.trim()} className="btn-secondary" style={{ fontSize: 12 }}>
                Write Caption
              </button>
            </div>
            <button
              onClick={generateVariants}
              disabled={variantsLoading || loading || !idea.trim()}
              className="btn-secondary"
              style={{ fontSize: 12, width: '100%' }}
            >
              {variantsLoading ? 'Generating variants...' : 'A/B Hooks — 3 variants'}
            </button>
            {variantError && (
              <p style={{ fontSize: 11, color: 'var(--red)', padding: '6px 10px', background: 'var(--red-subtle)', border: '1px solid rgba(196,43,47,0.2)' }}>
                {variantError}
              </p>
            )}
          </div>

          {/* A/B hook variants */}
          {variants.length > 0 && (
            <div>
              <FieldLabel>Hook Variants</FieldLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {variants.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '9px 12px',
                      borderRadius: 7,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-input)',
                    }}
                  >
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, lineHeight: '20px', flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-primary)', flex: 1, lineHeight: 1.6 }}>{v}</span>
                    <button
                      onClick={() => setIdea(v)}
                      className="btn-secondary"
                      style={{ fontSize: 11, padding: '2px 10px', flexShrink: 0 }}
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.background = 'var(--bg-card)'
                    el.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.background = 'transparent'
                    el.style.color = 'var(--text-secondary)'
                  }}
                >
                  {hook}
                </button>
              ))}
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
            minHeight: 440,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <svg className="spin-ring" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" stroke="var(--border-strong)" strokeWidth="3" />
                <circle cx="16" cy="16" r="12" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray="20 56" />
              </svg>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Writing in {language}...</p>
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
            <>
              {regenError && (
                <div style={{ marginBottom: 10, padding: '7px 12px', background: 'var(--red-subtle)', border: '1px solid rgba(196,43,47,0.2)', fontSize: 12, color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {regenError}
                  <button onClick={() => setRegenError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 14 }}>×</button>
                </div>
              )}
              {saveError && (
                <div style={{ marginBottom: 10, padding: '7px 12px', background: 'var(--red-subtle)', border: '1px solid rgba(196,43,47,0.2)', fontSize: 12, color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {saveError}
                  <button onClick={() => setSaveError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 14 }}>×</button>
                </div>
              )}
              <ScriptOutput
                output={output}
                format={format}
                onOutputChange={setOutput}
                onSave={handleSave}
                isSaving={isSaving}
                saved={saved}
                onRegenerateSection={regenSection}
                sectionLoading={sectionLoading}
                history={history}
                onSelectHistory={selectHistory}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--text-tertiary)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
      marginBottom: 8,
    }}>
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
