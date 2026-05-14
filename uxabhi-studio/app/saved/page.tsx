'use client'
import { useState, useEffect } from 'react'
import { SavedScript } from '@/types/scan'

export default function SavedPage() {
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
    const a = document.createElement('a'); a.href = url; a.download = 'uxabhi-scripts.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  const formats = ['All', ...Array.from(new Set(scripts.map(s => s.format).filter(Boolean)))]
  const filtered = scripts.filter(s => {
    const matchFormat = filterFormat === 'All' || s.format === filterFormat
    const matchSearch = !search || s.hookLine.toLowerCase().includes(search.toLowerCase()) || s.input.toLowerCase().includes(search.toLowerCase())
    return matchFormat && matchSearch
  })

  return (
    <div className="page-enter flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.92)' }}>Save Board</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>{scripts.length} saved scripts</p>
        <hr className="divider mt-4" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input className="input text-sm py-2" style={{ maxWidth: 240 }} placeholder="Search scripts..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {formats.map(f => (
            <button key={f} onClick={() => setFilterFormat(f)} className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
              style={{ background: filterFormat === f ? 'rgba(110,106,255,0.15)' : 'rgba(255,255,255,0.05)', color: filterFormat === f ? '#8480ff' : 'rgba(255,255,255,0.45)', border: `0.5px solid ${filterFormat === f ? 'rgba(110,106,255,0.25)' : 'rgba(255,255,255,0.09)'}` }}>
              {f}
            </button>
          ))}
        </div>
        {scripts.length > 0 && (
          <button onClick={exportAll} className="text-xs font-medium px-3 py-1.5 rounded-full ml-auto" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: '0.5px solid rgba(255,255,255,0.10)' }}>
            Export all
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="text-base font-medium mb-2" style={{ color: 'rgba(255,255,255,0.50)' }}>No scripts yet</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>Go to Studio and save your first script</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(script => (
            <div key={script.id} className="rounded-2xl p-4 transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1" style={{ color: '#8480ff' }}>{script.hookLine || script.input.slice(0, 80)}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {script.format && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>{script.format}</span>}
                    {script.tone && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>{script.tone}</span>}
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{new Date(script.savedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button onClick={() => setExpanded(expanded === script.id ? null : script.id)} className="text-xs px-2 py-1 rounded-lg flex-shrink-0" style={{ color: 'rgba(255,255,255,0.40)', background: 'rgba(255,255,255,0.05)' }}>
                  {expanded === script.id ? '↑' : '↓'}
                </button>
              </div>
              {expanded === script.id && (
                <div className="mt-3 pt-3" style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)' }}>
                  <pre className="text-sm leading-relaxed whitespace-pre-wrap mb-4" style={{ color: 'rgba(255,255,255,0.70)', fontFamily: 'inherit' }}>{script.output}</pre>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handleCopy(script)} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', color: copied === script.id ? '#34C759' : 'rgba(255,255,255,0.70)', border: '0.5px solid rgba(255,255,255,0.12)' }}>
                      {copied === script.id ? '✓ Copied' : 'Copy'}
                    </button>
                    <a href={`/studio?idea=${encodeURIComponent(script.input)}`} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: 'rgba(110,106,255,0.12)', color: '#8480ff', border: '0.5px solid rgba(110,106,255,0.20)' }}>
                      Load in Studio
                    </a>
                    <button onClick={() => handleDelete(script.id)} className="text-xs font-medium px-3 py-1.5 rounded-full ml-auto" style={{ background: 'rgba(255,69,58,0.10)', color: '#FF453A', border: '0.5px solid rgba(255,69,58,0.20)' }}>
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
