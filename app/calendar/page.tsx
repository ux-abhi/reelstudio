'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonGrid } from '@/components/shared/SkeletonCard'
import { PillarTag } from '@/components/shared/PillarTag'
import { PageHeader } from '@/components/shared/PageHeader'
import { CalendarDay } from '@/types/scan'
import type { SavedScript } from '@/types/scan'

const WEEK_THEMES = [
  'Foundation — algorithm reset, reach spike',
  'Momentum — collab + double down on winners',
  'Authority — expertise, startup audience',
  'Virality — max shareables, comment triggers',
]

const POST_TYPE_COLOR: Record<string, string> = {
  Reel:           'var(--accent)',
  Carousel:       'var(--green)',
  Stories:        'var(--yellow)',
  'Talking Head': 'var(--red)',
}

const POST_TYPES = ['Reel', 'Carousel', 'Stories', 'Talking Head']

type CalendarEdits   = Record<number, Partial<CalendarDay>>
type AttachedScript  = Pick<SavedScript, 'id' | 'hookLine' | 'output' | 'format'>
type CalendarScripts = Record<number, AttachedScript>

const LS_EDITS   = 'ss:calendar:edits'
const LS_SCRIPTS = 'ss:calendar:scripts'

function loadEdits(): CalendarEdits {
  try { return JSON.parse(localStorage.getItem(LS_EDITS) ?? '{}') } catch { return {} }
}
function loadAttached(): CalendarScripts {
  try { return JSON.parse(localStorage.getItem(LS_SCRIPTS) ?? '{}') } catch { return {} }
}

export default function CalendarPage() {
  const { scan, isScanning, isInitialLoad } = useScan()
  const router = useRouter()

  const [edits, setEdits]           = useState<CalendarEdits>({})
  const [attached, setAttached]     = useState<CalendarScripts>({})
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [draft, setDraft]           = useState<Partial<CalendarDay>>({})
  const [savedDay, setSavedDay]     = useState<number | null>(null)
  const [pickerDay, setPickerDay]   = useState<number | null>(null)
  const [scripts, setScripts]       = useState<SavedScript[]>([])
  const [scriptsLoading, setScriptsLoading] = useState(false)
  const [viewScript, setViewScript] = useState<AttachedScript | null>(null)
  const [viewCopied, setViewCopied] = useState(false)
  const [postingGoal, setPostingGoal] = useState('3×/week')
  const [copiedRow, setCopiedRow]   = useState<number | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    setEdits(loadEdits())
    setAttached(loadAttached())
    try {
      const g = localStorage.getItem('ss:posting-goal')
      if (g) setPostingGoal(g)
    } catch {}
  }, [])

  // Reload attached scripts when tab regains focus — keeps state in sync with
  // changes made in Save Board or Studio while this page was in the background
  useEffect(() => {
    const sync = () => setAttached(loadAttached())
    window.addEventListener('focus', sync)
    document.addEventListener('visibilitychange', () => { if (!document.hidden) sync() })
    return () => {
      window.removeEventListener('focus', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  if (isScanning || isInitialLoad) return <SkeletonGrid count={8} />
  if (!scan?.calendar?.length) return (
    <EmptyState
      title="No calendar yet"
      description="Run your scan to generate your content calendar with real dates, post types, and hooks."
    />
  )

  const calendar = scan.calendar.map(day => ({ ...day, ...edits[day.dayNumber] }))
  const weeks: CalendarDay[][] = [[], [], [], []]
  calendar.forEach((day: CalendarDay) => {
    const w = Math.min(Math.floor((day.dayNumber - 1) / 7), 3)
    weeks[w].push(day)
  })

  function startEdit(day: CalendarDay) {
    setEditingDay(day.dayNumber)
    setDraft({
      title:       day.title,
      hook:        day.hook,
      postType:    day.postType,
      triggerWord: day.triggerWord ?? '',
      postingTime: day.postingTime,
    })
  }

  async function saveEdit(dayNumber: number) {
    const next = { ...edits, [dayNumber]: { ...(edits[dayNumber] ?? {}), ...draft } }
    setEdits(next)
    localStorage.setItem(LS_EDITS, JSON.stringify(next))
    setEditingDay(null)
    setSavedDay(dayNumber)
    setTimeout(() => setSavedDay(null), 1800)

    try {
      await fetch('/api/calendar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayNumber, edits: draft }),
      })
    } catch { /* localStorage edit already applied */ }
  }

  function resetDayEdit(dayNumber: number) {
    const next = { ...edits }
    delete next[dayNumber]
    setEdits(next)
    localStorage.setItem(LS_EDITS, JSON.stringify(next))
    setDraft({})
    setEditingDay(null)
  }

  function resetAllEdits() {
    setEdits({})
    localStorage.removeItem(LS_EDITS)
  }

  const openPicker = useCallback(async (dayNumber: number) => {
    setPickerDay(dayNumber)
    setScriptsLoading(true)
    try {
      const data = await fetch('/api/scripts').then(r => r.json())
      setScripts(Array.isArray(data) ? data : [])
    } catch {} finally { setScriptsLoading(false) }
  }, [])

  function attachScript(dayNumber: number, script: SavedScript) {
    const next = {
      ...attached,
      [dayNumber]: { id: script.id, hookLine: script.hookLine, output: script.output, format: script.format },
    }
    setAttached(next)
    localStorage.setItem(LS_SCRIPTS, JSON.stringify(next))
    setPickerDay(null)
  }

  function detachScript(dayNumber: number) {
    const next = { ...attached }
    delete next[dayNumber]
    setAttached(next)
    localStorage.setItem(LS_SCRIPTS, JSON.stringify(next))
  }

  function copyHook(text: string, dayNumber: number) {
    navigator.clipboard.writeText(text)
    setCopiedRow(dayNumber)
    setTimeout(() => setCopiedRow(null), 1600)
  }

  const hasEdits = Object.keys(edits).length > 0

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <PageHeader
          label="Schedule"
          title="30-Day Calendar"
          subtitle="Click ✎ to edit a day · Write to draft a script · ⊕ to attach a saved script"
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginTop: 4 }}>
          {hasEdits && (
            <button
              onClick={resetAllEdits}
              className="btn-ghost"
              style={{ fontSize: 11, width: 'auto', padding: '4px 10px', color: 'var(--text-tertiary)' }}
              title="Clear all your manual edits and restore AI-generated content"
            >
              Reset edits
            </button>
          )}
          <span className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-hover)', borderColor: 'var(--accent-border)' }}>
            Target: {postingGoal}
          </span>
        </div>
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) =>
        week.length === 0 ? null : (
          <section key={wi}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-hover)', borderColor: 'var(--accent-border)', fontWeight: 600 }}>
                Week {wi + 1}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{WEEK_THEMES[wi]}</span>
            </div>

            <div style={{ background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {week.map((day: CalendarDay, di) => {
                const isEditing  = editingDay === day.dayNumber
                const isSaved    = savedDay   === day.dayNumber
                const script     = attached[day.dayNumber]
                const isDayEdited = !!edits[day.dayNumber]

                return (
                  <div
                    key={day.dayNumber}
                    style={{
                      borderBottom:    di < week.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      boxShadow:       isSaved ? 'inset 3px 0 0 var(--green)' : 'none',
                      transition:      'box-shadow 400ms ease',
                    }}
                  >
                    {/* ── Main row ── */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '12px 16px' }}>

                      {/* Date column */}
                      <div style={{ width: 52, flexShrink: 0, textAlign: 'center' }}>
                        <p style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{day.dayName}</p>
                        <p style={{ fontSize: 20, fontWeight: 700, color: isDayEdited ? 'var(--accent)' : 'var(--text-secondary)', lineHeight: 1.2 }}>
                          {day.date?.split('-')[2] ?? day.dayNumber}
                        </p>
                        <p style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{day.postingTime}</p>
                        {isDayEdited && (
                          <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2 }}>edited</p>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span className="badge" style={{
                            background:  `${POST_TYPE_COLOR[day.postType] ?? 'var(--accent)'}18`,
                            color:       POST_TYPE_COLOR[day.postType] ?? 'var(--accent)',
                            borderColor: `${POST_TYPE_COLOR[day.postType] ?? 'var(--accent)'}33`,
                            fontWeight:  600,
                          }}>
                            {day.postType}
                          </span>
                          <PillarTag pillar={day.pillar} />
                          {day.optimisedFor && (
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>for {day.optimisedFor}</span>
                          )}
                        </div>

                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 4 }}>{day.title}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{day.hook}</p>

                        <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          {day.triggerWord && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--yellow)' }}>&ldquo;{day.triggerWord}&rdquo;</span>
                          )}
                          {day.trendSignal && (
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>↑ {day.trendSignal}</span>
                          )}
                        </div>

                        {/* Attached script strip */}
                        {script && !isEditing && (
                          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--accent-subtle)', borderRadius: 6, border: '1px solid var(--accent-border)' }}>
                            <span style={{ fontSize: 11, color: 'var(--accent)', flexShrink: 0 }}>✦ Script</span>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                              {script.hookLine}
                            </span>
                            <button onClick={() => setViewScript(script)} className="btn-ghost" style={{ fontSize: 11, width: 'auto', height: 'auto', padding: '2px 8px' }}>
                              View
                            </button>
                            <button onClick={() => detachScript(day.dayNumber)} className="btn-ghost" style={{ fontSize: 13, width: 20, height: 20, padding: 0, color: 'var(--text-tertiary)' }} title="Remove script">
                              ×
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      {!isEditing && (
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignSelf: 'flex-start' }}>
                          {/* Write / Re-write */}
                          <button
                            onClick={() => router.push(`/studio?idea=${encodeURIComponent(day.title)}&calendarDay=${day.dayNumber}`)}
                            className="btn-secondary"
                            style={{ fontSize: 11, padding: '4px 10px', color: script ? 'var(--accent)' : undefined }}
                            title={script ? 'Re-write script for this day' : 'Write a script for this day'}
                          >
                            {script ? 'Re-write' : 'Write'}
                          </button>

                          {/* Attach script directly */}
                          <button
                            onClick={() => openPicker(day.dayNumber)}
                            className="btn-ghost"
                            style={{ fontSize: 13, color: script ? 'var(--accent)' : 'var(--text-tertiary)' }}
                            title={script ? 'Replace attached script' : 'Attach a saved script'}
                          >
                            ⊕
                          </button>

                          {/* Copy hook */}
                          <button
                            onClick={() => copyHook(day.hook, day.dayNumber)}
                            className="btn-ghost"
                            style={{ fontSize: 11, width: 'auto', padding: '4px 7px', color: copiedRow === day.dayNumber ? 'var(--green)' : 'var(--text-tertiary)' }}
                            title="Copy hook"
                          >
                            {copiedRow === day.dayNumber ? '✓' : '⎘'}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => startEdit(day)}
                            className="btn-ghost"
                            style={{ fontSize: 13, color: isDayEdited ? 'var(--accent)' : 'var(--text-tertiary)' }}
                            title="Edit this day"
                          >
                            ✎
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ── Edit panel ── */}
                    {isEditing && (
                      <div style={{ padding: '0 16px 16px 84px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <select
                            className="input"
                            value={draft.postType ?? day.postType}
                            onChange={e => setDraft(d => ({ ...d, postType: e.target.value as CalendarDay['postType'] }))}
                            style={{ fontSize: 12, width: 'auto', flex: '0 0 auto' }}
                          >
                            {POST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <input
                            className="input"
                            maxLength={20}
                            value={draft.triggerWord ?? ''}
                            onChange={e => setDraft(d => ({ ...d, triggerWord: e.target.value }))}
                            placeholder='Trigger word (e.g. "TOOLS")'
                            style={{ fontSize: 12, flex: 1, minWidth: 140 }}
                          />
                          <input
                            className="input"
                            maxLength={10}
                            value={draft.postingTime ?? ''}
                            onChange={e => setDraft(d => ({ ...d, postingTime: e.target.value }))}
                            placeholder="19:00"
                            style={{ fontSize: 12, width: 90 }}
                          />
                        </div>

                        <input
                          className="input"
                          maxLength={120}
                          value={draft.title ?? ''}
                          onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                          placeholder="Post title"
                          style={{ fontSize: 13, fontWeight: 500 }}
                          autoFocus
                        />

                        <textarea
                          className="input"
                          maxLength={300}
                          value={draft.hook ?? ''}
                          onChange={e => setDraft(d => ({ ...d, hook: e.target.value }))}
                          placeholder="Hook / opening line"
                          rows={2}
                          style={{ fontSize: 12, resize: 'vertical' }}
                        />

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button onClick={() => saveEdit(day.dayNumber)} className="btn-primary" style={{ fontSize: 12, padding: '5px 14px' }}>
                            Save
                          </button>
                          <button onClick={() => setEditingDay(null)} className="btn-secondary" style={{ fontSize: 12, padding: '5px 14px' }}>
                            Cancel
                          </button>
                          {isDayEdited && (
                            <button
                              onClick={() => resetDayEdit(day.dayNumber)}
                              className="btn-ghost"
                              style={{ fontSize: 11, width: 'auto', padding: '4px 10px', color: 'var(--text-tertiary)' }}
                              title="Restore the original AI-generated content for this day"
                            >
                              Reset to AI
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      )}

      {/* ── Script picker modal ── */}
      {pickerDay !== null && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setPickerDay(null)}
        >
          <div
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 12, width: '100%', maxWidth: 520, maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Attach a saved script</p>
                {attached[pickerDay] && (
                  <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2 }}>Currently attached — pick another to replace</p>
                )}
              </div>
              <button onClick={() => setPickerDay(null)} className="btn-ghost">×</button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {scriptsLoading && (
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: 16, textAlign: 'center' }}>Loading scripts...</p>
              )}
              {!scriptsLoading && scripts.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 12 }}>No saved scripts yet.</p>
                  <button onClick={() => { setPickerDay(null); router.push('/studio') }} className="btn-secondary" style={{ fontSize: 12 }}>
                    Open Studio →
                  </button>
                </div>
              )}
              {scripts.map(s => {
                const isCurrentlyAttached = attached[pickerDay]?.id === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => attachScript(pickerDay, s)}
                    style={{
                      textAlign: 'left',
                      background: isCurrentlyAttached ? 'var(--accent-subtle)' : 'var(--bg-card)',
                      border: `1px solid ${isCurrentlyAttached ? 'var(--accent-border)' : 'var(--border)'}`,
                      borderRadius: 8, padding: '10px 14px', cursor: 'pointer', transition: 'border-color 120ms ease',
                    }}
                    onMouseEnter={e => { if (!isCurrentlyAttached) e.currentTarget.style.borderColor = 'var(--accent)' }}
                    onMouseLeave={e => { if (!isCurrentlyAttached) e.currentTarget.style.borderColor = 'var(--border)' }}
                  >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span className="badge" style={{ fontSize: 10, background: 'var(--accent-subtle)', color: 'var(--accent)', borderColor: 'var(--accent-border)' }}>{s.format}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{new Date(s.savedAt).toLocaleDateString()}</span>
                      {isCurrentlyAttached && <span style={{ fontSize: 10, color: 'var(--accent)', marginLeft: 'auto' }}>✓ attached</span>}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>{s.hookLine}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Script viewer modal ── */}
      {viewScript && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setViewScript(null)}
        >
          <div
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 12, width: '100%', maxWidth: 560, maxHeight: '75vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 0 }}>
                <span className="badge" style={{ fontSize: 10, background: 'var(--accent-subtle)', color: 'var(--accent)', borderColor: 'var(--accent-border)', flexShrink: 0 }}>{viewScript.format}</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{viewScript.hookLine}</p>
              </div>
              <button onClick={() => setViewScript(null)} className="btn-ghost" style={{ flexShrink: 0 }}>×</button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
              <pre style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontFamily: 'inherit' }}>
                {viewScript.output}
              </pre>
            </div>

            <div style={{ display: 'flex', gap: 8, padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(viewScript.output)
                  setViewCopied(true)
                  setTimeout(() => setViewCopied(false), 2000)
                }}
                className="btn-secondary"
                style={{ fontSize: 12, color: viewCopied ? 'var(--green)' : undefined }}
              >
                {viewCopied ? '✓ Copied' : 'Copy script'}
              </button>
              <button
                onClick={() => {
                  setViewScript(null)
                  router.push(`/studio?idea=${encodeURIComponent(viewScript.hookLine)}`)
                }}
                className="btn-ghost"
                style={{ fontSize: 12, width: 'auto', padding: '6px 14px' }}
              >
                Open in Studio →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
