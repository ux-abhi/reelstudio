export function TrendBadge({
  score,
  direction,
  breakout,
}: {
  score: number
  direction: 'rising' | 'falling' | 'stable'
  breakout?: boolean
}) {
  const cfg = {
    rising:  { arrow: '↑', cls: 'badge-rising' },
    falling: { arrow: '↓', cls: 'badge-falling' },
    stable:  { arrow: '→', cls: 'badge-stable' },
  }[direction]

  return (
    <span className={`badge ${cfg.cls}`}>
      {cfg.arrow} {score}{breakout ? ' ·' : ''}
    </span>
  )
}
