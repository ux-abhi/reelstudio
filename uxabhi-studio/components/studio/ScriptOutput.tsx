'use client'
import { useState } from 'react'

interface ScriptOutputProps {
  output: string
  onSave: () => void
  isSaving: boolean
  saved: boolean
}

function parseScript(text: string) {
  const hookMatch = text.match(/\[HOOK\]([\s\S]*?)(?=\[BODY\]|$)/)
  const bodyMatch = text.match(/\[BODY\]([\s\S]*?)(?=\[CTA\]|$)/)
  const ctaMatch  = text.match(/\[CTA\]([\s\S]*)$/)
  return {
    hook: hookMatch?.[1]?.trim() ?? '',
    body: bodyMatch?.[1]?.trim() ?? '',
    cta:  ctaMatch?.[1]?.trim() ?? '',
    raw:  text,
  }
}

export function ScriptOutput({ output, onSave, isSaving, saved }: ScriptOutputProps) {
  const [copied, setCopied] = useState(false)
  const parts = parseScript(output)
  const hasStructure = parts.hook || parts.body || parts.cta

  async function handleCopy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {hasStructure ? (
        <div className="flex flex-col gap-3 flex-1">
          {parts.hook && (
            <Section label="HOOK" color="#6e6aff" bg="rgba(110,106,255,0.08)">
              {parts.hook}
            </Section>
          )}
          {parts.body && (
            <Section label="BODY" color="rgba(255,255,255,0.70)" bg="rgba(255,255,255,0.04)">
              {parts.body}
            </Section>
          )}
          {parts.cta && (
            <Section label="CTA" color="#00e5b4" bg="rgba(0,229,180,0.08)">
              {parts.cta}
            </Section>
          )}
        </div>
      ) : (
        <pre
          className="flex-1 text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: 'rgba(255,255,255,0.80)', fontFamily: 'inherit' }}
        >
          {output}
        </pre>
      )}

      <div className="flex gap-2 mt-auto">
        <button
          onClick={handleCopy}
          className="flex-1 text-sm font-medium py-2 rounded-full transition-all"
          style={{
            background: 'rgba(255,255,255,0.07)',
            color: copied ? '#34C759' : 'rgba(255,255,255,0.80)',
            border: '0.5px solid rgba(255,255,255,0.12)',
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <button
          onClick={onSave}
          disabled={isSaving || saved}
          className="flex-1 text-sm font-medium py-2 rounded-full transition-all"
          style={{
            background: saved ? 'rgba(52,199,89,0.15)' : 'rgba(110,106,255,0.15)',
            color: saved ? '#34C759' : '#6e6aff',
            border: `0.5px solid ${saved ? 'rgba(52,199,89,0.30)' : 'rgba(110,106,255,0.30)'}`,
          }}
        >
          {isSaving ? 'Saving...' : saved ? '✓ Saved' : 'Save to Board'}
        </button>
      </div>
    </div>
  )
}

function Section({
  label,
  color,
  bg,
  children,
}: {
  label: string
  color: string
  bg: string
  children: string
}) {
  return (
    <div className="rounded-xl p-4" style={{ background: bg, border: `0.5px solid ${color}22` }}>
      <p className="text-xs font-semibold mb-2" style={{ color, letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-wrap' }}>
        {children}
      </p>
    </div>
  )
}
