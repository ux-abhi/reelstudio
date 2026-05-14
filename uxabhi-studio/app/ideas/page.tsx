'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonGrid } from '@/components/shared/SkeletonCard'
import { TrendBadge } from '@/components/shared/TrendBadge'
import { PillarTag } from '@/components/shared/PillarTag'
import { Idea } from '@/types/scan'

type SortKey = 'trendScore' | 'urgency' | 'pillar'
const URGENCY_ORDER: Record<string, number> = { 'post this week': 0, 'post this month': 1, evergreen: 2 }

export default function IdeasPage() {
  const { scan, isScanning } = useScan()
  const router = useRouter()
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState<SortKey>('trendScore')
  const [regenerating, setRegenerating] = useState(false)
  const [regenError, setRegenError] = useState<string | null>(null)

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
    setRegenerating(true); setRegenError(null)
    try {
      const prompt = `Generate 20 Instagram content ideas for @uxabhi_ (UX designer, HCI master's Germany, Indian designer in Europe).
Recent posts: ${scan!.posts?.slice(0,5).map(p => p.topic).join(', ')}
Trends: ${JSON.stringify(scan!.trendPulse?.slice(0,6))}
Return ONLY a JSON array. Each item: { title, pillar, trendScore (0-100), trendDirection, hookSuggestion, triggerWord, urgency, whyNow }`
      const res = await fetch('/api/groq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, maxTokens: 3000 }) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
    } catch (e: unknown) {
      setRegenError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="page-enter flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.92)' }}>Ideas Bank</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>{scan.ideas?.length ?? 0} ideas ranked by trend score</p>
        <hr className="divider mt-4" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 flex-wrap flex-1">
          {filterOptions.map(f => (
            <button key={f} onClick={() => setFilter(f)} className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
              style={{ background: filter === f ? 'rgba(110,106,255,0.15)' : 'rgba(255,255,255,0.05)', color: filter === f ? '#8480ff' : 'rgba(255,255,255,0.45)', border: `0.5px solid ${filter === f ? 'rgba(110,106,255,0.25)' : 'rgba(255,255,255,0.09)'}` }}>
              {f}
            </button>
          ))}
        </div>
        <select className="input text-xs py-1.5" style={{ width: 'auto', minWidth: 140 }} value={sort} onChange={e => setSort(e.target.value as SortKey)}>
          <option value="trendScore">Sort: Trend Score</option>
          <option value="urgency">Sort: Urgency</option>
          <option value="pillar">Sort: Pillar</option>
        </select>
        <button onClick={handleRegenerate} disabled={regenerating} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: '0.5px solid rgba(255,255,255,0.10)' }}>
          {regenerating ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>

      {regenError && <p className="text-sm" style={{ color: '#FF453A' }}>{regenError}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((idea: Idea, i: number) => (
          <div key={i} className="card flex flex-col gap-3" style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}>
            <div className="flex items-start justify-between gap-2">
              <PillarTag pillar={idea.pillar} />
              <TrendBadge score={idea.trendScore} direction={idea.trendDirection} />
            </div>
            {idea.urgency === 'post this week' && idea.trendDirection === 'rising' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full self-start" style={{ background: 'rgba(255,69,58,0.12)', color: '#FF453A', border: '0.5px solid rgba(255,69,58,0.20)' }}>
                Post This Week
              </span>
            )}
            <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.90)', lineHeight: 1.4 }}>{idea.title}</h3>
            <p className="text-xs flex-1" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{idea.whyNow}</p>
            {idea.triggerWord && <p className="text-xs" style={{ color: '#FFD60A' }}>Trigger: {idea.triggerWord}</p>}
            <button onClick={() => router.push(`/studio?idea=${encodeURIComponent(idea.title)}`)} className="text-xs font-medium py-1.5 rounded-full mt-auto transition-all" style={{ background: 'rgba(110,106,255,0.12)', color: '#8480ff', border: '0.5px solid rgba(110,106,255,0.20)' }}>
              Write this
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
