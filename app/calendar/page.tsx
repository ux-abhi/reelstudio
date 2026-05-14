'use client'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonGrid } from '@/components/shared/SkeletonCard'
import { PillarTag } from '@/components/shared/PillarTag'
import { PageHeader } from '@/components/shared/PageHeader'
import { CalendarDay } from '@/types/scan'

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

export default function CalendarPage() {
  const { scan, isScanning } = useScan()
  const router = useRouter()

  if (isScanning) return <SkeletonGrid count={8} />
  if (!scan?.calendar?.length) return <EmptyState title="No calendar yet" description="Run your scan to generate a 30-day content calendar with real dates, post types, and hooks." />

  const weeks: CalendarDay[][] = [[], [], [], []]
  scan.calendar.forEach((day: CalendarDay) => {
    const w = Math.min(Math.floor((day.dayNumber - 1) / 7), 3)
    weeks[w].push(day)
  })

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <PageHeader title="30-Day Calendar" subtitle="Real dates. AI-generated hooks. Trend-aware." />

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
              {week.map((day: CalendarDay, di) => (
                <div
                  key={day.dayNumber}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: '12px 16px',
                    borderBottom: di < week.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    transition: 'background 100ms ease',
                  }}
                >
                  {/* Date column */}
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
                  </div>

                  <button
                    onClick={() => router.push(`/studio?idea=${encodeURIComponent(day.title)}`)}
                    className="btn-secondary"
                    style={{ fontSize: 11, padding: '4px 10px', flexShrink: 0, alignSelf: 'flex-start' }}
                  >
                    Write
                  </button>
                </div>
              ))}
            </div>
          </section>
        )
      )}
    </div>
  )
}
