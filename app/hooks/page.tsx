'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { SkeletonGrid } from '@/components/shared/SkeletonCard'
import { PageHeader } from '@/components/shared/PageHeader'

// Shared with Content Library Hooks tab — same localStorage key and interface
const LS_HOOKS = 'ss:user-hooks'

interface UserHook {
  id:           string
  text:         string
  type:         'curiosity' | 'story' | 'hot-take' | 'hinglish'
  basedOn:      string
  trendRelevant:boolean
  hidden?:      boolean   // dismissed from view — can be restored
  isCustom?:    boolean   // user-added — can be permanently deleted
}

const FALLBACK_HOOKS: Omit<UserHook, 'id'>[] = [
  { text: "I can't believe this is still free",                          type: 'curiosity',  basedOn: 'Resource reveal — high engagement',      trendRelevant: true  },
  { text: "Everyone talking about this is missing the most important part",type: 'hot-take', basedOn: 'Contrarian take — drives comments',        trendRelevant: true  },
  { text: "This is what I wish someone told me when I started",          type: 'story',      basedOn: 'Hindsight advice — high save rate',        trendRelevant: false },
  { text: "I figured this out the hard way so you don't have to",        type: 'story',      basedOn: 'Hard-won insight — high engagement',       trendRelevant: false },
  { text: "Stop doing this — it's the reason you're not growing",        type: 'hot-take',   basedOn: 'Mistake callout — high share rate',        trendRelevant: false },
  { text: "The approach nobody in this space is talking about",           type: 'curiosity',  basedOn: 'Hidden gem — saves + DMs',                 trendRelevant: true  },
  { text: "I tested 5 different methods so you don't have to",           type: 'curiosity',  basedOn: 'Comparison/test — drives saves',           trendRelevant: false },
  { text: "Honest take: most advice about this is wrong",                type: 'hot-take',   basedOn: 'Myth-busting — strong comment driver',     trendRelevant: true  },
  { text: "I spent 3 months on this — here's the shortcut",             type: 'story',      basedOn: 'Hard-won shortcut — saves heavily',        trendRelevant: false },
  { text: "POV: You're trying to fix a problem at 11pm with a deadline", type: 'story',      basedOn: 'POV relatable story — saves + shares',     trendRelevant: false },
  { text: "The thing nobody tells you when you're starting out",         type: 'curiosity',  basedOn: 'Insider knowledge — high save rate',       trendRelevant: false },
  { text: "This one change made everything easier",                       type: 'curiosity',  basedOn: 'Single insight reveal — scroll-stopper',   trendRelevant: false },
]

const TYPE_CONFIG: Record<string, { label: string; accent: string; bg: string; border: string }> = {
  curiosity:  { label: 'Curiosity',  accent: 'var(--accent-hover)', bg: 'var(--accent-subtle)',  border: 'var(--accent-border)'        },
  story:      { label: 'Story',      accent: 'var(--green)',        bg: 'var(--green-subtle)',   border: 'rgba(48,164,108,0.25)'       },
  'hot-take': { label: 'Hot Take',   accent: 'var(--red)',          bg: 'var(--red-subtle)',     border: 'rgba(229,72,77,0.25)'        },
  hinglish:   { label: 'Hinglish',   accent: 'var(--yellow)',       bg: 'var(--yellow-subtle)',  border: 'rgba(245,166,35,0.25)'       },
}

const HOOK_TYPES = ['curiosity', 'story', 'hot-take', 'hinglish'] as UserHook['type'][]

function uid() { return Math.random().toString(36).slice(2, 10) }

export default function HooksPage() {
  const { scan, isScanning, isInitialLoad } = useScan()
  const router = useRouter()

  const [hooks, setHooks]             = useState<UserHook[]>([])
  const [showHidden, setShowHidden]   = useState(false)
  const [copied, setCopied]           = useState<string | null>(null)
  const [addingType, setAddingType]   = useState<UserHook['type']>('curiosity')
  const [addingText, setAddingText]   = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    // Shared with Content Library — seed from scan if ss:user-hooks is empty
    try {
      const stored = localStorage.getItem(LS_HOOKS)
      if (stored) {
        setHooks(JSON.parse(stored))
        return
      }
    } catch {}

    // First visit — seed from scan or fallback
    const source = scan?.hooks?.length
      ? scan.hooks.map((h, i) => ({
          id: `scan-${i}`,
          text: h.text,
          type: h.type,
          basedOn: h.basedOn,
          trendRelevant: h.trendRelevant,
        }))
      : FALLBACK_HOOKS.map((h, i) => ({ ...h, id: `fb-${i}` }))

    setHooks(source)
    try { localStorage.setItem(LS_HOOKS, JSON.stringify(source)) } catch {}
  }, [scan])

  if (isScanning || isInitialLoad) return <SkeletonGrid count={8} />

  function persist(updated: UserHook[]) {
    setHooks(updated)
    try { localStorage.setItem(LS_HOOKS, JSON.stringify(updated)) } catch {}
  }

  function dismiss(id: string)  { persist(hooks.map(h => h.id === id ? { ...h, hidden: true }  : h)) }
  function restore(id: string)  { persist(hooks.map(h => h.id === id ? { ...h, hidden: false } : h)) }
  function deleteHook(id: string) { persist(hooks.filter(h => h.id !== id)) }

  function addHook() {
    if (!addingText.trim()) return
    const hook: UserHook = {
      id: uid(), text: addingText.trim(), type: addingType,
      basedOn: 'Custom', trendRelevant: false, isCustom: true,
    }
    persist([hook, ...hooks])
    setAddingText('')
    setShowAddForm(false)
  }

  function copyHook(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1800)
  }

  const hiddenCount = hooks.filter(h => h.hidden).length

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <PageHeader
          label="Create"
          title="Hooks Library"
          subtitle={scan ? 'Generated from your account data' : 'Fallback hooks — run scan for personalised hooks'}
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginTop: 4 }}>
          {hiddenCount > 0 && (
            <button
              onClick={() => setShowHidden(v => !v)}
              className="btn-ghost"
              style={{ fontSize: 11, width: 'auto', padding: '4px 10px', color: 'var(--text-tertiary)' }}
            >
              {showHidden ? 'Hide dismissed' : `Show hidden (${hiddenCount})`}
            </button>
          )}
          <button
            onClick={() => setShowAddForm(v => !v)}
            className="btn-secondary"
            style={{ fontSize: 12, padding: '6px 14px' }}
          >
            + Add Hook
          </button>
        </div>
      </div>

      {/* Add hook form */}
      {showAddForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Add your own hook</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {HOOK_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setAddingType(t)}
                className={`pill-filter${addingType === t ? ' active' : ''}`}
                style={{ fontSize: 11 }}
              >
                {TYPE_CONFIG[t]?.label ?? t}
              </button>
            ))}
          </div>
          <textarea
            className="input"
            rows={2}
            value={addingText}
            onChange={e => setAddingText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) addHook() }}
            placeholder="Write your hook — specific, scroll-stopping, no greeting..."
            style={{ fontSize: 13, resize: 'vertical' }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addHook} disabled={!addingText.trim()} className="btn-primary" style={{ fontSize: 12, padding: '6px 16px' }}>
              Save Hook
            </button>
            <button onClick={() => { setShowAddForm(false); setAddingText('') }} className="btn-secondary" style={{ fontSize: 12 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hooks grouped by type */}
      {HOOK_TYPES.map(type => {
        const cfg           = TYPE_CONFIG[type]
        const typeHooks     = hooks.filter(h => h.type === type)
        const visible       = typeHooks.filter(h => !h.hidden)
        const hidden        = typeHooks.filter(h => h.hidden)
        const shown         = showHidden ? typeHooks : visible
        if (shown.length === 0) return null

        return (
          <section key={type}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <p className="section-label">{cfg.label}</p>
              <span className="badge" style={{ background: cfg.bg, color: cfg.accent, borderColor: cfg.border, fontSize: 10 }}>
                {visible.length}
              </span>
              {hidden.length > 0 && !showHidden && (
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{hidden.length} hidden</span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {shown.map((hook, i) => (
                <div
                  key={hook.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '12px 16px',
                    borderBottom: i < shown.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    background: hook.hidden ? 'var(--bg-subtle)' : 'transparent',
                    opacity: hook.hidden ? 0.55 : 1,
                    transition: 'background 100ms ease',
                  }}
                >
                  {/* Text + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: hook.hidden ? 'var(--text-tertiary)' : 'var(--text-primary)', lineHeight: 1.5 }}>
                      {hook.text}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{hook.basedOn}</p>
                      {hook.isCustom && (
                        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: cfg.accent, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 3, padding: '1px 5px' }}>Custom</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                    {hook.trendRelevant && !hook.hidden && (
                      <span className="badge badge-rising" style={{ fontSize: 10 }}>trending</span>
                    )}

                    {hook.hidden ? (
                      <button onClick={() => restore(hook.id)} className="btn-ghost" style={{ fontSize: 11, width: 'auto', padding: '3px 10px', color: 'var(--text-tertiary)' }}>
                        Restore
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => copyHook(hook.text)}
                          className="btn-ghost"
                          style={{ fontSize: 11, width: 'auto', padding: '3px 10px', color: copied === hook.text ? 'var(--green)' : 'var(--text-tertiary)' }}
                        >
                          {copied === hook.text ? '✓' : 'Copy'}
                        </button>
                        <button
                          onClick={() => router.push(`/studio?idea=${encodeURIComponent(hook.text)}`)}
                          className="btn-secondary"
                          style={{ fontSize: 11, padding: '4px 10px' }}
                        >
                          Use
                        </button>
                        {/* Custom hooks: permanent delete | Scan hooks: dismiss (hidden) */}
                        {hook.isCustom ? (
                          <button
                            onClick={() => deleteHook(hook.id)}
                            className="btn-ghost"
                            style={{ fontSize: 13, width: 28, color: 'var(--text-tertiary)' }}
                            title="Delete"
                          >×</button>
                        ) : (
                          <button
                            onClick={() => dismiss(hook.id)}
                            className="btn-ghost"
                            style={{ fontSize: 13, width: 28, color: 'var(--text-tertiary)' }}
                            title="Hide"
                          >×</button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}

              {visible.length === 0 && !showHidden && (
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    All {cfg.label} hooks hidden ·{' '}
                    <button onClick={() => setShowHidden(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
                      show them
                    </button>
                  </p>
                </div>
              )}
            </div>
          </section>
        )
      })}

      {hooks.filter(h => !h.hidden).length === 0 && (
        <div style={{ padding: '64px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>All hooks hidden</p>
          <button onClick={() => setShowHidden(true)} className="btn-secondary" style={{ fontSize: 13 }}>Show all</button>
        </div>
      )}
    </div>
  )
}
