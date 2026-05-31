'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { PageHeader } from '@/components/shared/PageHeader'
import { PillarTag } from '@/components/shared/PillarTag'
import { TrendBadge } from '@/components/shared/TrendBadge'
import type { SavedScript } from '@/types/scan'
import { parseShotList } from '@/lib/scriptUtils'

const LS_STUDIO_DRAFT   = 'ss:studio:draft'
const LS_CAL_SCRIPTS    = 'ss:calendar:scripts'

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'scripts' | 'hooks' | 'ideas' | 'scheduled'

interface UserHook {
  id: string
  text: string
  type: 'curiosity' | 'story' | 'hot-take' | 'hinglish'
  basedOn: string
  trendRelevant: boolean
}

interface UserIdea {
  id: string
  title: string
  pillar: string
  pillarColorKey?: string
  trendScore: number
  trendDirection: 'rising' | 'falling' | 'stable'
  hookSuggestion: string
  triggerWord?: string
  urgency: 'post this week' | 'post this month' | 'evergreen'
  whyNow: string
}

const LS_HOOKS    = 'ss:user-hooks'
const LS_IDEAS    = 'ss:user-ideas'
const LS_SCHEDULE = 'ss:schedule'
const LS_NICHE    = 'ss:niche'

function uid() { return Math.random().toString(36).slice(2, 10) }

// ── Fallbacks ──────────────────────────────────────────────────────────────────

const FALLBACK_HOOKS: UserHook[] = [
  { id: 'fh1', text: "I can't believe this is still free", type: 'curiosity', basedOn: 'Resource reveal — high engagement across niches', trendRelevant: true },
  { id: 'fh2', text: "Everyone talking about [trend] is missing the most important part", type: 'hot-take', basedOn: 'Contrarian take — drives comments', trendRelevant: true },
  { id: 'fh3', text: "This is what I wish someone told me when I started", type: 'curiosity', basedOn: 'Hindsight advice — high save rate', trendRelevant: false },
  { id: 'fh4', text: "I figured this out the hard way so you don't have to", type: 'story', basedOn: 'Hard-won insight — relatable and shareable', trendRelevant: false },
  { id: 'fh5', text: "Stop doing this — it's the reason you're not growing", type: 'hot-take', basedOn: 'Mistake callout — high share rate', trendRelevant: false },
  { id: 'fh6', text: "The approach nobody in this space is talking about", type: 'curiosity', basedOn: 'Hidden gem — saves + DMs', trendRelevant: true },
  { id: 'fh7', text: "I tested 5 different methods so you don't have to", type: 'curiosity', basedOn: 'Comparison/test — drives saves', trendRelevant: false },
  { id: 'fh8', text: "I spent 3 months on this — here's the shortcut", type: 'story', basedOn: 'Hard-won shortcut — saves heavily', trendRelevant: false },
]

// ── Hook type config ───────────────────────────────────────────────────────────

const HOOK_TYPE_CONFIG: Record<string, { label: string; accent: string; bg: string; border: string }> = {
  curiosity:  { label: 'Curiosity', accent: 'var(--accent-hover)',  bg: 'var(--accent-subtle)',  border: 'var(--accent-border)' },
  story:      { label: 'Story',     accent: 'var(--green)',          bg: 'var(--green-subtle)',   border: 'rgba(48,164,108,0.20)' },
  'hot-take': { label: 'Hot Take',  accent: 'var(--red)',            bg: 'var(--red-subtle)',     border: 'rgba(229,72,77,0.20)' },
  hinglish:   { label: 'Hinglish',  accent: 'var(--yellow)',         bg: 'var(--yellow-subtle)',  border: 'rgba(245,166,35,0.20)' },
}

const URGENCY_ORDER: Record<string, number> = { 'post this week': 0, 'post this month': 1, evergreen: 2 }

// ── Niche selector ─────────────────────────────────────────────────────────────

function NicheSelector({ niche, onChange }: { niche: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState('')

  function save() {
    const v = draft.trim()
    if (v) { onChange(v); localStorage.setItem(LS_NICHE, v) }
    setEditing(false)
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)', flexShrink: 0 }}>Content niche:</span>
        <input
          className="input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
          style={{ fontSize: 12, maxWidth: 320, padding: '4px 10px' }}
          autoFocus
          placeholder="e.g. fitness coach, productivity tools, personal finance"
        />
        <button onClick={save} className="btn-primary" style={{ fontSize: 12, padding: '4px 12px' }}>Save</button>
        <button onClick={() => setEditing(false)} className="btn-ghost" style={{ fontSize: 12, width: 'auto', padding: '4px 8px' }}>Cancel</button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Content niche:</span>
      <span style={{
        fontSize: 12, color: 'var(--text-secondary)',
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: 5, padding: '2px 10px',
      }}>
        {niche || 'Not set'}
      </span>
      <button
        onClick={() => { setDraft(niche); setEditing(true) }}
        className="btn-ghost"
        style={{ fontSize: 12, width: 'auto', padding: '3px 8px', color: 'var(--text-tertiary)' }}
        title="Change niche — affects all AI generation in this Library"
      >
        Edit ✎
      </button>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function IdeasPage() {
  const { scan } = useScan()
  const [tab, setTab]   = useState<Tab>('scripts')
  const [niche, setNiche] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(LS_NICHE)
    if (stored) {
      setNiche(stored)
    } else {
      // Default: derive from scan pillars or bio
      const pillars = scan?.pillars?.slice(0, 2).map(p => p.name).join(', ')
      setNiche(pillars || '')
    }
  }, [scan])

  const TABS: { id: Tab; label: string }[] = [
    { id: 'scripts',   label: 'Saved Scripts' },
    { id: 'hooks',     label: 'Hooks Library' },
    { id: 'ideas',     label: 'Ideas Bank' },
    { id: 'scheduled', label: 'Scheduled' },
  ]

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <PageHeader label="Library" title="Content Library" subtitle="All your scripts, hooks, and ideas in one place" />
        <div style={{ paddingTop: 4 }}>
          <NicheSelector niche={niche} onChange={setNiche} />
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: 0, marginTop: 4 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '9px 18px',
              fontSize: 13,
              fontWeight: tab === t.id ? 500 : 400,
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 140ms ease',
              marginBottom: -1,
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'scripts'   && <ScriptsTab niche={niche} />}
      {tab === 'hooks'     && <HooksTab niche={niche} />}
      {tab === 'ideas'     && <IdeasTab niche={niche} />}
      {tab === 'scheduled' && <ScheduledTab onSwitchTab={() => setTab('scripts')} />}
    </div>
  )
}

// ══ SCRIPTS TAB ═══════════════════════════════════════════════════════════════

function ScriptsTab({ niche }: { niche: string }) {
  const router = useRouter()
  const { scan } = useScan()
  const [scripts, setScripts]       = useState<SavedScript[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filterFormat, setFilter]   = useState('All')
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editOutput, setEditOutput] = useState('')
  const [editHook, setEditHook]     = useState('')
  const [copied, setCopied]         = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState<string | null>(null)
  const [schedulingId, setSchedulingId] = useState<string | null>(null)
  const [schedule, setSchedule]     = useState<Record<string, string>>({})
  const [showNew, setShowNew]       = useState(false)
  const [newIdea, setNewIdea]       = useState('')
  const [newFormat, setNewFormat]   = useState('Reel 30–45s')
  const [newTone, setNewTone]       = useState('Casual')
  const [generating, setGenerating] = useState(false)

  const [calPins, setCalPins] = useState<Record<string, number>>({}) // scriptId → dayNumber

  useEffect(() => {
    const raw = localStorage.getItem(LS_SCHEDULE)
    if (raw) setSchedule(JSON.parse(raw))
    // Build a reverse map: scriptId → dayNumber for calendar-pinned scripts
    try {
      const pinMap = JSON.parse(localStorage.getItem(LS_CAL_SCRIPTS) ?? '{}') as Record<string, { id: string }>
      const reverse: Record<string, number> = {}
      Object.entries(pinMap).forEach(([day, v]) => { if (v?.id) reverse[v.id] = parseInt(day) })
      setCalPins(reverse)
    } catch {}
    fetch('/api/scripts')
      .then(r => r.json())
      .then(data => { setScripts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function saveSchedule(updated: Record<string, string>) {
    setSchedule(updated)
    localStorage.setItem(LS_SCHEDULE, JSON.stringify(updated))
  }

  async function handleDelete(id: string) {
    await fetch('/api/scripts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setScripts(s => s.filter(sc => sc.id !== id))
    if (expanded === id) setExpanded(null)
  }

  async function handleSaveEdit(id: string) {
    await fetch('/api/scripts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, output: editOutput, hookLine: editHook }) })
    setScripts(s => s.map(sc => sc.id === id ? { ...sc, output: editOutput, hookLine: editHook } : sc))
    setEditingId(null)
  }

  async function handleRefresh(script: SavedScript) {
    setRefreshing(script.id)
    const trending = scan?.trendPulse?.filter(t => t.direction === 'rising').map(t => t.keyword).slice(0, 5).join(', ') ?? ''
    try {
      const prompt = `You are writing an Instagram script for a content creator.
NICHE: ${niche}
FORMAT: ${script.format}
TONE: ${script.tone}
TRENDING: ${trending || 'use your knowledge of current trends in this creator\'s niche'}
VIRAL FORMULA: Result shown first → practical shortcut revealed → comment trigger.
RAW IDEA: ${script.input}
[HOOK] — scroll-stopping first line, no "Hey guys"
[BODY] — punchy, every sentence earns its place
[CTA] — comment trigger or save prompt
Return script only. No explanation.`
      const res  = await fetch('/api/groq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, maxTokens: 1500 }) })
      const data = await res.json()
      if (data.text) {
        const m    = data.text.match(/\[HOOK\]([\s\S]*?)(?=\[BODY\]|$)/)
        const hook = m?.[1]?.trim().split('\n')[0] ?? data.text.split('\n')[0]
        await fetch('/api/scripts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: script.id, output: data.text, hookLine: hook }) })
        setScripts(s => s.map(sc => sc.id === script.id ? { ...sc, output: data.text, hookLine: hook } : sc))
      }
    } finally { setRefreshing(null) }
  }

  async function handleGenerateNew() {
    if (!newIdea.trim()) return
    setGenerating(true)
    const trending = scan?.trendPulse?.filter(t => t.direction === 'rising').map(t => t.keyword).slice(0, 5).join(', ') ?? ''
    try {
      const prompt = `Write an Instagram script for a content creator.
NICHE: ${niche}
FORMAT: ${newFormat}
TONE: ${newTone}
TRENDING: ${trending || 'use your knowledge of current trends in this creator\'s niche'}
VIRAL FORMULA: Result shown first → practical shortcut → comment trigger.
RAW IDEA: ${newIdea}
[HOOK] — scroll-stopping first line
[BODY] — punchy, natural pacing
[CTA] — comment trigger or save prompt
Return script only.`
      const res  = await fetch('/api/groq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, maxTokens: 1500 }) })
      const data = await res.json()
      if (data.text) {
        const m    = data.text.match(/\[HOOK\]([\s\S]*?)(?=\[BODY\]|$)/)
        const hook = m?.[1]?.trim().split('\n')[0] ?? data.text.split('\n')[0]
        const saveRes = await fetch('/api/scripts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ format: newFormat, tone: newTone, pillar: '', input: newIdea, output: data.text, hookLine: hook }) })
        const saved = await saveRes.json()
        setScripts(s => [saved, ...s])
        setShowNew(false); setNewIdea(''); setExpanded(saved.id)
      }
    } finally { setGenerating(false) }
  }

  const formats  = ['All', ...Array.from(new Set(scripts.map(s => s.format).filter(Boolean)))]
  const filtered = scripts.filter(s => {
    const fmtOk  = filterFormat === 'All' || s.format === filterFormat
    const srchOk = !search || s.hookLine.toLowerCase().includes(search.toLowerCase()) || s.input.toLowerCase().includes(search.toLowerCase())
    return fmtOk && srchOk
  })

  if (loading) return <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Loading...</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <input className="input" style={{ maxWidth: 220, fontSize: 13 }} placeholder="Search scripts..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          {formats.map(f => <button key={f} onClick={() => setFilter(f)} className={`pill-filter${filterFormat === f ? ' active' : ''}`}>{f}</button>)}
        </div>
        <button onClick={() => setShowNew(v => !v)} className="btn-primary" style={{ fontSize: 12, padding: '6px 14px', flexShrink: 0 }}>+ New Script</button>
      </div>

      {showNew && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p className="section-label">Generate a new script</p>
          <textarea className="input" rows={3} value={newIdea} onChange={e => setNewIdea(e.target.value)} placeholder="Drop your idea, raw notes, or hook concept here..." autoFocus />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="input" style={{ maxWidth: 180, fontSize: 12 }} value={newFormat} onChange={e => setNewFormat(e.target.value)}>
              {['Reel 30–45s', 'Reel 60–90s', 'Carousel 5–7', 'Talking Head', 'Caption Only'].map(f => <option key={f}>{f}</option>)}
            </select>
            <select className="input" style={{ maxWidth: 140, fontSize: 12 }} value={newTone} onChange={e => setNewTone(e.target.value)}>
              {['Casual', 'Educational', 'Hot-Take', 'Storytelling', 'Motivational'].map(t => <option key={t}>{t}</option>)}
            </select>
            <button onClick={handleGenerateNew} disabled={generating || !newIdea.trim()} className="btn-primary" style={{ fontSize: 12 }}>{generating ? 'Generating...' : 'Generate →'}</button>
            <button onClick={() => router.push('/studio')} className="btn-secondary" style={{ fontSize: 12 }}>Open Studio</button>
            <button onClick={() => { setShowNew(false); setNewIdea('') }} className="btn-ghost" style={{ fontSize: 12, width: 'auto', padding: '6px 10px', marginLeft: 'auto' }}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ padding: '56px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>No scripts yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Generate one above or write in Studio</p>
          <button onClick={() => router.push('/studio')} className="btn-primary" style={{ fontSize: 13, marginTop: 12 }}>Open Studio</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(script => {
            const isExpanded   = expanded === script.id
            const isEditing    = editingId === script.id
            const isRefresh    = refreshing === script.id
            const isScheduling = schedulingId === script.id
            const schedDate    = schedule[script.id]
            return (
              <div key={script.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => { setExpanded(isExpanded ? null : script.id); setEditingId(null) }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-hover)', lineHeight: 1.4, marginBottom: 6 }}>
                      {script.hookLine || script.input.slice(0, 80)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {script.format && <span className="tag tag-default">{script.format}</span>}
                      {script.tone   && <span className="tag tag-default">{script.tone}</span>}
                      {schedDate && <span className="tag" style={{ background: 'var(--green-subtle)', color: 'var(--green)', borderColor: 'rgba(48,164,108,0.20)' }}>{new Date(schedDate + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                      {calPins[script.id] && <span className="tag" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', borderColor: 'var(--accent-border)' }}>📅 Day {calPins[script.id]}</span>}
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{new Date(script.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 2, flexShrink: 0, alignItems: 'center' }}>
                    <button onClick={() => handleRefresh(script)} disabled={!!refreshing} className="btn-ghost" title="Regenerate" style={{ fontSize: 15, opacity: isRefresh ? 0.4 : 1 }}>{isRefresh ? <span style={{ fontSize: 10 }}>…</span> : '↺'}</button>
                    <button onClick={() => setSchedulingId(isScheduling ? null : script.id)} className="btn-ghost" title="Schedule" style={{ fontSize: 13, color: schedDate ? 'var(--green)' : undefined }}>⊡</button>
                    <button onClick={() => { setExpanded(isExpanded ? null : script.id); setEditingId(null) }} className="btn-ghost" style={{ fontSize: 15 }}>{isExpanded ? '−' : '+'}</button>
                    <button onClick={() => handleDelete(script.id)} className="btn-ghost" title="Delete" style={{ fontSize: 12 }}>✕</button>
                  </div>
                </div>

                {isScheduling && (
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Schedule for:</span>
                    <input type="date" className="input" style={{ maxWidth: 160, fontSize: 12, padding: '4px 8px' }} value={schedDate ?? ''} onChange={e => saveSchedule({ ...schedule, [script.id]: e.target.value })} />
                    {schedDate && <button onClick={() => { const { [script.id]: _, ...rest } = schedule; saveSchedule(rest) }} className="btn-secondary" style={{ fontSize: 11, padding: '3px 10px', color: 'var(--red)' }}>Clear date</button>}
                    <button onClick={() => setSchedulingId(null)} className="btn-ghost" style={{ fontSize: 12, width: 'auto', padding: '4px 10px' }}>Done</button>
                  </div>
                )}

                {isExpanded && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {isEditing ? (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <p className="section-label">Hook line</p>
                          <input className="input" value={editHook} onChange={e => setEditHook(e.target.value)} style={{ fontSize: 13 }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <p className="section-label">Full script</p>
                          <textarea className="input" value={editOutput} onChange={e => setEditOutput(e.target.value)} style={{ fontSize: 13, lineHeight: 1.7, minHeight: 200, resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleSaveEdit(script.id)} className="btn-primary" style={{ fontSize: 12 }}>Save changes</button>
                          <button onClick={() => setEditingId(null)} className="btn-secondary" style={{ fontSize: 12 }}>Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <pre style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontFamily: 'inherit', background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 7, border: '1px solid var(--border)' }}>
                          {script.output.includes('\n\n[SHOT LIST]') ? script.output.slice(0, script.output.indexOf('\n\n[SHOT LIST]')) : script.output}
                        </pre>
                        {(() => {
                          const shots = parseShotList(script.output)
                          if (!shots) return null
                          return (
                            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 7, padding: '12px 14px' }}>
                              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>Shot List — {shots.length} shots</p>
                              {shots.map((shot, si) => (
                                <div key={shot.n} style={{ display: 'grid', gridTemplateColumns: '20px auto 1fr auto', gap: 8, padding: '6px 0', borderBottom: si < shots.length - 1 ? '1px solid var(--border-subtle)' : 'none', alignItems: 'baseline' }}>
                                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)' }}>{String(shot.n).padStart(2,'0')}</span>
                                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 3, padding: '1px 6px', whiteSpace: 'nowrap' }}>{shot.type}</span>
                                  <span style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>{shot.frame}</span>
                                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontStyle: 'italic', whiteSpace: 'nowrap' }}>ref: {shot.vibe} · {shot.sec}</span>
                                </div>
                              ))}
                            </div>
                          )
                        })()}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <button onClick={async () => { await navigator.clipboard.writeText(script.output); setCopied(script.id); setTimeout(() => setCopied(null), 2000) }} className="btn-secondary" style={{ fontSize: 12, color: copied === script.id ? 'var(--green)' : undefined }}>{copied === script.id ? '✓ Copied' : 'Copy'}</button>
                          <button onClick={() => { setEditingId(script.id); setEditOutput(script.output); setEditHook(script.hookLine) }} className="btn-secondary" style={{ fontSize: 12 }}>Edit</button>
                          <button
                            onClick={() => {
                              try {
                                const splitIdx = script.output.indexOf('\n\n[SHOT LIST]')
                                const cleanOutput = splitIdx !== -1 ? script.output.slice(0, splitIdx) : script.output
                                const shots = parseShotList(script.output)
                                localStorage.setItem(LS_STUDIO_DRAFT, JSON.stringify({
                                  idea: script.input, format: script.format,
                                  tone: script.tone || 'Casual', language: 'English',
                                  output: cleanOutput, shotList: shots ?? undefined,
                                }))
                              } catch {}
                              router.push('/studio')
                            }}
                            className="btn-secondary" style={{ fontSize: 12 }}>
                            Load in Studio
                          </button>
                          <button onClick={() => handleDelete(script.id)} className="btn-destructive" style={{ fontSize: 12, marginLeft: 'auto' }}>Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ══ HOOKS TAB ═════════════════════════════════════════════════════════════════

function HooksTab({ niche }: { niche: string }) {
  const router = useRouter()
  const { scan } = useScan()
  const [hooks, setHooks]               = useState<UserHook[]>([])
  const [filterType, setFilterType]     = useState('All')
  const [editingId, setEditingId]       = useState<string | null>(null)
  const [editText, setEditText]         = useState('')
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [copied, setCopied]             = useState<string | null>(null)

  // Manual creation
  const [showManual, setShowManual]   = useState(false)
  const [manualText, setManualText]   = useState('')
  const [manualType, setManualType]   = useState<UserHook['type']>('curiosity')

  // AI generation
  const [showAIGen, setShowAIGen]     = useState(false)
  const [aiTopic, setAiTopic]         = useState('')
  const [aiType, setAiType]           = useState<UserHook['type']>('curiosity')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiResults, setAiResults]     = useState<string[]>([])
  const [aiError, setAiError]         = useState<string | null>(null)
  const [savedIdxs, setSavedIdxs]     = useState<Set<number>>(new Set())

  const visibleTypes = ['curiosity', 'story', 'hot-take', 'hinglish'] as const

  useEffect(() => {
    const stored = localStorage.getItem(LS_HOOKS)
    if (stored) {
      setHooks(JSON.parse(stored))
    } else {
      const source = scan?.hooks?.length
        ? scan.hooks.map((h, i) => ({ id: (h as UserHook).id ?? `scanh${i}`, text: h.text, type: h.type, basedOn: h.basedOn, trendRelevant: h.trendRelevant }))
        : FALLBACK_HOOKS
      setHooks(source)
      localStorage.setItem(LS_HOOKS, JSON.stringify(source))
    }
  }, [scan])

  function persist(updated: UserHook[]) { setHooks(updated); localStorage.setItem(LS_HOOKS, JSON.stringify(updated)) }
  function deleteHook(id: string) { persist(hooks.filter(h => h.id !== id)) }

  function saveEdit(id: string) {
    persist(hooks.map(h => h.id === id ? { ...h, text: editText } : h))
    setEditingId(null)
  }

  function addManual() {
    if (!manualText.trim()) return
    persist([{ id: uid(), text: manualText.trim(), type: manualType, basedOn: 'Custom', trendRelevant: false }, ...hooks])
    setManualText(''); setShowManual(false)
  }

  async function refreshHook(hook: UserHook) {
    setRefreshingId(hook.id)
    try {
      const prompt = `Write a single new Instagram hook as a distinct alternative to:
"${hook.text}"
Niche: ${niche}
Hook type: ${hook.type} — ${HOOK_TYPE_CONFIG[hook.type]?.label}
Rules: grabs attention in 2 seconds, no greeting, no filler, more punchy than the original.
Return ONLY the hook text. No quotes, no explanation.`
      const res  = await fetch('/api/groq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, maxTokens: 80 }) })
      const data = await res.json()
      if (data.text?.trim()) persist(hooks.map(h => h.id === hook.id ? { ...h, text: data.text.trim().replace(/^["']|["']$/g, '') } : h))
    } finally { setRefreshingId(null) }
  }

  async function generateHooksWithAI() {
    if (!aiTopic.trim()) return
    setAiGenerating(true); setAiResults([]); setSavedIdxs(new Set())
    try {
      const cfg    = HOOK_TYPE_CONFIG[aiType]
      const prompt = `Generate 3 Instagram hooks for a ${niche} content creator.
Hook type: ${aiType} — ${cfg?.label}
Topic: ${aiTopic}
Rules:
- Each hook grabs attention in 2 seconds
- No greeting ("Hey!", "So I…"), no filler
- Works as a standalone scroll-stopping opening line
- Tailored to the "${aiType}" style

Return ONLY a JSON array of 3 strings:
["hook 1", "hook 2", "hook 3"]`
      const res  = await fetch('/api/groq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, maxTokens: 200 }) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const clean   = data.text?.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim() ?? ''
      let parsed: string[] = []
      try { parsed = JSON.parse(clean) } catch { throw new Error('AI returned unexpected format — try again') }
      const valid = Array.isArray(parsed) ? parsed.filter(Boolean) : []
      if (valid.length === 0) throw new Error('No hooks generated — try a different topic')
      setAiResults(valid)
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : 'Generation failed')
      setAiResults([])
    }
    finally { setAiGenerating(false) }
  }

  function saveAIHook(idx: number) {
    const text = aiResults[idx]
    if (!text) return
    persist([{ id: uid(), text, type: aiType, basedOn: `AI — ${aiTopic}`, trendRelevant: false }, ...hooks])
    setSavedIdxs(prev => new Set(prev).add(idx))
  }

  const filtered = filterType === 'All' ? hooks : hooks.filter(h => h.type === filterType)
  const grouped  = visibleTypes.map(type => ({ type, items: filtered.filter(h => h.type === type) })).filter(g => g.items.length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          {['All', ...visibleTypes].map(t => (
            <button key={t} onClick={() => setFilterType(t)} className={`pill-filter${filterType === t ? ' active' : ''}`} style={{ fontSize: 12 }}>
              {t === 'hot-take' ? 'Hot Take' : t === 'All' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => { setShowAIGen(v => !v); setShowManual(false) }} className={showAIGen ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: 12, padding: '6px 14px' }}>
            Generate with AI ✦
          </button>
          <button onClick={() => { setShowManual(v => !v); setShowAIGen(false) }} className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>
            + Write manually
          </button>
        </div>
      </div>

      {/* AI generate form */}
      {showAIGen && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, borderColor: 'var(--accent-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p className="section-label" style={{ flex: 1 }}>Generate hooks with AI</p>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Niche: {niche}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              className="input"
              value={aiTopic}
              onChange={e => setAiTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generateHooksWithAI()}
              placeholder="Topic or idea (e.g. morning routine, tool review, audience Q&amp;A)"
              autoFocus
              style={{ fontSize: 13 }}
            />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="segmented">
                {visibleTypes.map(t => (
                  <button key={t} onClick={() => setAiType(t)} className={`segment${aiType === t ? ' active' : ''}`} style={{ fontSize: 11 }}>
                    {t === 'hot-take' ? 'Hot Take' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <button onClick={generateHooksWithAI} disabled={aiGenerating || !aiTopic.trim()} className="btn-primary" style={{ fontSize: 12 }}>
                {aiGenerating ? 'Generating...' : 'Generate 3 hooks →'}
              </button>
              {aiResults.length > 0 && <button onClick={() => { setAiResults([]); setSavedIdxs(new Set()) }} className="btn-ghost" style={{ fontSize: 12, width: 'auto', padding: '4px 8px' }}>Clear</button>}
            </div>
          </div>

          {/* Results */}
          {aiResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                Review generated hooks — save the ones you like to your library:
              </p>
              {aiResults.map((hookText, idx) => {
                const saved = savedIdxs.has(idx)
                const cfg   = HOOK_TYPE_CONFIG[aiType]
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 14px', borderRadius: 8,
                      background: saved ? 'var(--green-subtle)' : 'var(--bg-elevated)',
                      border: `1px solid ${saved ? 'rgba(48,164,108,0.20)' : 'var(--border)'}`,
                      transition: 'all 160ms ease',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <span className="badge" style={{ background: cfg.bg, color: cfg.accent, borderColor: cfg.border, fontSize: 10, marginBottom: 6, display: 'inline-flex' }}>
                        {cfg.label}
                      </span>
                      <p style={{ fontSize: 13, color: saved ? 'var(--green)' : 'var(--text-primary)', lineHeight: 1.5, marginTop: 4 }}>{hookText}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {!saved ? (
                        <button onClick={() => saveAIHook(idx)} className="btn-primary" style={{ fontSize: 11, padding: '4px 12px' }}>
                          Save to Library
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 500, padding: '4px 0' }}>✓ Saved</span>
                      )}
                      <button onClick={() => router.push(`/studio?idea=${encodeURIComponent(hookText)}`)} className="btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }}>Use in Studio</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Manual write form */}
      {showManual && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p className="section-label">Write a hook manually</p>
          <textarea className="input" rows={2} value={manualText} onChange={e => setManualText(e.target.value)} placeholder="Your hook line..." autoFocus style={{ fontSize: 13 }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="segmented">
              {visibleTypes.map(t => (
                <button key={t} onClick={() => setManualType(t)} className={`segment${manualType === t ? ' active' : ''}`} style={{ fontSize: 11 }}>
                  {t === 'hot-take' ? 'Hot Take' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={addManual} disabled={!manualText.trim()} className="btn-primary" style={{ fontSize: 12 }}>Save to Library</button>
            <button onClick={() => { setShowManual(false); setManualText('') }} className="btn-ghost" style={{ fontSize: 12, width: 'auto', padding: '6px 10px' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Library */}
      {grouped.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '32px 0', textAlign: 'center' }}>No hooks yet. Generate with AI or write one above.</p>
      ) : grouped.map(({ type, items }) => {
        const cfg = HOOK_TYPE_CONFIG[type]
        return (
          <section key={type}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <p className="section-label">{cfg.label}</p>
              <span className="badge" style={{ background: cfg.bg, color: cfg.accent, borderColor: cfg.border, fontSize: 10 }}>{items.length}</span>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              {items.map((hook, i) => (
                <div key={hook.id} style={{ padding: '12px 16px', borderBottom: i < items.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  {editingId === hook.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <textarea className="input" rows={2} value={editText} onChange={e => setEditText(e.target.value)} autoFocus style={{ fontSize: 13, lineHeight: 1.6 }} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => saveEdit(hook.id)} className="btn-primary" style={{ fontSize: 12 }}>Save</button>
                        <button onClick={() => setEditingId(null)} className="btn-secondary" style={{ fontSize: 12 }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{hook.text}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>{hook.basedOn}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 3, flexShrink: 0, alignItems: 'center' }}>
                        {hook.trendRelevant && <span className="badge badge-rising" style={{ fontSize: 10 }}>↑</span>}
                        <button onClick={async () => { await navigator.clipboard.writeText(hook.text); setCopied(hook.id); setTimeout(() => setCopied(null), 2000) }} className="btn-ghost" title="Copy" style={{ fontSize: 12, color: copied === hook.id ? 'var(--green)' : undefined }}>{copied === hook.id ? '✓' : '⎘'}</button>
                        <button onClick={() => router.push(`/studio?idea=${encodeURIComponent(hook.text)}`)} className="btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }}>Use</button>
                        <button onClick={() => { setEditingId(hook.id); setEditText(hook.text) }} className="btn-ghost" title="Edit" style={{ fontSize: 14 }}>✎</button>
                        <button onClick={() => refreshHook(hook)} disabled={!!refreshingId} className="btn-ghost" title="Regenerate variant" style={{ fontSize: 15, opacity: refreshingId === hook.id ? 0.4 : 1 }}>{refreshingId === hook.id ? <span style={{ fontSize: 10 }}>…</span> : '↺'}</button>
                        <button onClick={() => deleteHook(hook.id)} className="btn-ghost" title="Delete" style={{ fontSize: 12 }}>✕</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

// ══ IDEAS TAB ══════════════════════════════════════════════════════════════════

function IdeasTab({ niche }: { niche: string }) {
  const router = useRouter()
  const { scan } = useScan()
  const [ideas, setIdeas]               = useState<UserIdea[]>([])
  const [filterPillar, setFilter]       = useState('All')
  const [sort, setSort]                 = useState<'trendScore' | 'urgency' | 'pillar'>('trendScore')
  const [editingId, setEditingId]       = useState<string | null>(null)
  const [editTitle, setEditTitle]       = useState('')
  const [editWhyNow, setEditWhyNow]     = useState('')
  const [refreshingId, setRefreshingId] = useState<string | null>(null)

  // Manual creation
  const [showManual, setShowManual]     = useState(false)
  const [newTitle, setNewTitle]         = useState('')
  const [newPillar, setNewPillar]       = useState('')
  const [newUrgency, setNewUrgency]     = useState<UserIdea['urgency']>('post this month')
  const [newWhyNow, setNewWhyNow]       = useState('')

  // AI generation
  const [showAIGen, setShowAIGen]       = useState(false)
  const [aiTopic, setAiTopic]           = useState('')
  const [aiPillar, setAiPillar]         = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiResults, setAiResults]       = useState<Omit<UserIdea, 'id'>[]>([])
  const [aiError, setAiError]           = useState<string | null>(null)
  const [savedIdxs, setSavedIdxs]       = useState<Set<number>>(new Set())

  useEffect(() => {
    const stored = localStorage.getItem(LS_IDEAS)
    if (stored) {
      setIdeas(JSON.parse(stored))
    } else if (scan?.ideas?.length) {
      const seeded = scan.ideas.map((idea, i) => ({ ...idea, id: idea.id ?? `scani${i}` }))
      setIdeas(seeded)
      localStorage.setItem(LS_IDEAS, JSON.stringify(seeded))
    }
  }, [scan])

  function persist(updated: UserIdea[]) { setIdeas(updated); localStorage.setItem(LS_IDEAS, JSON.stringify(updated)) }
  function deleteIdea(id: string) { persist(ideas.filter(i => i.id !== id)) }

  function saveEdit(id: string) {
    persist(ideas.map(i => i.id === id ? { ...i, title: editTitle, whyNow: editWhyNow } : i))
    setEditingId(null)
  }

  function addManual() {
    if (!newTitle.trim()) return
    const idea: UserIdea = {
      id: uid(), title: newTitle.trim(),
      pillar: newPillar || (scan?.pillars?.[0]?.name ?? 'General'),
      trendScore: 50, trendDirection: 'stable',
      hookSuggestion: '', urgency: newUrgency, whyNow: newWhyNow.trim(),
    }
    persist([idea, ...ideas])
    setNewTitle(''); setNewWhyNow(''); setShowManual(false)
  }

  async function refreshIdea(idea: UserIdea) {
    setRefreshingId(idea.id)
    const trending = scan?.trendPulse?.filter(t => t.direction === 'rising').map(t => t.keyword).slice(0, 5).join(', ') ?? ''
    try {
      const prompt = `Generate a fresh Instagram content idea for a ${niche} content creator.
Pillar: ${idea.pillar}
The original idea was "${idea.title}" — create something distinctly different for the same pillar.
Trending: ${trending || 'use your knowledge of current trends in this creator\'s niche'}
Return ONLY JSON (no markdown): { "title": "...", "whyNow": "...", "hookSuggestion": "...", "urgency": "post this week|post this month|evergreen", "triggerWord": "..." }`
      const res  = await fetch('/api/groq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, maxTokens: 300 }) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const clean = data.text?.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim() ?? ''
      const parsed = JSON.parse(clean)
      persist(ideas.map(i => i.id === idea.id ? { ...i, title: parsed.title ?? i.title, whyNow: parsed.whyNow ?? i.whyNow, hookSuggestion: parsed.hookSuggestion ?? i.hookSuggestion, urgency: parsed.urgency ?? i.urgency, triggerWord: parsed.triggerWord ?? i.triggerWord } : i))
    } catch (e: unknown) {
      console.error('[refreshIdea]', e instanceof Error ? e.message : e)
    }
    finally { setRefreshingId(null) }
  }

  async function generateIdeasWithAI() {
    if (!aiTopic.trim()) return
    setAiGenerating(true); setAiResults([]); setSavedIdxs(new Set())
    const trending = scan?.trendPulse?.filter(t => t.direction === 'rising').map(t => t.keyword).slice(0, 5).join(', ') ?? ''
    try {
      const prompt = `Generate 5 Instagram content ideas for a ${niche} content creator.
${aiPillar ? `Content pillar / category: ${aiPillar}` : ''}
Topic or theme: ${aiTopic}
Trending now: ${trending || 'use your knowledge of current trends in this creator\'s niche'}

Return ONLY a JSON array (no markdown):
[
  {
    "title": "specific post title",
    "pillar": "${aiPillar || 'General'}",
    "whyNow": "why this is relevant right now",
    "hookSuggestion": "opening line for this post",
    "urgency": "post this week|post this month|evergreen",
    "triggerWord": "CTA trigger word or empty string",
    "trendScore": 60
  }
]`
      const res  = await fetch('/api/groq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, maxTokens: 800 }) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const clean = data.text?.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim() ?? ''
      let parsed: Omit<UserIdea, 'id'>[] = []
      try { parsed = JSON.parse(clean) } catch { throw new Error('AI returned unexpected format — try again') }
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('No ideas generated — try a different topic')
      setAiResults(parsed)
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : 'Generation failed')
      setAiResults([])
    }
    finally { setAiGenerating(false) }
  }

  function saveAIIdea(idx: number) {
    const raw = aiResults[idx]
    if (!raw) return
    const idea: UserIdea = {
      id: uid(), title: raw.title, pillar: raw.pillar || aiPillar || 'General',
      trendScore: raw.trendScore ?? 60, trendDirection: 'stable',
      hookSuggestion: raw.hookSuggestion ?? '', triggerWord: raw.triggerWord || undefined,
      urgency: raw.urgency ?? 'post this month', whyNow: raw.whyNow ?? '',
    }
    persist([idea, ...ideas])
    setSavedIdxs(prev => new Set(prev).add(idx))
  }

  const pillarOptions = scan?.pillars?.map(p => p.name) ?? ['Education', 'Tools & Resources', 'Behind the Scenes', 'Opinion', 'Community']
  const pillars       = ['All', ...Array.from(new Set(ideas.map(i => i.pillar).filter(Boolean)))]
  const filtered      = ideas.filter(i => filterPillar === 'All' || i.pillar === filterPillar)
  const sorted        = [...filtered].sort((a, b) => {
    if (sort === 'trendScore') return b.trendScore - a.trendScore
    if (sort === 'urgency')    return URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]
    return a.pillar.localeCompare(b.pillar)
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          {pillars.map(p => <button key={p} onClick={() => setFilter(p)} className={`pill-filter${filterPillar === p ? ' active' : ''}`} style={{ fontSize: 12 }}>{p}</button>)}
        </div>
        <div className="segmented">
          {(['trendScore', 'urgency', 'pillar'] as const).map(s => (
            <button key={s} onClick={() => setSort(s)} className={`segment${sort === s ? ' active' : ''}`}>
              {s === 'trendScore' ? 'Trend' : s === 'urgency' ? 'Urgency' : 'Pillar'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => { setShowAIGen(v => !v); setShowManual(false) }} className={showAIGen ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: 12, padding: '6px 14px' }}>
            Generate with AI ✦
          </button>
          <button onClick={() => { setShowManual(v => !v); setShowAIGen(false) }} className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>
            + Add manually
          </button>
        </div>
      </div>

      {/* AI generate form */}
      {showAIGen && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, borderColor: 'var(--accent-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p className="section-label" style={{ flex: 1 }}>Generate ideas with AI</p>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Niche: {niche}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              className="input"
              value={aiTopic}
              onChange={e => setAiTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generateIdeasWithAI()}
              placeholder="Topic or theme (e.g. content batching, audience growth, tool workflow)"
              style={{ fontSize: 13, flex: 1, minWidth: 200 }}
              autoFocus
            />
            <select className="input" style={{ maxWidth: 200, fontSize: 12 }} value={aiPillar} onChange={e => setAiPillar(e.target.value)}>
              <option value="">Any pillar</option>
              {pillarOptions.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={generateIdeasWithAI} disabled={aiGenerating || !aiTopic.trim()} className="btn-primary" style={{ fontSize: 12 }}>
              {aiGenerating ? 'Generating...' : 'Generate 5 ideas →'}
            </button>
            {aiResults.length > 0 && <button onClick={() => { setAiResults([]); setSavedIdxs(new Set()) }} className="btn-ghost" style={{ fontSize: 12, width: 'auto', padding: '4px 8px' }}>Clear</button>}
          </div>

          {aiError && (
            <div style={{ padding: '8px 12px', background: 'var(--red-subtle)', border: '1px solid rgba(229,72,77,0.2)', borderRadius: 7, fontSize: 12, color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {aiError}
              <button onClick={() => setAiError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 14, padding: 0 }}>×</button>
            </div>
          )}

          {/* AI Results */}
          {aiResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                Review generated ideas — save the ones you like to your bank:
              </p>
              {aiResults.map((idea, idx) => {
                const saved = savedIdxs.has(idx)
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 14px', borderRadius: 8,
                      background: saved ? 'var(--green-subtle)' : 'var(--bg-elevated)',
                      border: `1px solid ${saved ? 'rgba(48,164,108,0.20)' : 'var(--border)'}`,
                      transition: 'all 160ms ease',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                        {idea.pillar && <span className="tag tag-default" style={{ fontSize: 11 }}>{idea.pillar}</span>}
                        {idea.urgency === 'post this week' && <span className="badge badge-urgent" style={{ fontSize: 10 }}>This Week</span>}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: saved ? 'var(--green)' : 'var(--text-primary)', lineHeight: 1.4, marginBottom: 4 }}>{idea.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{idea.whyNow}</p>
                      {idea.hookSuggestion && <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4, fontStyle: 'italic' }}>&ldquo;{idea.hookSuggestion}&rdquo;</p>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                      {!saved ? (
                        <button onClick={() => saveAIIdea(idx)} className="btn-primary" style={{ fontSize: 11, padding: '4px 12px' }}>Save to Bank</button>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 500, padding: '4px 0' }}>✓ Saved</span>
                      )}
                      <button onClick={() => router.push(`/studio?idea=${encodeURIComponent(idea.title)}`)} className="btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }}>Write this</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Manual add form */}
      {showManual && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p className="section-label">Add idea manually</p>
          <input className="input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Idea title..." style={{ fontSize: 13 }} autoFocus />
          <textarea className="input" rows={2} value={newWhyNow} onChange={e => setNewWhyNow(e.target.value)} placeholder="Why post this? (optional context)" style={{ fontSize: 13 }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="input" style={{ maxWidth: 200, fontSize: 12 }} value={newPillar} onChange={e => setNewPillar(e.target.value)}>
              <option value="">Select pillar...</option>
              {pillarOptions.map(p => <option key={p}>{p}</option>)}
            </select>
            <div className="segmented">
              {(['post this week', 'post this month', 'evergreen'] as UserIdea['urgency'][]).map(u => (
                <button key={u} onClick={() => setNewUrgency(u)} className={`segment${newUrgency === u ? ' active' : ''}`} style={{ fontSize: 11 }}>
                  {u === 'post this week' ? 'This Week' : u === 'post this month' ? 'This Month' : 'Evergreen'}
                </button>
              ))}
            </div>
            <button onClick={addManual} disabled={!newTitle.trim()} className="btn-primary" style={{ fontSize: 12 }}>Save to Bank</button>
            <button onClick={() => { setShowManual(false); setNewTitle(''); setNewWhyNow('') }} className="btn-ghost" style={{ fontSize: 12, width: 'auto', padding: '6px 10px' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Grid */}
      {sorted.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '32px 0', textAlign: 'center' }}>No ideas yet. Generate with AI or add one manually.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(idea => {
            const isEditing    = editingId === idea.id
            const isRefreshing = refreshingId === idea.id
            return (
              <div key={idea.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <PillarTag pillar={idea.pillar} />
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <TrendBadge score={idea.trendScore} direction={idea.trendDirection} />
                    <button onClick={() => refreshIdea(idea)} disabled={!!refreshingId} className="btn-ghost" title="Refresh idea" style={{ fontSize: 15, opacity: isRefreshing ? 0.4 : 1 }}>{isRefreshing ? <span style={{ fontSize: 10 }}>…</span> : '↺'}</button>
                    <button onClick={() => deleteIdea(idea.id)} className="btn-ghost" title="Delete" style={{ fontSize: 12 }}>✕</button>
                  </div>
                </div>

                {idea.urgency === 'post this week' && <span className="badge badge-urgent" style={{ alignSelf: 'flex-start', fontSize: 10 }}>Post This Week</span>}

                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input className="input" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ fontSize: 13, fontWeight: 600 }} />
                    <textarea className="input" rows={3} value={editWhyNow} onChange={e => setEditWhyNow(e.target.value)} style={{ fontSize: 12, lineHeight: 1.5 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => saveEdit(idea.id)} className="btn-primary" style={{ fontSize: 12 }}>Save</button>
                      <button onClick={() => setEditingId(null)} className="btn-secondary" style={{ fontSize: 12 }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, cursor: 'text' }} onClick={() => { setEditingId(idea.id); setEditTitle(idea.title); setEditWhyNow(idea.whyNow) }} title="Click to edit">
                      {idea.title}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>{idea.whyNow}</p>
                    {idea.triggerWord && <p style={{ fontSize: 11, color: 'var(--yellow)', fontWeight: 500 }}>Trigger: {idea.triggerWord}</p>}
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <button onClick={() => router.push(`/studio?idea=${encodeURIComponent(idea.title)}`)} className="btn-secondary" style={{ fontSize: 12, flex: 1 }}>Write this</button>
                      <button onClick={() => { setEditingId(idea.id); setEditTitle(idea.title); setEditWhyNow(idea.whyNow) }} className="btn-ghost" title="Edit" style={{ fontSize: 14 }}>✎</button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ══ SCHEDULED TAB ══════════════════════════════════════════════════════════════

interface CalDay { dayNumber: number; date: string; dayName: string; postType: string; title: string; postingTime: string }

function ScheduledTab({ onSwitchTab }: { onSwitchTab: () => void }) {
  const router = useRouter()
  const [scripts, setScripts]       = useState<SavedScript[]>([])
  const [schedule, setSchedule]     = useState<Record<string, string>>({})
  const [loading, setLoading]       = useState(true)
  const [calDays, setCalDays]       = useState<CalDay[]>([])
  const [calPinMap, setCalPinMap]   = useState<Record<number, { id: string; hookLine: string }>>({})

  useEffect(() => {
    const raw = localStorage.getItem(LS_SCHEDULE)
    setSchedule(raw ? JSON.parse(raw) : {})
    try {
      const pinned = JSON.parse(localStorage.getItem(LS_CAL_SCRIPTS) ?? '{}')
      setCalPinMap(pinned)
    } catch {}
    // Fetch calendar days so we know the dates for pinned dayNumbers
    fetch('/api/calendar')
      .then(r => r.ok ? r.json() : [])
      .then(days => setCalDays(Array.isArray(days) ? days : []))
      .catch(() => {})
    fetch('/api/scripts')
      .then(r => r.json())
      .then(data => { setScripts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function unschedule(id: string) {
    const { [id]: _, ...rest } = schedule
    setSchedule(rest)
    localStorage.setItem(LS_SCHEDULE, JSON.stringify(rest))
  }

  // Merge date-picker scheduled scripts and calendar-pinned scripts into one list
  const calPinnedIds = new Set(Object.values(calPinMap).map(v => v.id).filter(Boolean))

  const scheduledByDate = scripts
    .filter(s => schedule[s.id])
    .map(s => ({ ...s, scheduledDate: schedule[s.id], source: 'date' as const, dayNumber: undefined as number | undefined }))

  const scheduledByCalendar = scripts
    .filter(s => calPinnedIds.has(s.id) && !schedule[s.id]) // avoid duplicating if both scheduled
    .map(s => {
      const dayNum = parseInt(Object.entries(calPinMap).find(([, v]) => v.id === s.id)?.[0] ?? '0')
      const calDay = calDays.find(d => d.dayNumber === dayNum)
      return {
        ...s,
        scheduledDate: calDay?.date ?? '',
        source: 'calendar' as const,
        dayNumber: dayNum,
      }
    })
    .filter(s => s.scheduledDate)

  const scheduled = [...scheduledByDate, ...scheduledByCalendar]
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))

  if (loading) return <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Loading...</p>

  if (scheduled.length === 0) {
    return (
      <div style={{ padding: '72px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>Nothing scheduled yet</p>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', maxWidth: 320 }}>Go to Saved Scripts, open any script, and click the schedule icon to pick a date.</p>
        <button onClick={onSwitchTab} className="btn-secondary" style={{ fontSize: 12, marginTop: 8 }}>View Saved Scripts</button>
      </div>
    )
  }

  const byMonth = scheduled.reduce<Record<string, typeof scheduled>>((acc, s) => {
    const key = s.scheduledDate.slice(0, 7)
    ;(acc[key] = acc[key] ?? []).push(s)
    return acc
  }, {})

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {Object.entries(byMonth).map(([month, entries]) => (
        <section key={month}>
          <p className="section-label" style={{ marginBottom: 12 }}>
            {new Date(month + '-01T00:00').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </p>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            {entries.map((entry, i) => {
              const d = new Date(entry.scheduledDate + 'T00:00')
              return (
                <div key={entry.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '12px 16px', borderBottom: i < entries.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div style={{ width: 52, flexShrink: 0, textAlign: 'center' }}>
                    <p style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d.toLocaleDateString('en-GB', { weekday: 'short' })}</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-secondary)', lineHeight: 1.2 }}>{d.getDate()}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 4 }}>{entry.hookLine || entry.input.slice(0, 80)}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {entry.format && <span className="tag tag-default" style={{ fontSize: 11 }}>{entry.format}</span>}
                      {entry.tone   && <span className="tag tag-default" style={{ fontSize: 11 }}>{entry.tone}</span>}
                      {entry.source === 'calendar' && entry.dayNumber && (
                        <span className="tag" style={{ fontSize: 11, background: 'var(--accent-subtle)', color: 'var(--accent)', borderColor: 'var(--accent-border)' }}>
                          📅 Day {entry.dayNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'flex-start' }}>
                    <button
                      onClick={() => {
                        try {
                          localStorage.setItem(LS_STUDIO_DRAFT, JSON.stringify({ idea: entry.input, format: entry.format, tone: entry.tone || 'Casual', language: 'English', output: entry.output }))
                        } catch {}
                        router.push('/studio')
                      }}
                      className="btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }}>
                      Load in Studio
                    </button>
                    {entry.source !== 'calendar' && (
                      <button onClick={() => unschedule(entry.id)} className="btn-ghost" title="Remove from schedule" style={{ fontSize: 12 }}>✕</button>
                    )}
                    {entry.source === 'calendar' && (
                      <button onClick={() => router.push('/calendar')} className="btn-ghost" title="View in calendar" style={{ fontSize: 11, width: 'auto', padding: '4px 8px', color: 'var(--accent)' }}>
                        Calendar →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
