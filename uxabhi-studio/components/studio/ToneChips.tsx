'use client'

const TONES = ['Casual', 'Educational', 'Story', 'Hot Take', 'Hinglish']

export function ToneChips({
  selected,
  onChange,
}: {
  selected: string
  onChange: (t: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TONES.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
          style={{
            background: selected === t ? 'rgba(0,229,180,0.12)' : 'rgba(255,255,255,0.05)',
            color: selected === t ? '#00e5b4' : 'rgba(255,255,255,0.45)',
            border: `0.5px solid ${selected === t ? 'rgba(0,229,180,0.25)' : 'rgba(255,255,255,0.10)'}`,
          }}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
