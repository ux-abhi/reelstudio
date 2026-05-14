'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonGrid } from '@/components/shared/SkeletonCard'
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
  { text: "Most designers finish their portfolio, post it on LinkedIn, get zero callbacks — here's why", type: 'curiosity', basedOn: 'Portfolio anxiety audience signal', trendRelevant: false },
  { text: "My HCI thesis studies something that changes how every product should be designed", type: 'curiosity', basedOn: 'HCI research whitespace', trendRelevant: false },
  { text: "I vibe-coded a landing page in 40 minutes that a client paid me for", type: 'story', basedOn: 'Vibe coding + Framer whitespace', trendRelevant: true },
  { text: "Framer + Claude + 4 hours = client-ready landing page — full workflow", type: 'curiosity', basedOn: 'Unfair advantage: Framer + Claude workflow', trendRelevant: true },
  { text: "Indian designer, German design market — the pay gap nobody talks about", type: 'hot-take', basedOn: 'Indian in Europe POV whitespace', trendRelevant: false },
  { text: "It's 11pm. I have a design problem and no existing tool solves it. So I'm building one.", type: 'story', basedOn: '"The Midnight Build" series concept', trendRelevant: false },
  { text: "Comment 'TOOLS' — I'll DM you everything that's open in my browser right now", type: 'hinglish', basedOn: 'Comment trigger formula — 1900 comments Jun 2024', trendRelevant: false },
  { text: "Honest review: Google AI Studio vs Claude for UX work — I used both for 3 months", type: 'hot-take', basedOn: 'AI tools comparison whitespace', trendRelevant: true },
]

const TYPE_CONFIG = {
  curiosity: { label: 'Curiosity', color: '#6e6aff', bg: 'rgba(110,106,255,0.10)' },
  story:     { label: 'Story', color: '#34C759', bg: 'rgba(52,199,89,0.10)' },
  'hot-take':{ label: 'Hot Take', color: '#FF453A', bg: 'rgba(255,69,58,0.10)' },
  hinglish:  { label: 'Hinglish', color: '#FFD60A', bg: 'rgba(255,214,10,0.10)' },
}

export default function HooksPage() {
  const { scan, isScanning } = useScan()
  const router = useRouter()
  const [regenerating, setRegenerating] = useState(false)

  if (isScanning) return <SkeletonGrid count={8} />

  const hooks: Hook[] = scan?.hooks?.length ? scan.hooks : FALLBACK_HOOKS

  const byType = (type: Hook['type']) => hooks.filter(h => h.type === type)

  async function handleRegenerate() {
    setRegenerating(true)
    try {
      const prompt = `Generate 20 Instagram hooks for @uxabhi_ (UX designer, HCI master's Germany, Indian designer in Europe).
5 per type: curiosity, story, hot-take, hinglish.
Based on top posts: ${scan?.posts?.slice(0,3).map(p => p.topic).join(', ') ?? 'Figma plugin, Chrome extension, Hindi rant'}
Return ONLY JSON array: [{ text, type, basedOn, trendRelevant }]`
      await fetch('/api/groq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, maxTokens: 2000 }) })
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="page-enter flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.92)' }}>Hooks Library</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>
            {scan ? 'Generated from your account data' : 'Fallback hooks from strategy doc — run scan for personalised hooks'}
          </p>
        </div>
        <button onClick={handleRegenerate} disabled={regenerating} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: '0.5px solid rgba(255,255,255,0.10)' }}>
          {regenerating ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>
      <hr className="divider" />

      {(['curiosity', 'story', 'hot-take', 'hinglish'] as Hook['type'][]).map(type => {
        const typeHooks = byType(type)
        if (!typeHooks.length) return null
        const cfg = TYPE_CONFIG[type]
        return (
          <section key={type}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.color}33` }}>
                {cfg.label}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{typeHooks.length} hooks</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {typeHooks.map((hook, i) => (
                <button
                  key={i}
                  onClick={() => router.push(`/studio?idea=${encodeURIComponent(hook.text)}`)}
                  className="card text-left flex flex-col gap-2 transition-all"
                  style={{ cursor: 'pointer' }}
                >
                  <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.5 }}>
                    {hook.text}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>Based on: {hook.basedOn}</p>
                    {hook.trendRelevant && <span className="text-xs" style={{ color: '#FFD60A' }}>🔥 trending</span>}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
