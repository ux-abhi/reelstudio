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
import type { SavedScript } from '@/types/scan'
import {
  buildInstagramScriptPrompt,
  buildInstagramHooksPrompt,
  buildInstagramCaptionPrompt,
  buildInstagramSectionRegenPrompt,
  buildInstagramVariantsPrompt,
  buildShotListPrompt,
  instagramGroqPayload,
  type ShotItem,
} from '@/lib/prompts/contentWriter'

type Language = 'English' | 'Hinglish' | 'Hindi'
type Gender   = 'neutral' | 'male' | 'female'

const LANGUAGES: Language[] = ['English', 'Hinglish', 'Hindi']

const LANG_INSTRUCTION: Record<Language, string> = {
  English: 'Write entirely in English. Casual and direct — never stiff, never a brand voice.',
  Hindi:   'Write primarily in Hindi using Devanagari script. Keep minimal English only for technical terms. Make it feel natural, not translated.',
  // Hinglish is built dynamically via getHinglishInstruction() below
  Hinglish: 'Write in Hinglish — mix Hindi and English naturally. Use Devanagari words in Roman script. Never force it; let it flow.',
}

function getHinglishInstruction(gender: Gender): string {
  const genderNote: Record<Gender, string> = {
    male:    'Use masculine verb forms and pronouns (karunga, gaya, karta hoon, mujhe).',
    female:  'Use feminine verb forms and pronouns (karungi, gayi, karti hoon, mujhe).',
    neutral: 'Avoid gendered verb conjugations where possible; prefer neutral constructions.',
  }
  return `Write in Hinglish — mix Hindi and English naturally. Use Devanagari words in Roman script. Never force it; let it flow. ${genderNote[gender]}`
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
  const [gender, setGender] = useState<Gender>('neutral')
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
  const [shotList, setShotList] = useState<ShotItem[]>([])
  const [shotListLoading, setShotListLoading] = useState(false)
  const [shotListError, setShotListError] = useState<string | null>(null)
  const [shotCopied, setShotCopied] = useState<number | null>(null)
  const [shotListCopied, setShotListCopied] = useState(false)
  const [shotsSaved, setShotsSaved] = useState(false)
  const [savedScriptData, setSavedScriptData] = useState<{ id: string; hookLine: string } | null>(null)
  const [calPickerOpen, setCalPickerOpen] = useState(false)
  const [calDays, setCalDays] = useState<{ dayNumber: number; date: string; dayName: string; postType: string; title: string; postingTime: string }[]>([])
  const [calDaysLoading, setCalDaysLoading] = useState(false)
  const [scheduledDay, setScheduledDay] = useState<number | null>(null)
  const [sessionRestored, setSessionRestored] = useState(false)
  const [recentScripts, setRecentScripts] = useState<SavedScript[]>([])
  const calendarDay = searchParams.get('calendarDay')

  // Handle URL param or restore last session
  useEffect(() => {
    const urlIdea = searchParams.get('idea')
    if (urlIdea) {
      setIdea(decodeURIComponent(urlIdea))
      return // Coming from a link with pre-filled idea — don't restore session
    }
    try {
      const draft = localStorage.getItem('ss:studio:draft')
      if (!draft) return
      const d = JSON.parse(draft)
      if (!d.output) return // Only restore when there was actual output
      if (d.idea) setIdea(d.idea)
      if (d.format) setFormat(d.format)
      if (d.tone) setTone(d.tone)
      if (d.language && LANGUAGES.includes(d.language as Language)) setLanguage(d.language as Language)
      setOutput(d.output)
      if (Array.isArray(d.shotList) && d.shotList.length) setShotList(d.shotList)
      setSessionRestored(true)
    } catch {}
  }, [searchParams])

  useEffect(() => {
    fetch('/api/user-context')
      .then(r => r.json())
      .then(data => { if (data.masterDocSummary) setMasterDoc(data.masterDocSummary) })
      .catch(() => {})
    try {
      const g = localStorage.getItem('ss:gender')
      if (g === 'male' || g === 'female' || g === 'neutral') setGender(g)
    } catch {}
  }, [])

  // Load recent saved scripts for the "Previous scripts" panel
  useEffect(() => {
    fetch('/api/scripts')
      .then(r => r.ok ? r.json() : [])
      .then(data => setRecentScripts(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => {})
  }, [])

  // Auto-save session so user can pick up where they left off after navigating away
  useEffect(() => {
    if (!idea && !output) return
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('ss:studio:draft', JSON.stringify({ idea, format, tone, language, output, shotList: shotList.length > 0 ? shotList : undefined }))
      } catch {}
    }, 800)
    return () => clearTimeout(timer)
  }, [idea, format, tone, language, output, shotList])

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
    setLoading(true); setError(null); setOutput(''); setSaved(false); setShotList([]); setShotListError(null); setSessionRestored(false); setShotsSaved(false)
    const langInstruction = language === 'Hinglish'
      ? getHinglishInstruction(gender)
      : LANG_INSTRUCTION[language]
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
      const savedScript = await res.json()
      setSaved(true)
      if (savedScript?.id) {
        setSavedScriptData({ id: savedScript.id, hookLine })
        // Pre-select the day if we came from the calendar Write button
        if (calendarDay) setScheduledDay(parseInt(calendarDay))
      }
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  async function generateShotList() {
    if (!output) return
    setShotListLoading(true)
    setShotListError(null)
    setShotList([])
    try {
      const prompt = buildShotListPrompt(output, format, idea, who)
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemPrompt: '', maxTokens: 600 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const raw = (data.text as string).replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      const parsed: ShotItem[] = JSON.parse(raw)
      setShotList(Array.isArray(parsed) ? parsed : [])
    } catch {
      setShotListError('Could not generate shot list — try again')
    } finally {
      setShotListLoading(false)
    }
  }

  async function openCalPicker() {
    setCalPickerOpen(true)
    setCalDaysLoading(true)
    try {
      const data = await fetch('/api/calendar').then(r => r.json())
      setCalDays(Array.isArray(data) ? data : [])
    } catch {} finally { setCalDaysLoading(false) }
  }

  function scheduleToDay(dayNum: number) {
    if (!savedScriptData) return
    // 1. Save attachment reference
    try {
      const scripts = JSON.parse(localStorage.getItem('ss:calendar:scripts') ?? '{}')
      scripts[dayNum] = { id: savedScriptData.id, hookLine: savedScriptData.hookLine, output, format }
      localStorage.setItem('ss:calendar:scripts', JSON.stringify(scripts))
    } catch {}
    // 2. Update the calendar day's content so it shows this script, not the Groq idea
    try {
      const hookMatch = output.match(/\[HOOK\]([\s\S]*?)(?=\[BODY\]|$)/)
      const scriptHook = hookMatch?.[1]?.trim().split('\n')[0] || savedScriptData.hookLine
      const calEdits = JSON.parse(localStorage.getItem('ss:calendar:edits') ?? '{}')
      calEdits[dayNum] = { ...(calEdits[dayNum] ?? {}), title: savedScriptData.hookLine, hook: scriptHook }
      localStorage.setItem('ss:calendar:edits', JSON.stringify(calEdits))
    } catch {}
    setScheduledDay(dayNum)
    setCalPickerOpen(false)
  }

  function clearSession() {
    setIdea(''); setOutput(''); setShotList([]); setHistory([])
    setSaved(false); setSavedScriptData(null); setScheduledDay(null); setSessionRestored(false)
    try { localStorage.removeItem('ss:studio:draft') } catch {}
  }

  function loadFromSaved(script: SavedScript) {
    if (output) pushToHistory(output)
    setIdea(script.input)
    // If the save includes a shot list, split it out and restore both
    const splitIdx = script.output.indexOf('\n\n[SHOT LIST]')
    if (splitIdx !== -1) {
      setOutput(script.output.slice(0, splitIdx))
      const rawShots = script.output.slice(splitIdx + 13).trim().split('\n').filter(l => l.includes(' | '))
      const shots: ShotItem[] = rawShots.map((line, idx) => {
        const p = line.split(' | ')
        return { n: idx + 1, type: p[1]?.trim() ?? '', frame: p[2]?.trim() ?? '', vibe: p[3]?.replace('ref: ', '').trim() ?? '', sec: p[4]?.trim() ?? '' }
      }).filter(s => s.type)
      setShotList(shots)
    } else {
      setOutput(script.output)
      setShotList([])
    }
    setSaved(false); setSavedScriptData(null); setScheduledDay(null); setShotsSaved(false); setSessionRestored(false)
  }

  function copyShot(shot: ShotItem) {
    const text = `${String(shot.n).padStart(2, '0')} | ${shot.type.toUpperCase()} | ${shot.frame} | ref: ${shot.vibe} | ${shot.sec}`
    navigator.clipboard.writeText(text)
    setShotCopied(shot.n)
    setTimeout(() => setShotCopied(null), 1500)
  }

  function copyAllShots() {
    const text = `SHOT LIST\n\n${shotList.map(s =>
      `${String(s.n).padStart(2, '0')} | ${s.type.toUpperCase()} | ${s.frame} | ref: ${s.vibe} | ${s.sec}`
    ).join('\n')}`
    navigator.clipboard.writeText(text)
    setShotListCopied(true)
    setTimeout(() => setShotListCopied(false), 1800)
  }

  async function handleSaveWithShots() {
    if (!output || !shotList.length) return
    setIsSaving(true)
    setSaveError(null)

    const shotsText = shotList.map(s =>
      `${String(s.n).padStart(2, '0')} | ${s.type} | ${s.frame} | ref: ${s.vibe} | ${s.sec}`
    ).join('\n')
    const combinedOutput = `${output}\n\n[SHOT LIST]\n${shotsText}`
    const hookMatch = output.match(/\[HOOK\]([\s\S]*?)(?=\[BODY\]|$)/)
    const hookLine = hookMatch?.[1]?.trim().split('\n')[0] ?? output.split('\n')[0]

    try {
      if (savedScriptData?.id) {
        // Script already saved — update it in-place to append the shot list
        const res = await fetch('/api/scripts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: savedScriptData.id, output: combinedOutput }),
        })
        if (!res.ok) throw new Error('Update failed — try again')
      } else {
        // Script not yet saved — create a new save with combined output
        const res = await fetch('/api/scripts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ format, tone, pillar: '', input: idea, output: combinedOutput, hookLine }),
        })
        if (!res.ok) throw new Error('Failed to save — try again')
        const savedScript = await res.json()
        if (savedScript?.id) {
          setSavedScriptData({ id: savedScript.id, hookLine })
          if (calendarDay) setScheduledDay(parseInt(calendarDay))
        }
        setSaved(true)
      }
      setShotsSaved(true)
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

          {/* Previous scripts */}
          {recentScripts.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <FieldLabel>Previous scripts</FieldLabel>
                <a href="/saved" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>All →</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {recentScripts.map(s => (
                  <button
                    key={s.id}
                    onClick={() => loadFromSaved(s)}
                    style={{
                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: 12, padding: '7px 10px', borderRadius: 7,
                      background: 'transparent', border: '1px solid var(--border)',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                      transition: 'all 120ms ease', fontFamily: 'inherit', width: '100%',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                  >
                    <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 3, padding: '1px 6px', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {s.format?.split(' ')[0] ?? '—'}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{s.hookLine}</span>
                  </button>
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

        {/* Right — Output + Shot List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              {sessionRestored && (
                <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 7 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>↩ Last session restored</span>
                  <button onClick={clearSession} className="btn-ghost" style={{ fontSize: 11, width: 'auto', padding: '2px 8px', marginLeft: 'auto', color: 'var(--text-tertiary)' }}>
                    Start fresh
                  </button>
                </div>
              )}
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
              {/* Bottom action row: shot list + pin to calendar */}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={generateShotList}
                  disabled={shotListLoading}
                  className="btn-ghost"
                  style={{ fontSize: 12, width: 'auto', padding: '5px 12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {shotListLoading ? 'Building...' : 'Shot List →'}
                </button>
                {shotListError && <span style={{ fontSize: 11, color: 'var(--red)' }}>{shotListError}</span>}
                {savedScriptData && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {scheduledDay ? (
                      <span
                        onClick={openCalPicker}
                        style={{ fontSize: 11, color: 'var(--green)', cursor: 'pointer', borderBottom: '1px dotted var(--green)' }}
                      >
                        ✓ Pinned Day {scheduledDay} · change
                      </span>
                    ) : (
                      <button
                        onClick={openCalPicker}
                        className="btn-secondary"
                        style={{ fontSize: 11, padding: '4px 10px' }}
                      >
                        Pin to Calendar →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Shot list card */}
        {shotList.length > 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                Shot List — {shotList.length} shots
              </p>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {/* Save with script */}
                {shotsSaved ? (
                  <span style={{ fontSize: 11, color: 'var(--green)' }}>✓ Saved with script</span>
                ) : (
                  <button
                    onClick={handleSaveWithShots}
                    disabled={isSaving || !output}
                    className="btn-secondary"
                    style={{ fontSize: 11, padding: '2px 10px' }}
                    title={savedScriptData?.id ? 'Add shots to your already-saved script' : 'Save this script and shot list together'}
                  >
                    {isSaving ? 'Saving...' : savedScriptData?.id ? 'Add shots to save' : 'Save with script'}
                  </button>
                )}
                <button
                  onClick={copyAllShots}
                  className="btn-ghost"
                  style={{ fontSize: 11, width: 'auto', padding: '2px 10px', color: shotListCopied ? 'var(--green)' : 'var(--text-tertiary)' }}
                >
                  {shotListCopied ? '✓' : 'Copy all'}
                </button>
                <button onClick={() => setShotList([])} className="btn-ghost" style={{ fontSize: 12, width: 'auto', height: 'auto', padding: '2px 8px' }}>×</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {shotList.map(shot => (
                <div key={shot.n} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 10, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 7, border: '1px solid var(--border-subtle)', alignItems: 'start' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', paddingTop: 2 }}>
                    {String(shot.n).padStart(2, '0')}
                  </span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 4, padding: '1px 7px' }}>
                        {shot.type}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{shot.sec}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 'auto', fontStyle: 'italic' }}>ref: {shot.vibe}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{shot.frame}</p>
                  </div>
                  <button
                    onClick={() => copyShot(shot)}
                    className="btn-ghost"
                    style={{ fontSize: 11, width: 'auto', height: 'auto', padding: '2px 8px', color: shotCopied === shot.n ? 'var(--green)' : 'var(--text-tertiary)', flexShrink: 0, marginTop: 2 }}
                    title="Copy this shot"
                  >
                    {shotCopied === shot.n ? '✓' : '⎘'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        </div>
      </div>

      {/* Calendar day picker modal */}
      {calPickerOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setCalPickerOpen(false)}
        >
          <div
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 12, width: '100%', maxWidth: 440, maxHeight: '72vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Pin to a calendar day</p>
              <button onClick={() => setCalPickerOpen(false)} className="btn-ghost">×</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {calDaysLoading && <p style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: 16, textAlign: 'center' }}>Loading calendar...</p>}
              {!calDaysLoading && calDays.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: 16, textAlign: 'center' }}>No calendar yet — run your scan first.</p>
              )}
              {calDays.map(day => {
                const isPinned = scheduledDay === day.dayNumber
                return (
                  <button
                    key={day.dayNumber}
                    onClick={() => scheduleToDay(day.dayNumber)}
                    style={{
                      textAlign: 'left',
                      background: isPinned ? 'var(--accent-subtle)' : 'var(--bg-card)',
                      border: `1px solid ${isPinned ? 'var(--accent-border)' : 'var(--border)'}`,
                      borderRadius: 8, padding: '10px 14px', cursor: 'pointer', transition: 'all 120ms ease',
                    }}
                    onMouseEnter={e => { if (!isPinned) e.currentTarget.style.borderColor = 'var(--accent)' }}
                    onMouseLeave={e => { if (!isPinned) e.currentTarget.style.borderColor = 'var(--border)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, flexShrink: 0, textAlign: 'center' }}>
                        <p style={{ fontSize: 9, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{day.dayName}</p>
                        <p style={{ fontSize: 15, fontWeight: 700, color: isPinned ? 'var(--accent)' : 'var(--text-secondary)', lineHeight: 1 }}>
                          {day.date?.split('-')[2] ?? day.dayNumber}
                        </p>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, color: isPinned ? 'var(--accent)' : 'var(--text-primary)', lineHeight: 1.4 }}>
                          {isPinned ? '✓ Pinned' : day.title}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{day.postType} · {day.postingTime}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
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
