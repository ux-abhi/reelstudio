'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonGrid } from '@/components/shared/SkeletonCard'
import { TrendBadge } from '@/components/shared/TrendBadge'
import { PillarTag } from '@/components/shared/PillarTag'
import { PageHeader } from '@/components/shared/PageHeader'
import { Idea } from '@/types/scan'

type SortKey = 'trendScore' | 'urgency' | 'pillar'
const URGENCY_ORDER: Record<string, number> = { 'post this week': 0, 'post this month': 1, evergreen: 2 }

export default function IdeasPage() {
  const { scan, isScanning } = useScan()
  const router = useRouter()
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState<SortKey>('trendScore')
  const [regenerating, setRegenerating] = useState(false)

  if (isScanning) return <SkeletonGrid count={6} />
  if (!scan) return <EmptyState title="No ideas yet" description="Run your scan to generate 20 AI-powered content ideas ranked by trend score." />

  const pillars = Array.from(new Set(scan.ideas?.map(i => i.pillar) ?? []))
  const filterOptions = ['All', 'Trending Now', 'This Week', ...pillars]

  const filtered = (scan.ideas ?? []).filter((idea: Idea) => {
    if (filter === 'All') return true
    if (filter === 'Trending Now') return idea.trendScore > 70
    if (filter === 'This Week') return idea.urgency === 'post this week'
    return idea.pillar === filter
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'trendScore') return b.trendScore - a.trendScore
    if (sort === 'urgency') return URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]
    return a.pillar.localeCompare(b.pillar)
  })

  async function handleRegenerate() {
    setRegenerating(true)
    try {
      const prompt = `Generate 20 Instagram content ideas for @uxabhi_.
Recent posts: ${scan!.posts?.slice(0,5).map(p => p.topic).join(', ')}
Trends: ${JSON.stringify(scan!.trendPulse?.slice(0,6))}
Return ONLY a JSON array: [{ title, pillar, trendScore, trendDirection, hookSuggestion, triggerWord, urgency, whyNow }]`
      await fetch('/api/groq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, maxTokens: 3000 }) })
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title="Ideas Bank" subtitle={`${scan.ideas?.length ?? 0} ideas ranked by trend score`} />

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {filterOptions.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`pill-filter${filter === f ? ' active' : ''}`}>{f}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="segmented">
            {(['trendScore', 'urgency', 'pillar'] as SortKey[]).map(s => (
              <button key={s} onClick={() => setSort(s)} className={`segment${sort === s ? ' active' : ''}`}>
                {s === 'trendScore' ? 'Trend' : s === 'urgency' ? 'Urgency' : 'Pillar'}
              </button>
            ))}
          </div>
          <button onClick={handleRegenerate} disabled={regenerating} className="btn-secondary" style={{ fontSize: 12, padding: '5px 12px' }}>
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((idea: Idea, i: number) => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <PillarTag pillar={idea.pillar} />
              <TrendBadge score={idea.trendScore} direction={idea.trendDirection} />
            </div>
            {idea.urgency === 'post this week' && (
              <span className="badge badge-urgent" style={{ alignSelf: 'flex-start', fontSize: 10 }}>Post This Week</span>
            )}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{idea.title}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>{idea.whyNow}</p>
            {idea.triggerWord && (
              <p style={{ fontSize: 11, color: 'var(--yellow)', fontWeight: 500 }}>Trigger: {idea.triggerWord}</p>
            )}
            <button onClick={() => router.push(`/studio?idea=${encodeURIComponent(idea.title)}`)} className="btn-secondary" style={{ fontSize: 12, marginTop: 4 }}>
              Write this
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
