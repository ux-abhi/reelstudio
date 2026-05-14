'use client'
import { useState, useEffect } from 'react'
import { useScan } from '@/components/scan/ScanContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { PriorityAction } from '@/types/scan'

const COLLAB_TARGETS = [
  { handle: '@jitu.ux', followers: '80K+', why: 'Largest Indian UX creator, overlapping audience', pitch: '"We both review the same portfolio — who gives better feedback?" collab reel', threat: 'medium' },
  { handle: '@ux.wheee', followers: '25K+', why: 'Indian designer diaspora, similar life stage', pitch: '"Two Indian designers, two countries — our honest job hunt experience"', threat: 'low' },
  { handle: '@designbyjav', followers: '20K+', why: 'Framer-focused, complementary niche', pitch: '"I design it, you build it in Framer — 60-minute challenge"', threat: 'low' },
  { handle: '@thedesignely', followers: '35K+', why: 'Design + code crossover, similar HCI interest', pitch: 'Design engineering explainer, co-hosted reel', threat: 'medium' },
  { handle: '@uthinhpham', followers: '73K+', why: 'Framer + comment-trigger master, complementary not competing', pitch: '"Framer + Claude workflow — I design the system, you build the components"', threat: 'medium' },
]

const MONTHLY_NONNEG = [
  'Post 5–6x per week minimum. Cadence is the #1 growth blocker — 2.6 posts/month cannot reach 10K.',
  'Every post needs a comment trigger OR a save CTA. No exceptions.',
  'Reply to every comment within 60 minutes of posting. The algorithm window closes after 3 hours.',
  'Launch "FREE TOOL TUESDAY" as a weekly recurring series — trains audience to come back weekly.',
  'One collab reel per week from Week 2 onwards. Reduce friction to zero — offer to do all editing.',
]

export default function ActionsPage() {
  const { scan, isScanning } = useScan()
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem('uxabhi:actions:checked')
      if (stored) setChecked(JSON.parse(stored))
    } catch {}
  }, [])

  function toggle(key: string) {
    const next = { ...checked, [key]: !checked[key] }
    setChecked(next)
    localStorage.setItem('uxabhi:actions:checked', JSON.stringify(next))
  }

  if (isScanning) return (
    <div className="page-enter flex flex-col gap-4">
      {[1,2,3].map(i => <SkeletonCard key={i} lines={3} />)}
    </div>
  )
  if (!scan) return <EmptyState title="No actions yet" description="Run your scan to get AI-generated priority actions based on your real account state." />

  const URGENCY_STYLES: Record<string, { bg: string; color: string }> = {
    'do first':   { bg: 'rgba(255,69,58,0.12)',   color: '#FF453A' },
    'this week':  { bg: 'rgba(255,214,10,0.10)',  color: '#FFD60A' },
    'this month': { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.40)' },
  }

  const sorted = [...(scan.priorityActions ?? [])].sort((a, b) => {
    const order = { 'do first': 0, 'this week': 1, 'this month': 2 }
    return (order[a.urgency] ?? 2) - (order[b.urgency] ?? 2)
  })

  const doneCount = sorted.filter(a => checked[a.day]).length

  return (
    <div className="page-enter flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.92)' }}>Priority Actions</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>
          Generated from your real account state · {doneCount}/{sorted.length} done
        </p>
        <hr className="divider mt-4" />
      </div>

      {/* Priority actions */}
      <section>
        <SectionLabel>This Week</SectionLabel>
        <div className="flex flex-col gap-3 mt-4">
          {sorted.map((action: PriorityAction) => {
            const s = URGENCY_STYLES[action.urgency] ?? URGENCY_STYLES['this month']
            const done = checked[action.day]
            return (
              <div
                key={action.day}
                className="flex items-start gap-4 px-4 py-4 rounded-2xl transition-all"
                style={{
                  background: done ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                  border: `0.5px solid ${done ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.09)'}`,
                  opacity: done ? 0.6 : 1,
                }}
              >
                <button
                  onClick={() => toggle(action.day)}
                  className="w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-all"
                  style={{
                    background: done ? 'rgba(52,199,89,0.20)' : 'rgba(255,255,255,0.08)',
                    border: `0.5px solid ${done ? 'rgba(52,199,89,0.40)' : 'rgba(255,255,255,0.15)'}`,
                    color: '#34C759', fontSize: 11,
                  }}
                >
                  {done ? '✓' : ''}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>{action.day}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                      {action.urgency}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: done ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)', textDecoration: done ? 'line-through' : 'none', lineHeight: 1.5 }}>
                    {action.action}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.30)' }}>{action.impact}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Monthly non-negotiables */}
      <section>
        <SectionLabel>Monthly Non-Negotiables</SectionLabel>
        <div className="flex flex-col gap-2 mt-4">
          {MONTHLY_NONNEG.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)' }}>
              <span className="text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: '#6e6aff' }}>{i + 1}.</span>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Collab targets */}
      <section>
        <SectionLabel>Collab Targets</SectionLabel>
        <p className="text-xs mt-1 mb-4" style={{ color: 'rgba(255,255,255,0.30)' }}>
          From strategy doc — ranked by potential reach and ease of pitch. Offer to do all editing. Reduce friction to zero.
        </p>
        <div className="flex flex-col gap-3">
          {COLLAB_TARGETS.map(target => (
            <div key={target.handle} className="card">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>{target.handle}</span>
                  <span className="text-xs ml-2" style={{ color: 'rgba(255,255,255,0.35)' }}>{target.followers}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(110,106,255,0.10)', color: '#8480ff' }}>collab</span>
              </div>
              <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.50)', lineHeight: 1.5 }}>{target.why}</p>
              <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(110,106,255,0.06)', border: '0.5px solid rgba(110,106,255,0.12)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(110,106,255,0.60)', letterSpacing: '0.04em' }}>PITCH</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.60)' }}>{target.pitch}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)' }}>{children}</p>
}
