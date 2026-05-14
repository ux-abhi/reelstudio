'use client'

const FORMATS = [
  'Reel 30–45s',
  'Reel 60–75s',
  'Carousel Caption',
  'Talking Head',
  'Screen Rec VO',
  'Hinglish Rant',
]

export function FormatChips({ selected, onChange }: { selected: string; onChange: (f: string) => void }) {
  return (
    <div className="segmented" style={{ flexWrap: 'wrap', height: 'auto' }}>
      {FORMATS.map(f => (
        <button key={f} onClick={() => onChange(f)} className={`segment${selected === f ? ' active' : ''}`}>
          {f}
        </button>
      ))}
    </div>
  )
}
