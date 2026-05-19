'use client'
import { FORMAT_WORDS } from '@/lib/scriptUtils'

const FORMATS = [
  'Reel 30–45s',
  'Reel 60–75s',
  'Carousel Caption',
  'Talking Head',
  'Screen Rec VO',
  'POV Rant',
]

export function FormatChips({ selected, onChange }: { selected: string; onChange: (f: string) => void }) {
  const range = FORMAT_WORDS[selected]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="segmented" style={{ flexWrap: 'wrap', height: 'auto' }}>
        {FORMATS.map(f => (
          <button key={f} onClick={() => onChange(f)} className={`segment${selected === f ? ' active' : ''}`}>
            {f}
          </button>
        ))}
      </div>
      {range && (
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          Target: {range.min}–{range.max} words for this format
        </p>
      )}
    </div>
  )
}
