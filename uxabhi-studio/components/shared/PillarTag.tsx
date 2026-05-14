const PILLAR_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  "Designer's Toolbox": {
    bg: 'rgba(110,106,255,0.12)',
    color: '#8480ff',
    border: 'rgba(110,106,255,0.25)',
  },
  'Design Decoded': {
    bg: 'rgba(52,199,89,0.12)',
    color: '#34C759',
    border: 'rgba(52,199,89,0.25)',
  },
  "Builder's Log": {
    bg: 'rgba(255,214,10,0.12)',
    color: '#FFD60A',
    border: 'rgba(255,214,10,0.25)',
  },
  'The Honest Take': {
    bg: 'rgba(255,69,58,0.12)',
    color: '#FF453A',
    border: 'rgba(255,69,58,0.25)',
  },
  'From India to Germany': {
    bg: 'rgba(0,229,180,0.12)',
    color: '#00e5b4',
    border: 'rgba(0,229,180,0.25)',
  },
}

function getPillarColor(pillar: string) {
  if (PILLAR_COLORS[pillar]) return PILLAR_COLORS[pillar]
  // fallback for dynamic pillar names
  return {
    bg: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.55)',
    border: 'rgba(255,255,255,0.12)',
  }
}

export function PillarTag({ pillar }: { pillar: string }) {
  const c = getPillarColor(pillar)
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium"
      style={{
        background: c.bg,
        color: c.color,
        border: `0.5px solid ${c.border}`,
        borderRadius: 980,
        padding: '3px 8px',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      {pillar}
    </span>
  )
}
