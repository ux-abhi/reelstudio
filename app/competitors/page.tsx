'use client'
import { useState, useEffect } from 'react'
import { useScan } from '@/components/scan/ScanContext'
import { PageHeader } from '@/components/shared/PageHeader'
import { CompetitorAnalysis } from '@/types/scan'

const NICHE_TAGS = ['ux design', 'figma tutorial', 'framer website', 'ai design tools', 'product design', 'ux portfolio', 'design career', 'indian designer', 'hci design', 'design tools', 'ui ux', 'framer', 'design critique', 'design student', 'vibe coding']

export default function CompetitorsPage() {
  const { scan } = useScan()
  const [competitors, setCompetitors] = useState<CompetitorAnalysis[]>([])
  const [selected, setSelected] = useState<CompetitorAnalysis | null>(null)
  const [handle, setHandle] = useState('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('uxabhi:competitors')
      if (stored) {
        const list = JSON.parse(stored)
        setCompetitors(list)
        if (list.length > 0) setSelected(list[0])
      }
    } catch {}
  }, [])

  function saveCompetitors(list: CompetitorAnalysis[]) {
    setCompetitors(list)
    localStorage.setItem('uxabhi:competitors', JSON.stringify(list))
  }

  async function analyzeCompetitor() {
    if (!handle.trim()) return
    setLoading(true); setError(null)
    const prompt = `Analyse this Instagram account as a competitor to @uxabhi_ (UX designer, HCI master's Germany, Indian in Europe, Framer + AI tools, 1,242 followers):
Handle: @${handle.replace('@', '')}
Context: ${context || 'Design/UX creator'}
Trends: ${JSON.stringify(scan?.trendPulse?.slice(0, 5) ?? [])}
Return ONLY this JSON (no markdown):
{
  "handle": "@${handle.replace('@', '')}",
  "strategy": "2-3 sentences",
  "hooksToSteal": ["hook 1 adapted to @uxabhi_ voice", "hook 2", "hook 3", "hook 4", "hook 5"],
  "gapsTheyLeave": ["gap 1", "gap 2", "gap 3"],
  "threatLevel": "high",
  "threatReason": "specific reason",
  "collabScore": "7/10",
  "collabPitch": "exact DM message ready to copy-paste",
  "whitespace": "the one angle they never touch that @uxabhi_ can own"
}`
    try {
      const res = await fetch('/api/groq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, maxTokens: 1200 }) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const clean = data.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      const result: CompetitorAnalysis = JSON.parse(clean)
      const updated = [result, ...competitors]
      saveCompetitors(updated)
      setSelected(result)
      setHandle(''); setContext('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const threatColor = (level: string) =>
    level === 'high' ? 'var(--red)' : level === 'medium' ? 'var(--yellow)' : 'var(--green)'

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <PageHeader title="Competitors" subtitle="Analyse, steal hooks, find whitespace" />

      {/* 3-column layout */}
      <div style={{ display: 'flex', gap: 0, minHeight: '60vh' }}>
        {/* Left — Filter / competitor list */}
        <div
          style={{
            width: 200,
            flexShrink: 0,
            borderRight: '1px solid var(--border)',
            paddingRight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <p className="section-label" style={{ padding: '0 0 12px' }}>Niche Tags</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 24 }}>
            {NICHE_TAGS.slice(0, 8).map(tag => (
              <button key={tag} className="chip-filter" style={{ fontSize: 11 }}>
                {tag}
              </button>
            ))}
          </div>

          <p className="section-label" style={{ padding: '0 0 8px' }}>Tracked</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {competitors.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '4px 0' }}>None yet</p>
            ) : (
              competitors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(c)}
                  className={`chip-filter${selected?.handle === c.handle ? ' active' : ''}`}
                  style={{ fontSize: 12 }}
                >
                  {c.handle}
                  <span className="chip-count" style={{ background: c.threatLevel === 'high' ? 'var(--red-subtle)' : 'var(--bg-elevated)', color: c.threatLevel === 'high' ? 'var(--red)' : 'var(--text-tertiary)' }}>
                    {c.threatLevel}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Center — Analysis output or Add form */}
        <div style={{ flex: 1, padding: '0 24px', minWidth: 0 }}>
          {!selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p className="section-label" style={{ marginBottom: 4 }}>Add Competitor</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Instagram handle</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-tertiary)' }}>@</span>
                    <input className="input" style={{ paddingLeft: 26 }} value={handle} onChange={e => setHandle(e.target.value.replace('@', ''))} placeholder="jitu.ux" />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Context (optional)</label>
                  <input className="input" value={context} onChange={e => setContext(e.target.value)} placeholder="Design/UX creator, 80K followers..." />
                </div>
                <button onClick={analyzeCompetitor} disabled={loading || !handle.trim()} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                  {loading ? 'Analysing...' : 'Analyse'}
                </button>
                {error && <p style={{ fontSize: 12, color: 'var(--red)' }}>{error}</p>}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{selected.handle}</h2>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <span className="badge" style={{ background: 'transparent', color: threatColor(selected.threatLevel), borderColor: threatColor(selected.threatLevel) }}>
                      {selected.threatLevel} threat
                    </span>
                    <span className="badge badge-stable">Collab {selected.collabScore}</span>
                  </div>
                </div>
                <button onClick={() => { setSelected(null); setHandle(''); }} className="btn-secondary" style={{ fontSize: 12, padding: '5px 12px' }}>
                  + Add new
                </button>
              </div>

              <div className="card">
                <p className="section-label" style={{ marginBottom: 8 }}>Strategy</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selected.strategy}</p>
              </div>

              <div className="card">
                <p className="section-label" style={{ marginBottom: 8 }}>Gaps they leave open</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selected.gapsTheyLeave?.map((gap, i) => (
                    <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--green)' }}>→</span>{gap}
                    </p>
                  ))}
                </div>
              </div>

              <div className="card" style={{ borderColor: 'var(--accent-border)' }}>
                <p className="section-label" style={{ marginBottom: 8 }}>Whitespace you can own</p>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>{selected.whitespace}</p>
              </div>

              <div className="card">
                <p className="section-label" style={{ marginBottom: 8 }}>Collab pitch</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>&ldquo;{selected.collabPitch}&rdquo;</p>
              </div>
            </div>
          )}
        </div>

        {/* Right — Quick steal */}
        <div
          style={{
            width: 260,
            flexShrink: 0,
            borderLeft: '1px solid var(--border)',
            paddingLeft: 24,
          }}
        >
          <p className="section-label" style={{ marginBottom: 12 }}>Quick Steal</p>
          {selected?.hooksToSteal?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selected.hooksToSteal.map((hook, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 7, border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{hook}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Analyse a competitor to see stolen hooks</p>
          )}
        </div>
      </div>
    </div>
  )
}
