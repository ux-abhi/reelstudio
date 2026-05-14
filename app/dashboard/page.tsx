'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { TrendBadge } from '@/components/shared/TrendBadge'
import { PillarTag } from '@/components/shared/PillarTag'
import { PriorityAction, TrendKeyword } from '@/types/scan'

export default function DashboardPage() {
  const { scan, isScanning } = useScan()
  const router = useRouter()
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem('uxabhi:actions:checked')
      if (stored) setChecked(JSON.parse(stored))
    } catch {}
  }, [])

  function toggleAction(day: string) {
    const next = { ...checked, [day]: !checked[day] }
    setChecked(next)
    localStorage.setItem('uxabhi:actions:checked', JSON.stringify(next))
  }

  if (isScanning) {
    return (
      <div className="page-enter flex flex-col gap-6">
        <PageHeader />
        <SkeletonCard lines={2} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        description="Run your scan to see your personalised dashboard, trend pulse, and today's recommended post."
        actionLabel="Run scan"
        actionHref="/onboarding"
      />
    )
  }

  const today = scan.calendar?.[0]
  const top3Actions = scan.priorityActions?.slice(0, 3) ?? []
  const breakoutTrends = scan.trendPulse?.filter(t => t.breakout).slice(0, 3) ?? []
  const allTrends = scan.trendPulse ?? []

  return (
    <div className="page-enter flex flex-col gap-8">
      <PageHeader />

      {/* Trend Pulse strip */}
      {allTrends.length > 0 && (
        <section>
          <SectionLabel>Trend Pulse</SectionLabel>
          <div className="flex gap-2 overflow-x-auto pb-2 mt-3" style={{ scrollbarWidth: 'none' }}>
            {allTrends.map((t: TrendKeyword) => (
              <button
                key={t.keyword}
                onClick={() => router.push('/ideas')}
                className="flex items-center gap-2 px-3 py-2 rounded-full flex-shrink-0 transition-all"
                style={{
                  background: t.breakout ? 'rgba(110,106,255,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `0.5px solid ${t.breakout ? 'rgba(110,106,255,0.25)' : 'rgba(255,255,255,0.09)'}`,
                }}
              >
                <span className="text-xs font-medium" style={{ color: t.breakout ? '#8480ff' : 'rgba(255,255,255,0.70)' }}>
                  {t.keyword}
                </span>
                <TrendBadge score={t.interest} direction={t.direction} breakout={t.breakout} />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Today's recommended post */}
      {today && (
        <section>
          <SectionLabel>Post Today</SectionLabel>
          <div className="card-elevated mt-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(110,106,255,0.15)', color: '#8480ff' }}>
                    {today.postType}
                  </span>
                  <PillarTag pillar={today.pillar} />
                  {today.optimisedFor && (
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      optimised for {today.optimisedFor}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.01em' }}>
                  {today.title}
                </h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                  {today.hook}
                </p>
                {today.triggerWord && (
                  <p className="text-xs mt-2" style={{ color: '#FFD60A' }}>
                    Trigger: Comment &ldquo;{today.triggerWord}&rdquo;
                  </p>
                )}
                {today.trendSignal && (
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    🔥 {today.trendSignal}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{today.postingTime}</p>
                <button
                  onClick={() => router.push(`/studio?idea=${encodeURIComponent(today.title)}`)}
                  className="text-sm font-medium px-4 py-2 rounded-full transition-all"
                  style={{ background: '#6e6aff', color: '#fff' }}
                >
                  Write this now
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Account health snapshot */}
      {scan.accountHealth && (
        <section>
          <SectionLabel>Account Health</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <MetricCard label="Engagement Rate" value={scan.accountHealth.engagementRate} verdict={scan.accountHealth.engagementVerdict} />
            <MetricCard label="Posting Cadence" value={scan.accountHealth.postingCadence} verdict="Consistency is the #1 growth lever" />
            <MetricCard label="Top Format" value={scan.accountHealth.topPerformingFormat} verdict={`Weakest: ${scan.accountHealth.weakestFormat}`} />
          </div>
        </section>
      )}

      {/* This week's top 3 actions */}
      {top3Actions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>This Week&apos;s Actions</SectionLabel>
            <button onClick={() => router.push('/actions')} className="text-xs" style={{ color: 'rgba(110,106,255,0.80)' }}>
              See all →
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {top3Actions.map((action: PriorityAction) => (
              <div key={action.day} className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                <button
                  onClick={() => toggleAction(action.day)}
                  className="w-4 h-4 rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-all"
                  style={{
                    background: checked[action.day] ? 'rgba(52,199,89,0.20)' : 'rgba(255,255,255,0.08)',
                    border: `0.5px solid ${checked[action.day] ? 'rgba(52,199,89,0.40)' : 'rgba(255,255,255,0.15)'}`,
                    fontSize: 10, color: '#34C759',
                  }}
                >
                  {checked[action.day] ? '✓' : ''}
                </button>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: checked[action.day] ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.80)', textDecoration: checked[action.day] ? 'line-through' : 'none' }}>
                    {action.action}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.30)' }}>{action.impact}</p>
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
          <SectionLabel>Breakout This Week</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            {breakoutTrends.map((t: TrendKeyword) => (
              <div key={t.keyword} className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>{t.keyword}</span>
                  <TrendBadge score={t.interest} direction={t.direction} breakout={t.breakout} />
                </div>
                <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>{t.contentOpportunity}</p>
                <button
                  onClick={() => router.push(`/studio?idea=${encodeURIComponent(t.keyword)}`)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
                  style={{ background: 'rgba(110,106,255,0.12)', color: '#8480ff', border: '0.5px solid rgba(110,106,255,0.20)' }}
                >
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

function PageHeader() {
  return (
    <div>
      <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.92)' }}>Dashboard</h1>
      <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>Your AI-generated Instagram command centre</p>
      <hr className="divider mt-4" />
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)' }}>
      {children}
    </p>
  )
}

function MetricCard({ label, value, verdict }: { label: string; value: string; verdict: string }) {
  return (
    <div className="card">
      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
      <p className="text-lg font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.02em' }}>{value}</p>
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>{verdict}</p>
    </div>
  )
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    'do first':   { bg: 'rgba(255,69,58,0.12)',    color: '#FF453A' },
    'this week':  { bg: 'rgba(255,214,10,0.10)',   color: '#FFD60A' },
    'this month': { bg: 'rgba(255,255,255,0.06)',  color: 'rgba(255,255,255,0.40)' },
  }
  const s = styles[urgency] ?? styles['this month']
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: s.bg, color: s.color }}>
      {urgency}
    </span>
  )
}
