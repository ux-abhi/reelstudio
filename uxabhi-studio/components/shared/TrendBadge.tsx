const DIRECTION_CONFIG = {
  rising:  { symbol: '↑', className: 'trend-rising' },
  falling: { symbol: '↓', className: 'trend-falling' },
  stable:  { symbol: '→', className: 'trend-stable' },
}

export function TrendBadge({
  score,
  direction,
  breakout,
}: {
  score: number
  direction: 'rising' | 'falling' | 'stable'
  breakout?: boolean
}) {
  const cfg = DIRECTION_CONFIG[direction]
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${cfg.className}`}
      style={{
        borderRadius: 980,
        padding: '2px 8px',
        border: '0.5px solid currentColor',
        opacity: 0.9,
      }}
    >
      {cfg.symbol} {score}
      {breakout && (
        <span title="Breakout trend" style={{ marginLeft: 2 }}>
          🔥
        </span>
      )}
    </span>
  )
}
