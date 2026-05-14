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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 7,
        background: 'var(--yellow-subtle)',
        border: '1px solid rgba(245,166,35,0.25)',
        fontSize: 12,
        color: 'var(--yellow)',
      }}
    >
      <span style={{ fontWeight: 600 }}>{match.keyword}</span>
      <span style={{ color: 'var(--text-secondary)' }}>
        is {match.breakout ? 'breaking out' : `trending ${match.direction}`} this week
        {match.interest > 0 && ` · ${match.interest}/100`}
      </span>
    </div>
  )
}
