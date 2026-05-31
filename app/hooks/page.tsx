'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { SkeletonGrid } from '@/components/shared/SkeletonCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Hook } from '@/types/scan'

const FALLBACK_HOOKS: Hook[] = [
  { text: "I can't believe this is still free", type: 'curiosity', basedOn: 'Resource reveal — high engagement across niches', trendRelevant: true },
  { text: "Everyone talking about this is missing the most important part", type: 'hot-take', basedOn: 'Contrarian take — drives comments', trendRelevant: true },
  { text: "This is what I wish someone told me when I started", type: 'story', basedOn: 'Hindsight advice — high save rate', trendRelevant: false },
  { text: "I figured this out the hard way so you don't have to", type: 'story', basedOn: 'Hard-won insight — high engagement', trendRelevant: false },
  { text: "Stop doing this — it's the reason you're not growing", type: 'hot-take', basedOn: 'Mistake callout — high share rate', trendRelevant: false },
  { text: "The approach nobody in this space is talking about", type: 'curiosity', basedOn: 'Hidden gem — saves + DMs', trendRelevant: true },
  { text: "I tested 5 different methods so you don't have to", type: 'curiosity', basedOn: 'Comparison/test — drives saves', trendRelevant: false },
  { text: "Honest take: most advice about this is wrong", type: 'hot-take', basedOn: 'Myth-busting — strong comment driver', trendRelevant: true },
  { text: "I spent 3 months on this — here's the shortcut", type: 'story', basedOn: 'Hard-won shortcut — saves heavily', trendRelevant: false },
  { text: "POV: You're trying to fix a problem at 11pm with a deadline at 9am", type: 'story', basedOn: 'POV relatable story — saves + shares', trendRelevant: false },
  { text: "The thing nobody tells you when you're starting out", type: 'curiosity', basedOn: 'Insider knowledge — high save rate', trendRelevant: false },
  { text: "This one change made everything easier", type: 'curiosity', basedOn: 'Single insight reveal — strong scroll-stopper', trendRelevant: false },
]

const TYPE_CONFIG: Record<string, { label: string; accent: string; bg: string; border: string }> = {
  curiosity: { label: 'Curiosity',  accent: 'var(--accent-hover)', bg: 'var(--accent-subtle)',  border: 'var(--accent-border)' },
  story:     { label: 'Story',      accent: 'var(--green)',        bg: 'var(--green-subtle)',   border: 'rgba(48,164,108,0.25)' },
  'hot-take':{ label: 'Hot Take',   accent: 'var(--red)',          bg: 'var(--red-subtle)',     border: 'rgba(229,72,77,0.25)' },
  hinglish:  { label: 'Hinglish',   accent: 'var(--yellow)',       bg: 'var(--yellow-subtle)',  border: 'rgba(245,166,35,0.25)' },
}

const HOOK_TYPES = ['curiosity', 'story', 'hot-take', 'hinglish'] as Hook['type'][]
const LS_DISMISSED = 'ss:hooks:dismissed'
const LS_CUSTOM    = 'ss:hooks:custom'

interface CustomHook { text: string; type: Hook['type'] }

export default function HooksPage() {
  const { scan, isScanning, isInitialLoad } = useScan()
  const router = useRouter()

  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [customHooks, setCustomHooks] = useState<CustomHook[]>([])
  const [showDismissed, setShowDismissed] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  // Add hook form
  const [addingType, setAddingType] = useState<Hook['type']>('curiosity')
  const [addingText, setAddingText] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    try {
      const d = localStorage.getItem(LS_DISMISSED)
      if (d) setDismissed(new Set(JSON.parse(d)))
      const c = localStorage.getItem(LS_CUSTOM)
      if (c) setCustomHooks(JSON.parse(c))
    } catch {}
  }, [])

  if (isScanning || isInitialLoad) return <SkeletonGrid count={8} />

  const scanHooks: Hook[] = scan?.hooks?.length ? scan.hooks : FALLBACK_HOOKS

  function dismiss(text: string) {
    const next = new Set(dismissed)
    next.add(text)
    setDismissed(next)
    try { localStorage.setItem(LS_DISMISSED, JSON.stringify([...next])) } catch {}
  }

  function restore(text: string) {
    const next = new Set(dismissed)
    next.delete(text)
    setDismissed(next)
    try { localStorage.setItem(LS_DISMISSED, JSON.stringify([...next])) } catch {}
  }

  function copyHook(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1800)
  }

  function addCustomHook() {
    if (!addingText.trim()) return
    const hook: CustomHook = { text: addingText.trim(), type: addingType }
    const next = [...customHooks, hook]
    setCustomHooks(next)
    try { localStorage.setItem(LS_CUSTOM, JSON.stringify(next)) } catch {}
    setAddingText('')
    setShowAddForm(false)
  }

  function deleteCustomHook(text: string) {
    const next = customHooks.filter(h => h.text !== text)
    setCustomHooks(next)
    try { localStorage.setItem(LS_CUSTOM, JSON.stringify(next)) } catch {}
  }

  const dismissedCount = [...scanHooks].filter(h => dismissed.has(h.text)).length

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <PageHeader
          label="Create"
          title="Hooks Library"
          subtitle={scan ? 'Generated from your account data' : 'Fallback hooks — run scan for personalised hooks'}
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginTop: 4 }}>
          {dismissedCount > 0 && (
            <button
              onClick={() => setShowDismissed(v => !v)}
              className="btn-ghost"
              style={{ fontSize: 11, width: 'auto', padding: '4px 10px', color: 'var(--text-tertiary)' }}
            >
              {showDismissed ? 'Hide dismissed' : `Show hidden (${dismissedCount})`}
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
            placeholder="Write your hook here — make it specific and scroll-stopping..."
            style={{ fontSize: 13, resize: 'vertical' }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addCustomHook} disabled={!addingText.trim()} className="btn-primary" style={{ fontSize: 12, padding: '6px 16px' }}>
              Save Hook
            </button>
            <button onClick={() => { setShowAddForm(false); setAddingText('') }} className="btn-secondary" style={{ fontSize: 12 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hooks by type */}
      {HOOK_TYPES.map(type => {
        const cfg = TYPE_CONFIG[type]
        const scanTypeHooks = scanHooks.filter(h => h.type === type)
        const customTypeHooks = customHooks.filter(h => h.type === type)

        const visibleScan = scanTypeHooks.filter(h => showDismissed || !dismissed.has(h.text))
        const dismissedScan = scanTypeHooks.filter(h => dismissed.has(h.text))

        if (!visibleScan.length && !customTypeHooks.length && !dismissedScan.length) return null

        return (
          <section key={type}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <p className="section-label">{cfg.label}</p>
              <span className="badge" style={{ background: cfg.bg, color: cfg.accent, borderColor: cfg.border, fontSize: 10 }}>
                {visibleScan.length + customTypeHooks.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {/* Scan hooks */}
              {visibleScan.map((hook, i) => (
                <HookRow
                  key={`scan-${i}`}
                  hook={hook}
                  cfg={cfg}
                  isDismissed={false}
                  copied={copied}
                  isLast={i === visibleScan.length - 1 && customTypeHooks.length === 0}
                  onCopy={() => copyHook(hook.text)}
                  onUse={() => router.push(`/studio?idea=${encodeURIComponent(hook.text)}`)}
                  onDismiss={() => dismiss(hook.text)}
                />
              ))}

              {/* Dismissed scan hooks (when showDismissed) */}
              {showDismissed && dismissedScan.map((hook, i) => (
                <HookRow
                  key={`dismissed-${i}`}
                  hook={hook}
                  cfg={cfg}
                  isDismissed
                  copied={copied}
                  isLast={i === dismissedScan.length - 1 && customTypeHooks.length === 0}
                  onCopy={() => copyHook(hook.text)}
                  onUse={() => router.push(`/studio?idea=${encodeURIComponent(hook.text)}`)}
                  onRestore={() => restore(hook.text)}
                />
              ))}

              {/* Custom hooks */}
              {customTypeHooks.map((hook, i) => (
                <HookRow
                  key={`custom-${i}`}
                  hook={{ ...hook, basedOn: 'Your custom hook', trendRelevant: false }}
                  cfg={cfg}
                  isDismissed={false}
                  isCustom
                  copied={copied}
                  isLast={i === customTypeHooks.length - 1}
                  onCopy={() => copyHook(hook.text)}
                  onUse={() => router.push(`/studio?idea=${encodeURIComponent(hook.text)}`)}
                  onDelete={() => deleteCustomHook(hook.text)}
                />
              ))}

              {/* Empty state for this type */}
              {visibleScan.length === 0 && customTypeHooks.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>All {cfg.label} hooks hidden · <button onClick={() => setShowDismissed(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>show them</button></p>
                </div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function HookRow({
  hook, cfg, isDismissed, isCustom, copied, isLast,
  onCopy, onUse, onDismiss, onRestore, onDelete,
}: {
  hook: Hook
  cfg: { accent: string; bg: string; border: string }
  isDismissed?: boolean
  isCustom?: boolean
  copied: string | null
  isLast: boolean
  onCopy: () => void
  onUse: () => void
  onDismiss?: () => void
  onRestore?: () => void
  onDelete?: () => void
}) {
  const isCopied = copied === hook.text

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
        background: isDismissed ? 'var(--bg-subtle)' : 'transparent',
        opacity: isDismissed ? 0.55 : 1,
        transition: 'background 100ms ease',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, color: isDismissed ? 'var(--text-tertiary)' : 'var(--text-primary)', lineHeight: 1.5 }}>
          {hook.text}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{hook.basedOn}</p>
          {isCustom && (
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: cfg.accent, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 3, padding: '1px 5px' }}>Custom</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
        {hook.trendRelevant && !isDismissed && (
          <span className="badge badge-rising" style={{ fontSize: 10 }}>trending</span>
        )}

        {isDismissed ? (
          <button onClick={onRestore} className="btn-ghost" style={{ fontSize: 11, width: 'auto', padding: '3px 10px', color: 'var(--text-tertiary)' }}>
            Restore
          </button>
        ) : (
          <>
            <button
              onClick={onCopy}
              className="btn-ghost"
              style={{ fontSize: 11, width: 'auto', padding: '3px 10px', color: isCopied ? 'var(--green)' : 'var(--text-tertiary)' }}
            >
              {isCopied ? '✓' : 'Copy'}
            </button>
            <button
              onClick={onUse}
              className="btn-secondary"
              style={{ fontSize: 11, padding: '4px 10px' }}
            >
              Use
            </button>
            {isCustom ? (
              <button
                onClick={onDelete}
                className="btn-ghost"
                style={{ fontSize: 13, width: 28, color: 'var(--text-tertiary)' }}
                title="Delete"
              >
                ×
              </button>
            ) : (
              <button
                onClick={onDismiss}
                className="btn-ghost"
                style={{ fontSize: 13, width: 28, color: 'var(--text-tertiary)' }}
                title="Hide"
              >
                ×
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
