'use client'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { SkeletonGrid } from '@/components/shared/SkeletonCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Hook } from '@/types/scan'

const FALLBACK_HOOKS: Hook[] = [
  { text: "I don't know how this Figma plugin is still free", type: 'curiosity', basedOn: 'Jun 2024 viral post formula', trendRelevant: true },
  { text: "Every Indian designer posting 'AI will replace you' — let's talk", type: 'hot-take', basedOn: 'Apr 2026 Hindi rant — 7.2% engagement', trendRelevant: true },
  { text: "Your portfolio isn't landing interviews and it's not because your work is bad", type: 'curiosity', basedOn: 'Audience pain: portfolio anxiety', trendRelevant: false },
  { text: "I built this at 2am and it saved me 4 hours the next morning", type: 'story', basedOn: 'Chrome extension reel — 34 comments', trendRelevant: false },
  { text: "Main ye soch raha tha ki ye kaise kaam karta hai — phir maine banaya", type: 'hinglish', basedOn: 'Hindi rant format — 7.2% engagement rate', trendRelevant: false },
  { text: "Stop putting Figma under Technical Skills in your portfolio", type: 'hot-take', basedOn: 'Audience signal from comments', trendRelevant: false },
  { text: "This Framer plugin copies any site's style in 30 seconds — watch", type: 'curiosity', basedOn: 'Framer plugin reel — 57 likes from 1242 followers', trendRelevant: true },
  { text: "European design agencies mein Indian designers ko kya problem aati hai", type: 'hinglish', basedOn: 'Whitespace: Indian in Europe POV', trendRelevant: false },
  { text: "I applied to 12 UX roles in Germany in 3 months — here's what happened", type: 'story', basedOn: 'From India to Germany pillar', trendRelevant: false },
  { text: "Every 'best AI tools for designers' post misses the ones I actually use", type: 'hot-take', basedOn: 'AI rant audience signal', trendRelevant: true },
  { text: "POV: You open Figma at 11pm with a client deadline at 9am", type: 'story', basedOn: "Builder's Log pillar", trendRelevant: false },
  { text: "Ye kya ho raha hai design industry mein — main samajh nahi pa raha", type: 'hinglish', basedOn: 'Hindi rant format — double niche engagement rate', trendRelevant: false },
  { text: "Most designers post their portfolio on LinkedIn, get zero callbacks — here's why", type: 'curiosity', basedOn: 'Portfolio anxiety audience signal', trendRelevant: false },
  { text: "My HCI thesis studies something that changes how every product should be designed", type: 'curiosity', basedOn: 'HCI research whitespace', trendRelevant: false },
  { text: "I vibe-coded a landing page in 40 minutes that a client paid me for", type: 'story', basedOn: 'Vibe coding + Framer whitespace', trendRelevant: true },
  { text: "Framer + Claude + 4 hours = client-ready landing page — full workflow", type: 'curiosity', basedOn: 'Unfair advantage: Framer + Claude workflow', trendRelevant: true },
  { text: "Indian designer, German design market — the pay gap nobody talks about", type: 'hot-take', basedOn: 'Indian in Europe POV whitespace', trendRelevant: false },
  { text: "It's 11pm. I have a design problem and no existing tool solves it. So I'm building one.", type: 'story', basedOn: 'The Midnight Build series concept', trendRelevant: false },
  { text: "Comment 'TOOLS' — I'll DM you everything that's open in my browser right now", type: 'hinglish', basedOn: 'Comment trigger formula — 1900 comments Jun 2024', trendRelevant: false },
  { text: "Honest review: Google AI Studio vs Claude for UX work — I used both for 3 months", type: 'hot-take', basedOn: 'AI tools comparison whitespace', trendRelevant: true },
]

const TYPE_CONFIG: Record<string, { label: string; accent: string; bg: string }> = {
  curiosity: { label: 'Curiosity', accent: 'var(--accent-hover)', bg: 'var(--accent-subtle)' },
  story:     { label: 'Story',     accent: 'var(--green)',       bg: 'var(--green-subtle)'   },
  'hot-take':{ label: 'Hot Take',  accent: 'var(--red)',         bg: 'var(--red-subtle)'     },
  hinglish:  { label: 'Hinglish',  accent: 'var(--yellow)',      bg: 'var(--yellow-subtle)'  },
}

export default function HooksPage() {
  const { scan, isScanning } = useScan()
  const router = useRouter()

  if (isScanning) return <SkeletonGrid count={8} />

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
