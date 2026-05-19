'use client'
import { useState, useEffect } from 'react'
import { parseScript, countWords, wordCountColor } from '@/lib/scriptUtils'

interface Props {
  output: string
  format: string
  onSave: () => void
  onOutputChange: (text: string) => void
  isSaving: boolean
  saved: boolean
  onRegenerateSection: (section: 'hook' | 'body' | 'cta') => Promise<void>
  sectionLoading: 'hook' | 'body' | 'cta' | null
  history: string[]
  onSelectHistory: (text: string) => void
}

export function ScriptOutput({
  output, format, onSave, onOutputChange, isSaving, saved,
  onRegenerateSection, sectionLoading, history, onSelectHistory,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(output)

  useEffect(() => {
    setEditText(output)
    setIsEditing(false)
  }, [output])

  const parts = parseScript(editText)
  const hasStructure = parts.hook || parts.body || parts.cta
  const wordCount = countWords(editText)
  const wcColor = wordCountColor(wordCount, format)

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
            Output
          </p>
          <span style={{ fontSize: 11, fontWeight: 600, color: wcColor, transition: 'color 200ms ease' }}>
            {wordCount}w
          </span>
        </div>
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

      {/* History strip */}
      {history.length > 0 && (
        <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 500 }}>History:</span>
          {history.map((_, i) => (
            <button
              key={i}
              onClick={() => onSelectHistory(history[i])}
              style={{
                fontSize: 10,
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: 999,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 120ms ease',
              }}
            >
              v{i + 1}
            </button>
          ))}
        </div>
      )}

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
                onRegen={() => onRegenerateSection('hook')}
                loading={sectionLoading === 'hook'}
              />
            )}
            {parts.body && (
              <ScriptSection
                label="BODY"
                accent="var(--text-secondary)"
                bg="var(--bg-elevated)"
                border="var(--border)"
                text={parts.body}
                onRegen={() => onRegenerateSection('body')}
                loading={sectionLoading === 'body'}
              />
            )}
            {parts.cta && (
              <ScriptSection
                label="CTA"
                accent="var(--green)"
                bg="var(--green-subtle)"
                border="rgba(48,164,108,0.25)"
                text={parts.cta}
                onRegen={() => onRegenerateSection('cta')}
                loading={sectionLoading === 'cta'}
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
          {copied ? '✓ Copied' : 'Copy all'}
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

function ScriptSection({ label, accent, bg, border, text, onRegen, loading }: {
  label: string; accent: string; bg: string; border: string; text: string
  onRegen: () => void
  loading: boolean
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ padding: '12px 14px', borderRadius: 8, background: bg, border: `1px solid ${border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: accent, textTransform: 'uppercase' as const }}>
          {label}
        </p>
        <div style={{ display: 'flex', gap: 4 }}>
          <SectionBtn
            onClick={onRegen}
            disabled={loading}
            label={loading ? '...' : '↺ Rewrite'}
            activeColor="var(--accent)"
          />
          <SectionBtn
            onClick={handleCopy}
            label={copied ? '✓' : 'Copy'}
            activeColor={copied ? 'var(--green)' : undefined}
            forceActive={copied}
          />
        </div>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
        {text}
      </p>
    </div>
  )
}

function SectionBtn({ onClick, disabled, label, activeColor, forceActive }: {
  onClick: () => void; disabled?: boolean; label: string; activeColor?: string; forceActive?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: 10,
        fontWeight: 500,
        padding: '2px 7px',
        borderRadius: 4,
        background: 'transparent',
        border: `1px solid ${hovered || forceActive ? 'var(--border)' : 'transparent'}`,
        color: forceActive && activeColor ? activeColor : hovered ? 'var(--text-primary)' : disabled ? activeColor ?? 'var(--text-tertiary)' : 'var(--text-tertiary)',
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'inherit',
        transition: 'all 120ms ease',
      }}
    >
      {label}
    </button>
  )
}
