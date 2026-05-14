'use client'

const FORMATS = [
  'Reel 30–45s',
  'Reel 60–75s',
  'Carousel Caption',
  'Talking Head',
  'Screen Rec VO',
  'Hinglish Rant',
]

export function FormatChips({
  selected,
  onChange,
}: {
  selected: string
  onChange: (f: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FORMATS.map(f => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
          style={{
            background: selected === f ? 'rgba(110,106,255,0.15)' : 'rgba(255,255,255,0.05)',
            color: selected === f ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.45)',
            border: `0.5px solid ${selected === f ? 'rgba(110,106,255,0.30)' : 'rgba(255,255,255,0.10)'}`,
          }}
        >
          {f}
        </button>
      ))}
    </div>
  )
}
