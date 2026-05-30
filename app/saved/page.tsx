'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { SavedScript } from '@/types/scan'

export default function SavedPage() {
  const router = useRouter()
  const [scripts, setScripts] = useState<SavedScript[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterFormat, setFilterFormat] = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/scripts')
      .then(r => r.json())
      .then(data => { setScripts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    await fetch('/api/scripts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setScripts(s => s.filter(sc => sc.id !== id))
    if (expanded === id) setExpanded(null)
  }

  async function handleCopy(script: SavedScript) {
    await navigator.clipboard.writeText(script.output)
    setCopied(script.id)
    setTimeout(() => setCopied(null), 2000)
  }

  function exportAll() {
    const text = scripts.map(s =>
      `--- ${s.format} | ${s.tone} | ${new Date(s.savedAt).toLocaleDateString()} ---\n${s.output}`
    ).join('\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const handle = localStorage.getItem('ss:handle') ?? 'scripts'
    const a = document.createElement('a'); a.href = url; a.download = `${handle}-scripts.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  const formats = ['All', ...Array.from(new Set(scripts.map(s => s.format).filter(Boolean)))]
  const filtered = scripts.filter(s => {
    const matchFormat = filterFormat === 'All' || s.format === filterFormat
    const matchSearch = !search || s.hookLine.toLowerCase().includes(search.toLowerCase()) || s.input.toLowerCase().includes(search.toLowerCase())
    return matchFormat && matchSearch
  })

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageHeader label="Saved" title="Save Board" subtitle={`${scripts.length} saved script${scripts.length !== 1 ? 's' : ''}`} />

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <input
          className="input"
          style={{ maxWidth: 220, fontSize: 13 }}
          placeholder="Search scripts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {formats.map(f => (
            <button
              key={f}
              onClick={() => setFilterFormat(f)}
              className={`pill-filter${filterFormat === f ? ' active' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>
        {scripts.length > 0 && (
          <button onClick={exportAll} className="btn-ghost" style={{ fontSize: 12, marginLeft: 'auto' }}>
            Export all
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', textAlign: 'center', gap: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>No scripts yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Go to Studio and save your first script</p>
          <button onClick={() => router.push('/studio')} className="btn-primary" style={{ marginTop: 16, fontSize: 13 }}>
            Open Studio
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(script => (
            <div key={script.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div
                style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === script.id ? null : script.id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-hover)', lineHeight: 1.4, marginBottom: 6 }}>
                    {script.hookLine || script.input.slice(0, 80)}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {script.format && <span className="tag tag-default">{script.format}</span>}
                    {script.tone && <span className="tag tag-default">{script.tone}</span>}
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      {new Date(script.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <button className="btn-ghost" style={{ fontSize: 16, flexShrink: 0 }}>
                  {expanded === script.id ? '−' : '+'}
                </button>
              </div>

              {expanded === script.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <pre style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontFamily: 'inherit', background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 7, border: '1px solid var(--border)' }}>
                    {script.output}
                  </pre>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      onClick={() => handleCopy(script)}
                      className="btn-secondary"
                      style={{ fontSize: 12, color: copied === script.id ? 'var(--green)' : undefined }}
                    >
                      {copied === script.id ? '✓ Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => router.push(`/studio?idea=${encodeURIComponent(script.input)}`)}
                      className="btn-secondary"
                      style={{ fontSize: 12 }}
                    >
                      Load in Studio
                    </button>
                    <button
                      onClick={() => handleDelete(script.id)}
                      className="btn-destructive"
                      style={{ fontSize: 12, marginLeft: 'auto' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
