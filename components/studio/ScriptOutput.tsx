'use client'
import { useState } from 'react'

interface Props {
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
  }
}

export function ScriptOutput({ output, onSave, isSaving, saved }: Props) {
  const [copied, setCopied] = useState(false)
  const parts = parseScript(output)
  const hasStructure = parts.hook || parts.body || parts.cta

  async function handleCopy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      {hasStructure ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
          {parts.hook && <ScriptSection label="HOOK" accent="var(--accent)" bg="var(--accent-subtle)" border="var(--accent-border)" text={parts.hook} />}
          {parts.body && <ScriptSection label="BODY" accent="var(--text-secondary)" bg="var(--bg-elevated)" border="var(--border)" text={parts.body} />}
          {parts.cta  && <ScriptSection label="CTA" accent="var(--green)" bg="var(--green-subtle)" border="rgba(48,164,108,0.25)" text={parts.cta} />}
        </div>
      ) : (
        <pre style={{ flex: 1, fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
          {output}
        </pre>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button onClick={handleCopy} className="btn-secondary" style={{ flex: 1, color: copied ? 'var(--green)' : undefined }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <button onClick={onSave} disabled={isSaving || saved} className={saved ? 'btn-secondary' : 'btn-primary'} style={{ flex: 1, color: saved ? 'var(--green)' : undefined }}>
          {isSaving ? 'Saving...' : saved ? '✓ Saved' : 'Save to Board'}
        </button>
      </div>
    </div>
  )
}

function ScriptSection({ label, accent, bg, border, text }: { label: string; accent: string; bg: string; border: string; text: string }) {
  return (
    <div style={{ padding: '12px 14px', borderRadius: 8, background: bg, border: `1px solid ${border}` }}>
      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: accent, marginBottom: 8, textTransform: 'uppercase' as const }}>
        {label}
      </p>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
        {text}
      </p>
    </div>
  )
}
