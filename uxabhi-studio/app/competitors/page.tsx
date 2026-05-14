'use client'
import { useState, useEffect } from 'react'
import { useScan } from '@/components/scan/ScanContext'
import { CompetitorAnalysis } from '@/types/scan'

const NICHE_TAGS = ['ux design', 'figma tutorial', 'framer website', 'ai design tools', 'product design', 'ux portfolio', 'design career', 'indian designer', 'hci design', 'design tools', 'ui ux', 'framer', 'design critique', 'design student', 'vibe coding']

export default function CompetitorsPage() {
  const { scan } = useScan()
  const [competitors, setCompetitors] = useState<CompetitorAnalysis[]>([])
  const [handle, setHandle] = useState('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchReport, setBatchReport] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('uxabhi:competitors')
      if (stored) setCompetitors(JSON.parse(stored))
    } catch {}
  }, [])

  function saveCompetitors(list: CompetitorAnalysis[]) {
    setCompetitors(list)
    localStorage.setItem('uxabhi:competitors', JSON.stringify(list))
  }

  async function analyzeCompetitor() {
    if (!handle.trim()) return
    setLoading(true); setError(null)
    const trendsStr = JSON.stringify(scan?.trendPulse?.slice(0, 5) ?? [])
    const prompt = `Analyse this Instagram account as a competitor to @uxabhi_:
Handle: @${handle.replace('@', '')}
Context: ${context || 'Design/UX creator'}
@uxabhi_ profile: UX designer, HCI master's Germany, Indian designer, Framer + AI tools, 1,242 followers
Current trends: ${trendsStr}

Return ONLY this JSON (no markdown):
{
  "handle": "@${handle.replace('@', '')}",
  "strategy": "2-3 sentences on what they post and why it works",
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
      saveCompetitors([result, ...competitors])
      setHandle(''); setContext('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  async function runBatchReport() {
    if (competitors.length < 3) return
    setBatchLoading(true)
    const prompt = `Analyse these competitors for @uxabhi_ (UX designer, HCI master's Germany, Indian designer, Framer + AI tools):
${competitors.map(c => `${c.handle}: ${c.strategy}`).join('\n')}
Trends: ${JSON.stringify(scan?.trendPulse?.slice(0,4) ?? [])}

Return ONLY JSON:
{
  "combinedStealReport": ["top 5 hooks across all competitors adapted to @uxabhi_ voice"],
  "sharedGaps": ["3 content gaps ALL competitors leave open"],
  "topWhitespace": "single best unclaimed content angle for @uxabhi_",
  "positioningMap": "2-3 sentences on where @uxabhi_ sits vs all competitors"
}`
    try {
      const res = await fetch('/api/groq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, maxTokens: 1000 }) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setBatchReport(data.text)
    } finally {
      setBatchLoading(false)
    }
  }

  const THREAT_COLORS: Record<string, string> = { high: '#FF453A', medium: '#FFD60A', low: '#34C759' }

  return (
    <div className="page-enter flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.92)' }}>Competitor Analyzer</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>Analyse any Instagram account as a competitor — steal hooks, find gaps, get the collab pitch</p>
        <hr className="divider mt-4" />
      </div>

      {/* Add manually */}
      <section className="card">
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)', marginBottom: 12 }}>Add Competitor</p>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>@</span>
            <input className="input pl-7" value={handle} onChange={e => setHandle(e.target.value.replace('@', ''))} placeholder="handle" />
          </div>
          <input className="input text-sm" value={context} onChange={e => setContext(e.target.value)} placeholder="Optional context (e.g. Framer creator, 50K followers)" />
          {error && <p className="text-xs" style={{ color: '#FF453A' }}>{error}</p>}
          <button onClick={analyzeCompetitor} disabled={loading || !handle.trim()} className="py-2.5 rounded-full text-sm font-medium" style={{ background: loading ? 'rgba(110,106,255,0.30)' : '#6e6aff', color: '#fff' }}>
            {loading ? 'Analysing...' : 'Analyse Competitor'}
          </button>
        </div>
      </section>

      {/* Niche tags */}
      <section>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)', marginBottom: 12 }}>Quick Add from Niche</p>
        <div className="flex flex-wrap gap-2">
          {NICHE_TAGS.map(tag => (
            <button key={tag} onClick={() => { setContext(`Creates content about: ${tag}`); }} className="text-xs px-3 py-1.5 rounded-full transition-all" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.50)', border: '0.5px solid rgba(255,255,255,0.09)' }}>
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Competitor cards */}
      {competitors.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)' }}>
              Tracked ({competitors.length})
            </p>
            {competitors.length >= 3 && (
              <button onClick={runBatchReport} disabled={batchLoading} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: 'rgba(110,106,255,0.12)', color: '#8480ff', border: '0.5px solid rgba(110,106,255,0.20)' }}>
                {batchLoading ? 'Generating...' : 'Batch Report'}
              </button>
            )}
          </div>

          {competitors.map(comp => (
            <div key={comp.handle} className="rounded-2xl overflow-hidden" style={{ border: '0.5px solid rgba(255,255,255,0.09)' }}>
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer" style={{ background: 'rgba(255,255,255,0.04)' }} onClick={() => setExpanded(expanded === comp.handle ? null : comp.handle)}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>{comp.handle}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${THREAT_COLORS[comp.threatLevel] ?? '#FFD60A'}18`, color: THREAT_COLORS[comp.threatLevel] ?? '#FFD60A' }}>
                    {comp.threatLevel} threat
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>Collab: {comp.collabScore}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); saveCompetitors(competitors.filter(c => c.handle !== comp.handle)) }} className="text-xs px-2 py-1 rounded-lg" style={{ color: '#FF453A', background: 'rgba(255,69,58,0.10)' }}>✕</button>
                  <span style={{ color: 'rgba(255,255,255,0.30)', fontSize: 12 }}>{expanded === comp.handle ? '↑' : '↓'}</span>
                </div>
              </div>

              {expanded === comp.handle && (
                <div className="px-4 py-4 flex flex-col gap-4" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '0.5px solid rgba(255,255,255,0.07)' }}>
                  <div>
                    <SubLabel>Strategy</SubLabel>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{comp.strategy}</p>
                  </div>
                  <div>
                    <SubLabel>Hooks to steal</SubLabel>
                    <div className="flex flex-col gap-1.5">
                      {comp.hooksToSteal?.map((h, i) => <p key={i} className="text-xs" style={{ color: 'rgba(255,255,255,0.60)', lineHeight: 1.5 }}>→ {h}</p>)}
                    </div>
                  </div>
                  <div>
                    <SubLabel>Gaps they leave</SubLabel>
                    <div className="flex flex-col gap-1.5">
                      {comp.gapsTheyLeave?.map((g, i) => <p key={i} className="text-xs" style={{ color: 'rgba(255,255,255,0.60)', lineHeight: 1.5 }}>→ {g}</p>)}
                    </div>
                  </div>
                  <div>
                    <SubLabel>Whitespace</SubLabel>
                    <p className="text-sm" style={{ color: '#34C759', lineHeight: 1.6 }}>{comp.whitespace}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(110,106,255,0.06)', border: '0.5px solid rgba(110,106,255,0.15)' }}>
                    <SubLabel>Collab pitch (copy-paste DM)</SubLabel>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.70)', lineHeight: 1.6 }}>{comp.collabPitch}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Batch report */}
      {batchReport && (
        <section className="card" style={{ border: '0.5px solid rgba(110,106,255,0.20)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8480ff', marginBottom: 12 }}>Batch Report</p>
          <pre className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.70)', fontFamily: 'inherit' }}>{batchReport}</pre>
        </section>
      )}
    </div>
  )
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.30)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{children}</p>
}
