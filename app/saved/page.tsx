'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { SavedScript } from '@/types/scan'

interface CalendarDayMini {
  dayNumber: number
  date: string
  dayName: string
  postType: string
  title: string
  postingTime: string
  pillar: string
}

const LS_CAL_SCRIPTS = 'ss:calendar:scripts'

function getAttachedMap(): Record<string, { id: string; hookLine: string }> {
  try { return JSON.parse(localStorage.getItem(LS_CAL_SCRIPTS) ?? '{}') } catch { return {} }
}

export default function SavedPage() {
  const router = useRouter()
  const [scripts, setScripts] = useState<SavedScript[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterFormat, setFilterFormat] = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Schedule-to-calendar state
  const [schedulingScript, setSchedulingScript] = useState<SavedScript | null>(null)
  const [calDays, setCalDays] = useState<CalendarDayMini[]>([])
  const [calLoading, setCalLoading] = useState(false)
  const [attached, setAttached] = useState<Record<string, { id: string; hookLine: string }>>({})
  const [scheduledDay, setScheduledDay] = useState<number | null>(null)

  useEffect(() => {
    setAttached(getAttachedMap())
    fetch('/api/scripts')
      .then(r => { if (!r.ok) throw new Error('Failed to load saved scripts'); return r.json() })
      .then(data => { setScripts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(e => { setFetchError(e instanceof Error ? e.message : 'Failed to load scripts'); setLoading(false) })
  }, [])

  const openScheduler = useCallback(async (script: SavedScript) => {
    setSchedulingScript(script)
    setScheduledDay(null)
    if (calDays.length === 0) {
      setCalLoading(true)
      try {
        const data = await fetch('/api/calendar').then(r => r.json())
        setCalDays(Array.isArray(data) ? data : [])
      } catch {} finally { setCalLoading(false) }
    }
  }, [calDays.length])

  function assignToDay(dayNumber: number) {
    if (!schedulingScript) return
    // 1. Save script attachment reference
    const next = { ...getAttachedMap(), [dayNumber]: { id: schedulingScript.id, hookLine: schedulingScript.hookLine, output: schedulingScript.output, format: schedulingScript.format } }
    localStorage.setItem(LS_CAL_SCRIPTS, JSON.stringify(next))
    setAttached(next)
    // 2. Update calendar day content so it shows this script, not the Groq idea
    try {
      const hookMatch = schedulingScript.output?.match(/\[HOOK\]([\s\S]*?)(?=\[BODY\]|$)/)
      const scriptHook = hookMatch?.[1]?.trim().split('\n')[0] || schedulingScript.hookLine
      const calEdits = JSON.parse(localStorage.getItem('ss:calendar:edits') ?? '{}')
      calEdits[dayNumber] = { ...(calEdits[dayNumber] ?? {}), title: schedulingScript.hookLine, hook: scriptHook }
      localStorage.setItem('ss:calendar:edits', JSON.stringify(calEdits))
    } catch {}
    setScheduledDay(dayNumber)
    setTimeout(() => {
      setSchedulingScript(null)
      setScheduledDay(null)
    }, 1200)
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch('/api/scripts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Delete failed — try again')
      setScripts(s => s.filter(sc => sc.id !== id))
      if (expanded === id) setExpanded(null)
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : 'Delete failed')
      setTimeout(() => setDeleteError(null), 4000)
    }
  }

  async function handleCopy(script: SavedScript) {
    await navigator.clipboard.writeText(script.output)
    setCopied(script.id)
    setTimeout(() => setCopied(null), 2000)
  }

  function exportAll() {
    const text = scripts.map(s =>
      `--- ${s.format} | ${s.tone} | ${new Date(s.savedAt).toLocaleDateString()} ---\n${s.output}`
    ).join('\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const handle = localStorage.getItem('ss:handle') ?? 'scripts'
    const a = document.createElement('a'); a.href = url; a.download = `${handle}-scripts.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  // Find which day a script is attached to
  function attachedDayFor(scriptId: string): number | null {
    const entry = Object.entries(attached).find(([, v]) => v.id === scriptId)
    return entry ? parseInt(entry[0]) : null
  }

  const formats = ['All', ...Array.from(new Set(scripts.map(s => s.format).filter(Boolean)))]
  const filtered = scripts.filter(s => {
    const matchFormat = filterFormat === 'All' || s.format === filterFormat
    const matchSearch = !search || s.hookLine.toLowerCase().includes(search.toLowerCase()) || s.input.toLowerCase().includes(search.toLowerCase())
    return matchFormat && matchSearch
  })

  if (fetchError) return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader label="Saved" title="Save Board" subtitle="Could not load scripts" />
      <div style={{ padding: '20px', background: 'var(--red-subtle)', border: '1px solid rgba(196,43,47,0.2)', fontSize: 13, color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {fetchError}
        <button onClick={() => window.location.reload()} className="btn-secondary" style={{ fontSize: 12 }}>Retry</button>
      </div>
    </div>
  )

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageHeader label="Saved" title="Save Board" subtitle={`${scripts.length} saved script${scripts.length !== 1 ? 's' : ''} — write in Studio, schedule to Calendar`} />
      {deleteError && (
        <div style={{ padding: '10px 14px', background: 'var(--red-subtle)', border: '1px solid rgba(196,43,47,0.2)', fontSize: 12, color: 'var(--red)' }}>
          {deleteError}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <input
          className="input"
          style={{ maxWidth: 220, fontSize: 13 }}
          placeholder="Search scripts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {formats.map(f => (
            <button
              key={f}
              onClick={() => setFilterFormat(f)}
              className={`pill-filter${filterFormat === f ? ' active' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>
        {scripts.length > 0 && (
          <button onClick={exportAll} className="btn-ghost" style={{ fontSize: 12, marginLeft: 'auto' }}>
            Export all
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', textAlign: 'center', gap: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>No scripts yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Go to Studio and save your first script</p>
          <button onClick={() => router.push('/studio')} className="btn-primary" style={{ marginTop: 16, fontSize: 13 }}>
            Open Studio
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(script => {
            const pinnedDay = attachedDayFor(script.id)
            return (
              <div key={script.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div
                  style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}
                  onClick={() => setExpanded(expanded === script.id ? null : script.id)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-hover)', lineHeight: 1.4, marginBottom: 6 }}>
                      {script.hookLine || script.input.slice(0, 80)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {script.format && <span className="tag tag-default">{script.format}</span>}
                      {script.tone && <span className="tag tag-default">{script.tone}</span>}
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        {new Date(script.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {/* Calendar pin badge — visible at card level */}
                    {pinnedDay !== null ? (
                      <button
                        onClick={e => { e.stopPropagation(); openScheduler(script) }}
                        style={{ fontSize: 10, fontWeight: 600, color: 'var(--green)', background: 'var(--green-subtle)', border: '1px solid rgba(48,164,108,0.25)', borderRadius: 5, padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit' }}
                        title="Click to change or remove"
                      >
                        Day {pinnedDay} ✓
                      </button>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); openScheduler(script) }}
                        style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 120ms ease' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-tertiary)' }}
                        title="Schedule to calendar"
                      >
                        + Calendar
                      </button>
                    )}
                    <button className="btn-ghost" style={{ fontSize: 16 }}>
                      {expanded === script.id ? '−' : '+'}
                    </button>
                  </div>
                </div>

                {expanded === script.id && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <pre style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontFamily: 'inherit', background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 7, border: '1px solid var(--border)' }}>
                      {script.output}
                    </pre>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        onClick={() => handleCopy(script)}
                        className="btn-secondary"
                        style={{ fontSize: 12, color: copied === script.id ? 'var(--green)' : undefined }}
                      >
                        {copied === script.id ? '✓ Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={() => router.push(`/studio?idea=${encodeURIComponent(script.input)}`)}
                        className="btn-secondary"
                        style={{ fontSize: 12 }}
                      >
                        Load in Studio
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); openScheduler(script) }}
                        className="btn-secondary"
                        style={{ fontSize: 12 }}
                      >
                        {pinnedDay !== null ? `Day ${pinnedDay} — change` : 'Schedule →'}
                      </button>
                      {pinnedDay !== null && (
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            const next = { ...getAttachedMap() }
                            delete next[pinnedDay]
                            localStorage.setItem(LS_CAL_SCRIPTS, JSON.stringify(next))
                            setAttached(next)
                          }}
                          className="btn-ghost"
                          style={{ fontSize: 11, width: 'auto', padding: '3px 10px', color: 'var(--text-tertiary)' }}
                        >
                          Remove from calendar
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(script.id)}
                        className="btn-destructive"
                        style={{ fontSize: 12, marginLeft: 'auto' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Schedule to calendar modal */}
      {schedulingScript && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setSchedulingScript(null)}
        >
          <div
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 12, width: '100%', maxWidth: 480, maxHeight: '75vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Schedule to Calendar</p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{schedulingScript.hookLine?.slice(0, 60)}</p>
              </div>
              <button onClick={() => setSchedulingScript(null)} className="btn-ghost">×</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {calLoading && <p style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: 16, textAlign: 'center' }}>Loading calendar...</p>}
              {!calLoading && calDays.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: 16, textAlign: 'center' }}>
                  No calendar yet — run your scan to generate one.
                </p>
              )}
              {calDays.map(day => {
                const isScheduled = scheduledDay === day.dayNumber
                return (
                  <button
                    key={day.dayNumber}
                    onClick={() => assignToDay(day.dayNumber)}
                    style={{
                      textAlign: 'left',
                      background: isScheduled ? 'var(--green-subtle)' : 'var(--bg-card)',
                      border: `1px solid ${isScheduled ? 'rgba(48,164,108,0.3)' : 'var(--border)'}`,
                      borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}
                    onMouseEnter={e => { if (!isScheduled) e.currentTarget.style.borderColor = 'var(--accent)' }}
                    onMouseLeave={e => { if (!isScheduled) e.currentTarget.style.borderColor = 'var(--border)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ textAlign: 'center', width: 40, flexShrink: 0 }}>
                        <p style={{ fontSize: 9, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{day.dayName}</p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: isScheduled ? 'var(--green)' : 'var(--text-secondary)', lineHeight: 1 }}>
                          {day.date?.split('-')[2] ?? day.dayNumber}
                        </p>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, color: isScheduled ? 'var(--green)' : 'var(--text-primary)', lineHeight: 1.4 }}>
                          {isScheduled ? '✓ Scheduled' : day.title}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{day.postType} · {day.postingTime}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
              <button onClick={() => router.push('/calendar')} className="btn-secondary" style={{ fontSize: 12, width: '100%' }}>
                View 30-Day Calendar →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
