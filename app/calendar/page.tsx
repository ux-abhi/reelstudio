'use client'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonGrid } from '@/components/shared/SkeletonCard'
import { PillarTag } from '@/components/shared/PillarTag'
import { CalendarDay } from '@/types/scan'

const WEEK_THEMES = ['Foundation — algorithm reset, reach spike', 'Momentum — collab + double down on winners', 'Authority — expertise, startup audience', 'Virality — max shareables, comment triggers']

const POST_TYPE_COLORS: Record<string, string> = {
  Reel:          '#6e6aff',
  Carousel:      '#34C759',
  Stories:       '#FFD60A',
  'Talking Head': '#FF453A',
}

const OPT_COLORS: Record<string, string> = {
  Reach:    '#6e6aff',
  Saves:    '#34C759',
  Comments: '#FFD60A',
  DMs:      '#00e5b4',
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
    <div className="page-enter flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.92)' }}>30-Day Calendar</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>Real dates. AI-generated hooks. Trend-aware.</p>
        <hr className="divider mt-4" />
      </div>

      {weeks.map((week, wi) => (
        week.length === 0 ? null : (
          <section key={wi}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(110,106,255,0.12)', color: '#8480ff', border: '0.5px solid rgba(110,106,255,0.20)' }}>
                Week {wi + 1}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>{WEEK_THEMES[wi]}</span>
            </div>
            <div className="flex flex-col gap-3">
              {week.map((day: CalendarDay) => (
                <div
                  key={day.dayNumber}
                  className="rounded-2xl p-4 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-start gap-4">
                    {/* Day number */}
                    <div className="flex-shrink-0 w-12 text-center">
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>{day.dayName}</p>
                      <p className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.70)', lineHeight: 1.2 }}>
                        {day.date?.split('-')[2] ?? day.dayNumber}
                      </p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{day.postingTime}</p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${POST_TYPE_COLORS[day.postType] ?? '#6e6aff'}18`, color: POST_TYPE_COLORS[day.postType] ?? '#6e6aff', border: `0.5px solid ${POST_TYPE_COLORS[day.postType] ?? '#6e6aff'}33` }}>
                          {day.postType}
                        </span>
                        <PillarTag pillar={day.pillar} />
                        {day.optimisedFor && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${OPT_COLORS[day.optimisedFor] ?? '#6e6aff'}10`, color: OPT_COLORS[day.optimisedFor] ?? '#6e6aff' }}>
                            {day.optimisedFor}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.4 }}>{day.title}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{day.hook}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {day.triggerWord && (
                          <span className="text-xs font-semibold" style={{ color: '#FFD60A' }}>"{day.triggerWord}"</span>
                        )}
                        {day.trendSignal && (
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>🔥 {day.trendSignal}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/studio?idea=${encodeURIComponent(day.title)}`)}
                      className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full self-start transition-all"
                      style={{ background: 'rgba(110,106,255,0.12)', color: '#8480ff', border: '0.5px solid rgba(110,106,255,0.20)' }}
                    >
                      Write
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      ))}

      {/* Stories cadence */}
      <section>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)', marginBottom: 12 }}>
          Daily Stories Cadence
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { time: '9:00 AM', type: 'Poll or question sticker', desc: 'Related to today\'s reel topic. Warm up the audience before posting.' },
            { time: '1:00 PM', type: 'Behind the scenes', desc: 'Figma screenshot, desk setup, thesis note, or current project.' },
            { time: '7:00 PM', type: 'Amplify today\'s post', desc: 'Re-share a comment or DM reaction + follow CTA.' },
          ].map(slot => (
            <div key={slot.time} className="card">
              <p className="text-sm font-bold mb-1" style={{ color: '#6e6aff' }}>{slot.time}</p>
              <p className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.80)' }}>{slot.type}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)', lineHeight: 1.5 }}>{slot.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
