'use client'
import { useState, useEffect } from 'react'

interface Props {
  output: string
  onSave: () => void
  onOutputChange: (text: string) => void
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

export function ScriptOutput({ output, onSave, onOutputChange, isSaving, saved }: Props) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(output)

  // Sync editText when a new output arrives from Groq
  useEffect(() => {
    setEditText(output)
    setIsEditing(false)
  }, [output])

  const parts = parseScript(editText)
  const hasStructure = parts.hook || parts.body || parts.cta

  async function handleCopy() {
    await navigator.clipboard.writeText(editText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleEditChange(value: string) {
    setEditText(value)
    onOutputChange(value)
  }

  function handleDoneEditing() {
    onOutputChange(editText)
    setIsEditing(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
          Output
        </p>
        <button
          onClick={() => isEditing ? handleDoneEditing() : setIsEditing(true)}
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: isEditing ? 'var(--accent)' : 'var(--text-tertiary)',
            background: isEditing ? 'var(--accent-subtle)' : 'transparent',
            border: `1px solid ${isEditing ? 'var(--accent-border)' : 'transparent'}`,
            borderRadius: 5,
            padding: '3px 8px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 120ms ease',
          }}
        >
          {isEditing ? '✓ Done' : 'Edit'}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {isEditing ? (
          <textarea
            value={editText}
            onChange={e => handleEditChange(e.target.value)}
            className="input"
            style={{
              width: '100%',
              height: '100%',
              minHeight: 300,
              resize: 'none',
              fontFamily: 'inherit',
              fontSize: 13,
              lineHeight: 1.7,
            }}
            autoFocus
          />
        ) : hasStructure ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {parts.hook && (
              <ScriptSection
                label="HOOK"
                accent="var(--accent)"
                bg="var(--accent-subtle)"
                border="var(--accent-border)"
                text={parts.hook}
              />
            )}
            {parts.body && (
              <ScriptSection
                label="BODY"
                accent="var(--text-secondary)"
                bg="var(--bg-elevated)"
                border="var(--border)"
                text={parts.body}
              />
            )}
            {parts.cta && (
              <ScriptSection
                label="CTA"
                accent="var(--green)"
                bg="var(--green-subtle)"
                border="rgba(48,164,108,0.25)"
                text={parts.cta}
              />
            )}
          </div>
        ) : (
          <pre style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
            {editText}
          </pre>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={handleCopy} className="btn-secondary" style={{ flex: 1, color: copied ? 'var(--green)' : undefined }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <button
          onClick={onSave}
          disabled={isSaving || saved}
          className={saved ? 'btn-secondary' : 'btn-primary'}
          style={{ flex: 1, color: saved ? 'var(--green)' : undefined }}
        >
          {isSaving ? 'Saving...' : saved ? '✓ Saved' : 'Save to Board'}
        </button>
      </div>
    </div>
  )
}

function ScriptSection({ label, accent, bg, border, text }: {
  label: string; accent: string; bg: string; border: string; text: string
}) {
  return (
    <div style={{ padding: '12px 14px', borderRadius: 8, background: bg, border: `1px solid ${border}` }}>
      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: accent, marginBottom: 6, textTransform: 'uppercase' as const }}>
        {label}
      </p>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
        {text}
      </p>
    </div>
  )
}
