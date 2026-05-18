'use client'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { SkeletonGrid } from '@/components/shared/SkeletonCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Hook } from '@/types/scan'

const FALLBACK_HOOKS: Hook[] = [
  { text: "I don't know how this tool is still free", type: 'curiosity', basedOn: 'Tool reveal format — high engagement in creator niches', trendRelevant: true },
  { text: "Everyone talking about [trend] is missing the most important part", type: 'hot-take', basedOn: 'Contrarian take format — drives comments', trendRelevant: true },
  { text: "This is what I wish someone told me when I started", type: 'story', basedOn: 'Hindsight advice format — high save rate', trendRelevant: false },
  { text: "I built this at 2am and it saved me 4 hours the next morning", type: 'story', basedOn: 'Late-night build story — relatable to creators', trendRelevant: false },
  { text: "Stop doing this — it's the reason your content isn't growing", type: 'hot-take', basedOn: 'Mistake callout format — high share rate', trendRelevant: false },
  { text: "The tool I use that nobody in my niche is talking about", type: 'curiosity', basedOn: 'Hidden gem format — saves + DMs', trendRelevant: true },
  { text: "I tested 5 different approaches so you don't have to", type: 'curiosity', basedOn: 'Comparison/test format — drives saves', trendRelevant: false },
  { text: "Honest take: most advice about [topic] is wrong", type: 'hot-take', basedOn: 'Myth-busting format — strong comment driver', trendRelevant: true },
  { text: "I spent 3 months figuring this out — here's the shortcut", type: 'story', basedOn: 'Hard-won insight format — high engagement', trendRelevant: false },
  { text: "POV: You're trying to fix a problem at 11pm with a deadline at 9am", type: 'story', basedOn: 'POV relatable story — saves + shares', trendRelevant: false },
  { text: "Comment 'TOOLS' and I'll DM you everything I actually use", type: 'curiosity', basedOn: 'Comment trigger format — proven DM driver', trendRelevant: false },
  { text: "The thing nobody tells you about growing in this niche", type: 'curiosity', basedOn: 'Insider knowledge format — saves heavily', trendRelevant: false },
]

const TYPE_CONFIG: Record<string, { label: string; accent: string; bg: string }> = {
  curiosity: { label: 'Curiosity', accent: 'var(--accent-hover)', bg: 'var(--accent-subtle)' },
  story:     { label: 'Story',     accent: 'var(--green)',       bg: 'var(--green-subtle)'   },
  'hot-take':{ label: 'Hot Take',  accent: 'var(--red)',         bg: 'var(--red-subtle)'     },
  hinglish:  { label: 'Hinglish',  accent: 'var(--yellow)',      bg: 'var(--yellow-subtle)'  },
}

export default function HooksPage() {
  const { scan, isScanning, isInitialLoad } = useScan()
  const router = useRouter()

  if (isScanning || isInitialLoad) return <SkeletonGrid count={8} />

  const hooks: Hook[] = scan?.hooks?.length ? scan.hooks : FALLBACK_HOOKS
  const byType = (type: Hook['type']) => hooks.filter(h => h.type === type)

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageHeader
        title="Hooks Library"
        subtitle={scan ? 'Generated from your account data' : 'Fallback hooks — run scan for personalised hooks'}
      />

      {(['curiosity', 'story', 'hot-take', 'hinglish'] as Hook['type'][]).map(type => {
        const typeHooks = byType(type)
        if (!typeHooks.length) return null
        const cfg = TYPE_CONFIG[type]
        return (
          <section key={type}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <p className="section-label">{cfg.label}</p>
              <span className="badge" style={{ background: cfg.bg, color: cfg.accent, borderColor: 'transparent', fontSize: 10 }}>
                {typeHooks.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {typeHooks.map((hook, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '12px 16px',
                    borderBottom: i < typeHooks.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    transition: 'background 100ms ease',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{hook.text}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>{hook.basedOn}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {hook.trendRelevant && (
                      <span className="badge badge-rising" style={{ fontSize: 10 }}>trending</span>
                    )}
                    <button
                      onClick={() => router.push(`/studio?idea=${encodeURIComponent(hook.text)}`)}
                      className="btn-secondary"
                      style={{ fontSize: 11, padding: '4px 10px' }}
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
