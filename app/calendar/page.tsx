'use client'
import { useState, useEffect } from 'react'
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

export default function CalendarPage() {
  const { scan, isScanning, isInitialLoad } = useScan()
  const router = useRouter()
  const [edits, setEdits]           = useState<CalendarEdits>({})
  const [attached, setAttached]     = useState<CalendarScripts>({})
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [draft, setDraft]           = useState<Partial<CalendarDay>>({})
  const [pickerDay, setPickerDay]   = useState<number | null>(null)
  const [scripts, setScripts]       = useState<SavedScript[]>([])
  const [scriptsLoading, setScriptsLoading] = useState(false)
  const [viewScript, setViewScript] = useState<AttachedScript | null>(null)
  const [postingGoal, setPostingGoal] = useState('3×/week')

  useEffect(() => {
    try {
      const e = localStorage.getItem(LS_EDITS)
      if (e) setEdits(JSON.parse(e))
      const s = localStorage.getItem(LS_SCRIPTS)
      if (s) setAttached(JSON.parse(s))
      const g = localStorage.getItem('ss:posting-goal')
      if (g) setPostingGoal(g)
    } catch {}
  }, [])

  if (isScanning || isInitialLoad) return <SkeletonGrid count={8} />
  if (!scan?.calendar?.length) return (
    <EmptyState title="No calendar yet" description="Run your scan to generate a 30-day content calendar with real dates, post types, and hooks." />
  )

  const calendar = scan.calendar.map(day => ({ ...day, ...edits[day.dayNumber] }))
  const weeks: CalendarDay[][] = [[], [], [], []]
  calendar.forEach((day: CalendarDay) => {
    const w = Math.min(Math.floor((day.dayNumber - 1) / 7), 3)
    weeks[w].push(day)
  })

  function startEdit(day: CalendarDay) {
    setEditingDay(day.dayNumber)
    setDraft({ title: day.title, hook: day.hook, postType: day.postType, triggerWord: day.triggerWord ?? '', postingTime: day.postingTime })
  }

  function saveEdit(dayNumber: number) {
    const next = { ...edits, [dayNumber]: { ...(edits[dayNumber] ?? {}), ...draft } }
    setEdits(next)
    localStorage.setItem(LS_EDITS, JSON.stringify(next))
    setEditingDay(null)
  }

  async function openPicker(dayNumber: number) {
    setPickerDay(dayNumber)
    if (scripts.length === 0) {
      setScriptsLoading(true)
      try {
        const data = await fetch('/api/scripts').then(r => r.json())
        setScripts(Array.isArray(data) ? data : [])
      } catch {} finally { setScriptsLoading(false) }
    }
  }

  function attachScript(dayNumber: number, script: SavedScript) {
    const next = { ...attached, [dayNumber]: { id: script.id, hookLine: script.hookLine, output: script.output, format: script.format } }
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

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <PageHeader label="Schedule" title="30-Day Calendar" subtitle="Real dates. AI-generated hooks. Click any row to edit." />
        <span className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-hover)', borderColor: 'var(--accent-border)', flexShrink: 0, marginTop: 4 }}>
          Target: {postingGoal}
        </span>
      </div>

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
                const isEditing = editingDay === day.dayNumber
                const script    = attached[day.dayNumber]
                return (
                  <div
                    key={day.dayNumber}
                    style={{
                      borderBottom: di < week.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      transition: 'background 100ms ease',
                    }}
                  >
                    {/* Main row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '12px 16px' }}>
                      {/* Date */}
                      <div style={{ width: 52, flexShrink: 0, textAlign: 'center' }}>
                        <p style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{day.dayName}</p>
                        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-secondary)', lineHeight: 1.2 }}>
                          {day.date?.split('-')[2] ?? day.dayNumber}
                        </p>
                        <p style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{day.postingTime}</p>
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span className="badge" style={{ background: `${POST_TYPE_COLOR[day.postType] ?? 'var(--accent)'}18`, color: POST_TYPE_COLOR[day.postType] ?? 'var(--accent)', borderColor: `${POST_TYPE_COLOR[day.postType] ?? 'var(--accent)'}33`, fontWeight: 600 }}>
                            {day.postType}
                          </span>
                          <PillarTag pillar={day.pillar} />
                          {day.optimisedFor && (
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>for {day.optimisedFor}</span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 4 }}>{day.title}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{day.hook}</p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                          {day.triggerWord && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--yellow)' }}>&ldquo;{day.triggerWord}&rdquo;</span>
                          )}
                          {day.trendSignal && (
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>↑ {day.trendSignal}</span>
                          )}
                        </div>
                        {/* Script indicator */}
                        {script && !isEditing && (
                          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--accent-subtle)', borderRadius: 6, border: '1px solid var(--accent-border)' }}>
                            <span style={{ fontSize: 11, color: 'var(--accent)', flexShrink: 0 }}>✦ Script</span>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{script.hookLine}</span>
                            <button onClick={() => setViewScript(script)} className="btn-ghost" style={{ fontSize: 11, width: 'auto', height: 'auto', padding: '2px 8px' }}>View</button>
                            <button onClick={() => detachScript(day.dayNumber)} className="btn-ghost" style={{ fontSize: 11, width: 'auto', height: 'auto', padding: '2px 6px', color: 'var(--text-tertiary)' }}>×</button>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignSelf: 'flex-start' }}>
                        {!isEditing && (
                          <>
                            <button
                              onClick={() => router.push(`/studio?idea=${encodeURIComponent(day.title)}`)}
                              className="btn-secondary"
                              style={{ fontSize: 11, padding: '4px 10px' }}
                            >
                              Write
                            </button>
                            <button
                              onClick={() => startEdit(day)}
                              className="btn-ghost"
                              style={{ fontSize: 13 }}
                              title="Edit"
                            >
                              ✎
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Edit panel */}
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
                        />
                        <textarea
                          className="input"
                          maxLength={300}
                          value={draft.hook ?? ''}
                          onChange={e => setDraft(d => ({ ...d, hook: e.target.value }))}
                          placeholder="Hook / opening line"
                          rows={2}
                          style={{ fontSize: 12, resize: 'vertical' as const }}
                        />
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button onClick={() => saveEdit(day.dayNumber)} className="btn-primary" style={{ fontSize: 12, padding: '5px 14px' }}>
                            Save
                          </button>
                          <button onClick={() => setEditingDay(null)} className="btn-secondary" style={{ fontSize: 12, padding: '5px 14px' }}>
                            Cancel
                          </button>
                          <button
                            onClick={() => { setEditingDay(null); openPicker(day.dayNumber) }}
                            className="btn-ghost"
                            style={{ fontSize: 12, width: 'auto', padding: '5px 12px', marginLeft: 'auto', color: attached[day.dayNumber] ? 'var(--accent)' : 'var(--text-secondary)' }}
                          >
                            {attached[day.dayNumber] ? '✦ Script attached' : '+ Attach script'}
                          </button>
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

      {/* Script picker modal */}
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
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Attach a saved script</p>
              <button onClick={() => setPickerDay(null)} className="btn-ghost">×</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {scriptsLoading && (
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: 16, textAlign: 'center' }}>Loading scripts...</p>
              )}
              {!scriptsLoading && scripts.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: 16, textAlign: 'center' }}>No saved scripts yet. Write one in Studio first.</p>
              )}
              {scripts.map(s => (
                <button
                  key={s.id}
                  onClick={() => attachScript(pickerDay, s)}
                  style={{ textAlign: 'left', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', transition: 'border-color 120ms ease' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span className="badge" style={{ fontSize: 10, background: 'var(--accent-subtle)', color: 'var(--accent)', borderColor: 'var(--accent-border)' }}>{s.format}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{new Date(s.savedAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>{s.hookLine}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Script viewer modal */}
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
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="badge" style={{ fontSize: 10, background: 'var(--accent-subtle)', color: 'var(--accent)', borderColor: 'var(--accent-border)' }}>{viewScript.format}</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{viewScript.hookLine}</p>
              </div>
              <button onClick={() => setViewScript(null)} className="btn-ghost">×</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
              <pre style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontFamily: 'inherit' }}>
                {viewScript.output}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
