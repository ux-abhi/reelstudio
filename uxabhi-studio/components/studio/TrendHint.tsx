'use client'
import { useScan } from '@/components/scan/ScanContext'

export function TrendHint({ idea }: { idea: string }) {
  const { scan } = useScan()
  if (!scan || !idea.trim()) return null

  const lower = idea.toLowerCase()
  const match = scan.trendPulse?.find(t =>
    lower.includes(t.keyword.toLowerCase()) && (t.direction === 'rising' || t.breakout)
  )

  if (!match) return null

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
      style={{
        background: 'rgba(255,214,10,0.08)',
        border: '0.5px solid rgba(255,214,10,0.20)',
        color: '#FFD60A',
      }}
    >
      🔥{' '}
      <span>
        <strong>{match.keyword}</strong> is{' '}
        {match.breakout ? 'breaking out' : `trending ${match.direction}`} this week
        {match.interest > 0 && ` (${match.interest}/100 interest)`} — good timing
      </span>
    </div>
  )
}
