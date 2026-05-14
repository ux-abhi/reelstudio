'use client'
import { useState, useEffect } from 'react'
import { useScan } from '@/components/scan/ScanContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { PriorityAction } from '@/types/scan'

const COLLAB_TARGETS = [
  { handle: '@jitu.ux',      followers: '80K+', pitch: '"We both review the same portfolio — who gives better feedback?" collab reel',       threat: 'medium' },
  { handle: '@ux.wheee',     followers: '25K+', pitch: '"Two Indian designers, two countries — our honest job hunt experience"',             threat: 'low'    },
  { handle: '@designbyjav',  followers: '20K+', pitch: '"I design it, you build it in Framer — 60-minute challenge"',                        threat: 'low'    },
  { handle: '@thedesignely', followers: '35K+', pitch: 'Design engineering explainer, co-hosted reel',                                       threat: 'medium' },
  { handle: '@uthinhpham',   followers: '73K+', pitch: '"Framer + Claude workflow — I design the system, you build the components"',          threat: 'medium' },
]

const MONTHLY_NON_NEG = [
  'Post 5–6× per week minimum. Cadence is the #1 growth blocker — 2.6 posts/month cannot reach 10K.',
  'Every post needs a comment trigger OR a save CTA. No exceptions.',
  'Reply to every comment within 60 minutes of posting. The algorithm window closes after 3 hours.',
  'Launch "FREE TOOL TUESDAY" as a weekly recurring series — trains audience to come back weekly.',
  'One collab reel per week from Week 2 onwards. Offer to do all editing to reduce friction.',
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
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1,2,3].map(i => <SkeletonCard key={i} lines={3} />)}
    </div>
  )
  if (!scan) return <EmptyState title="No actions yet" description="Run your scan to get AI-generated priority actions based on your real account state." />

  const sorted = [...(scan.priorityActions ?? [])].sort((a, b) => {
    const order: Record<string, number> = { 'do first': 0, 'this week': 1, 'this month': 2 }
    return (order[a.urgency] ?? 2) - (order[b.urgency] ?? 2)
  })

  const doneCount = sorted.filter(a => checked[a.day]).length

  function urgencyClass(u: string) {
    return u === 'do first' ? 'badge-urgent' : u === 'this week' ? 'badge-soon' : 'badge-later'
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <PageHeader
        title="Priority Actions"
        subtitle={`${doneCount}/${sorted.length} completed`}
      />

      {/* AI-generated actions */}
      <section>
        <p className="section-label" style={{ marginBottom: 12 }}>AI-Generated Actions</p>
        <div style={{ background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
          {sorted.map((action: PriorityAction, i) => (
            <div
              key={action.day}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 16px',
                borderBottom: i < sorted.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <button
                onClick={() => toggle(action.day)}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  flexShrink: 0,
                  marginTop: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: checked[action.day] ? 'var(--green-subtle)' : 'transparent',
                  border: `1px solid ${checked[action.day] ? 'var(--green)' : 'var(--border-strong)'}`,
                  cursor: 'pointer',
                  fontSize: 10,
                  color: 'var(--green)',
                  transition: 'all 140ms ease',
                }}
              >
                {checked[action.day] ? '✓' : ''}
              </button>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: checked[action.day] ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: checked[action.day] ? 'line-through' : 'none', lineHeight: 1.4 }}>
                  {action.action}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>{action.impact}</p>
              </div>
              <span className={`badge ${urgencyClass(action.urgency)}`} style={{ flexShrink: 0 }}>{action.urgency}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Monthly non-negotiables */}
      <section>
        <p className="section-label" style={{ marginBottom: 12 }}>Monthly Non-Negotiables</p>
        <div style={{ background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
          {MONTHLY_NON_NEG.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 12,
                padding: '12px 16px',
                borderBottom: i < MONTHLY_NON_NEG.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, flexShrink: 0, lineHeight: 1.5 }}>{i + 1}</span>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Collab targets */}
      <section>
        <p className="section-label" style={{ marginBottom: 12 }}>Collab Targets</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {COLLAB_TARGETS.map((target, i) => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{target.handle}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{target.followers}</span>
                  <span className={`badge ${target.threat === 'high' ? 'badge-urgent' : target.threat === 'medium' ? 'badge-soon' : 'badge-later'}`} style={{ fontSize: 10 }}>
                    {target.threat} threat
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{target.pitch}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
