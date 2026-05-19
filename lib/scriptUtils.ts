export interface ParsedScript {
  hook: string
  body: string
  cta: string
}

export function parseScript(text: string): ParsedScript {
  const hookMatch = text.match(/\[HOOK\]([\s\S]*?)(?=\[BODY\]|$)/)
  const bodyMatch = text.match(/\[BODY\]([\s\S]*?)(?=\[CTA\]|$)/)
  const ctaMatch  = text.match(/\[CTA\]([\s\S]*)$/)
  return {
    hook: hookMatch?.[1]?.trim() ?? '',
    body: bodyMatch?.[1]?.trim() ?? '',
    cta:  ctaMatch?.[1]?.trim() ?? '',
  }
}

export const FORMAT_WORDS: Record<string, { min: number; max: number }> = {
  'Reel 30–45s':      { min: 75,  max: 115 },
  'Reel 60–75s':      { min: 150, max: 190 },
  'Carousel Caption': { min: 50,  max: 150 },
  'Talking Head':     { min: 100, max: 200 },
  'Screen Rec VO':    { min: 80,  max: 150 },
  'POV Rant':         { min: 100, max: 200 },
}

export function countWords(text: string): number {
  return text.replace(/\[HOOK\]|\[BODY\]|\[CTA\]/g, '').trim().split(/\s+/).filter(Boolean).length
}

export function wordCountColor(count: number, format: string): string {
  const range = FORMAT_WORDS[format]
  if (!range) return 'var(--text-tertiary)'
  if (count < range.min) return 'var(--yellow)'
  if (count > range.max) return 'var(--red)'
  return 'var(--green)'
}
