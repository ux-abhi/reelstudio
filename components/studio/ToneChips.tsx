'use client'

const TONES = ['Casual', 'Educational', 'Story', 'Hot Take', 'Voice Note']

export function ToneChips({ selected, onChange }: { selected: string; onChange: (t: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {TONES.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            padding: '5px 12px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: selected === t ? 500 : 400,
            color: selected === t ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: selected === t ? 'var(--accent-subtle)' : 'transparent',
            border: `1px solid ${selected === t ? 'var(--accent-border)' : 'var(--border)'}`,
            cursor: 'pointer',
            transition: 'all 120ms ease',
            fontFamily: 'inherit',
          }}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
