'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { TrendBadge } from '@/components/shared/TrendBadge'
import { PillarTag } from '@/components/shared/PillarTag'
import { PageHeader } from '@/components/shared/PageHeader'
import { PriorityAction, TrendKeyword } from '@/types/scan'

export default function DashboardPage() {
  const { scan, isScanning } = useScan()
  const router = useRouter()
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ss:actions:checked')
      if (stored) setChecked(JSON.parse(stored))
    } catch {}
  }, [])

  function toggleAction(day: string) {
    const next = { ...checked, [day]: !checked[day] }
    setChecked(next)
    localStorage.setItem('ss:actions:checked', JSON.stringify(next))
  }

  if (isScanning) {
    return (
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <PageHeader title="Dashboard" subtitle="Your AI-generated Instagram command centre" />
        <SkeletonCard lines={2} />
        <div className="stats-row">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
        <SkeletonCard lines={4} />
      </div>
    )
  }

  if (!scan) {
    return (
      <EmptyState
        title="No scan data yet"
        description="Run your scan to see your dashboard, trend pulse, and today's recommended post."
        actionLabel="Run scan"
        actionHref="/onboarding"
      />
    )
  }

  const today = scan.calendar?.[0]
  const top3Actions = scan.priorityActions?.slice(0, 3) ?? []
  const allTrends = scan.trendPulse ?? []
  const breakoutTrends = allTrends.filter(t => t.breakout).slice(0, 3)

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageHeader title="Dashboard" subtitle="Your AI-generated Instagram command centre" />

      {/* Trend Pulse strip */}
      {allTrends.length > 0 && (
        <section>
          <p className="section-label" style={{ marginBottom: 12 }}>Trend Pulse</p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {allTrends.map((t: TrendKeyword) => (
              <button
                key={t.keyword}
                onClick={() => router.push('/ideas')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 999,
                  flexShrink: 0,
                  background: t.breakout ? 'var(--accent-subtle)' : 'var(--bg-card)',
                  border: `1px solid ${t.breakout ? 'var(--accent-border)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 140ms ease',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 500, color: t.breakout ? 'var(--accent-hover)' : 'var(--text-secondary)' }}>
                  {t.keyword}
                </span>
                <TrendBadge score={t.interest} direction={t.direction} breakout={t.breakout} />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Today's post */}
      {today && (
        <section>
          <p className="section-label" style={{ marginBottom: 12 }}>Post Today</p>
          <div className="card-elevated" style={{ paddingLeft: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-hover)', borderColor: 'var(--accent-border)', fontWeight: 600 }}>
                    {today.postType}
                  </span>
                  <PillarTag pillar={today.pillar} />
                  {today.optimisedFor && (
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      optimised for {today.optimisedFor}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 6 }}>
                  {today.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{today.hook}</p>
                {today.triggerWord && (
                  <p style={{ fontSize: 12, color: 'var(--yellow)', marginTop: 8, fontWeight: 500 }}>
                    Trigger: Comment &ldquo;{today.triggerWord}&rdquo;
                  </p>
                )}
                {today.trendSignal && (
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>↑ {today.trendSignal}</p>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{today.postingTime}</p>
                <button className="btn-primary" onClick={() => router.push(`/studio?idea=${encodeURIComponent(today.title)}`)}>
                  Write this now
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Account health */}
      {scan.accountHealth && (
        <section>
          <p className="section-label" style={{ marginBottom: 12 }}>Account Health</p>
          <div className="stats-row">
            <StatCard label="Engagement Rate" value={String(scan.accountHealth.engagementRate)} sub={scan.accountHealth.engagementVerdict} />
            <StatCard label="Posting Cadence" value={scan.accountHealth.postingCadence} sub="Consistency is the #1 growth lever" />
            <StatCard label="Top Format" value={scan.accountHealth.topPerformingFormat} sub={`Weakest: ${scan.accountHealth.weakestFormat}`} />
          </div>
        </section>
      )}

      {/* This week's actions */}
      {top3Actions.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p className="section-label">This Week&apos;s Actions</p>
            <button onClick={() => router.push('/actions')} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
              See all →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {top3Actions.map((action: PriorityAction, i) => (
              <div
                key={action.day}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: i < top3Actions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  transition: 'background 100ms ease',
                }}
              >
                <button
                  onClick={() => toggleAction(action.day)}
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
                  <p style={{ fontSize: 13, color: checked[action.day] ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: checked[action.day] ? 'line-through' : 'none' }}>
                    {action.action}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{action.impact}</p>
                </div>
                <UrgencyBadge urgency={action.urgency} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Breakout trends */}
      {breakoutTrends.length > 0 && (
        <section>
          <p className="section-label" style={{ marginBottom: 12 }}>Breakout This Week</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {breakoutTrends.map((t: TrendKeyword) => (
              <div key={t.keyword} className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{t.keyword}</span>
                  <TrendBadge score={t.interest} direction={t.direction} breakout={t.breakout} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>{t.contentOpportunity}</p>
                <button className="btn-secondary" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => router.push(`/studio?idea=${encodeURIComponent(t.keyword)}`)}>
                  Write about this
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card-stat">
      <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sub}</p>
    </div>
  )
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const cls = urgency === 'do first' ? 'badge-urgent' : urgency === 'this week' ? 'badge-soon' : 'badge-later'
  return <span className={`badge ${cls}`}>{urgency}</span>
}
