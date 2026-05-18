'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { PageHeader } from '@/components/shared/PageHeader'
import { CompetitorAnalysis } from '@/types/scan'
import { buildCompetitorIdeasPrompt } from '@/lib/prompts/competitorAnalysis'

function extractHandle(input: string): string {
  const trimmed = input.trim()
  const urlMatch = trimmed.match(/instagram\.com\/([a-zA-Z0-9._]+)\/?/)
  if (urlMatch) return urlMatch[1].toLowerCase()
  return trimmed.replace(/^@/, '').toLowerCase()
}

interface CompetitorIdea {
  title: string
  hook: string
  angle: string
  format: string
}

const NICHE_TAGS = ['ux design', 'figma tutorial', 'framer', 'ai design tools', 'product design', 'ux portfolio', 'design career', 'hci design', 'design tools', 'ui ux', 'design student', 'vibe coding']

export default function CompetitorsPage() {
  const { scan } = useScan()
  const router = useRouter()
  const [competitors, setCompetitors] = useState<CompetitorAnalysis[]>([])
  const [selected, setSelected] = useState<CompetitorAnalysis | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Content pipeline state
  const [pipelineIdeas, setPipelineIdeas] = useState<CompetitorIdea[]>([])
  const [generatingIdeas, setGeneratingIdeas] = useState(false)
  const [ideasError, setIdeasError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ss:competitors')
      if (stored) {
        const list = JSON.parse(stored)
        setCompetitors(list)
        if (list.length > 0) setSelected(list[0])
      }
    } catch {}
  }, [])

  function saveCompetitors(list: CompetitorAnalysis[]) {
    setCompetitors(list)
    localStorage.setItem('ss:competitors', JSON.stringify(list))
  }

  // Build user context purely from scan — never mixed into competitor data
  function buildUserContext(): string {
    const profile = scan?.instagramProfile
    const lines = [
      profile?.handle ? `Handle: @${profile.handle}` : '',
      profile?.bio ? `Bio: ${profile.bio}` : '',
      profile?.followers ? `Followers: ${profile.followers.toLocaleString()}` : '',
      scan?.pillars?.slice(0, 3).map(p => p.name).join(', ')
        ? `Content pillars: ${scan.pillars.slice(0, 3).map(p => p.name).join(', ')}`
        : '',
    ].filter(Boolean)
    return lines.length > 0 ? lines.join('\n') : 'Instagram content creator in design/UX niche'
  }

  async function analyzeCompetitor() {
    const handle = extractHandle(input)
    if (!handle) return
    setLoading(true); setError(null); setPipelineIdeas([])

    try {
      // Try Apify first (real data, full isolation handled server-side)
      const apifyRes = await fetch('/api/apify/competitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle }),
      })

      if (apifyRes.ok) {
        const result = await apifyRes.json() as CompetitorAnalysis & { error?: string }
        if (!result.error) {
          const updated = [result, ...competitors.filter(c => c.handle !== result.handle)]
          saveCompetitors(updated)
          setSelected(result)
          setInput('')
          return
        }
      }

      // Apify not configured — Groq-only, with isolated prompt
      const userContext = buildUserContext()
      const prompt = `You are performing a competitive Instagram analysis.

IMPORTANT: These are TWO DIFFERENT people. Never apply attributes of one to the other.

══ MY ACCOUNT ══
${userContext}
[END MY ACCOUNT]

══ COMPETITOR: @${handle} ══
Handle: @${handle}
Note: No real profile data available — infer from handle/niche context only.
[END COMPETITOR]

TRENDS: ${JSON.stringify(scan?.trendPulse?.slice(0, 5) ?? [])}

Return ONLY this JSON (no markdown):
{
  "handle": "@${handle}",
  "strategy": "2-3 sentences on what they likely post based on their niche",
  "hooksToSteal": ["hook 1 adapted to my voice", "hook 2", "hook 3", "hook 4", "hook 5"],
  "gapsTheyLeave": ["gap 1", "gap 2", "gap 3"],
  "threatLevel": "medium",
  "threatReason": "reason",
  "collabScore": "6/10",
  "collabPitch": "DM message",
  "whitespace": "angle they never touch that I can own"
}`
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 1200 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const clean = data.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      const result: CompetitorAnalysis = JSON.parse(clean)
      const updated = [result, ...competitors.filter(c => c.handle !== result.handle)]
      saveCompetitors(updated)
      setSelected(result)
      setInput('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  async function generateContentIdeas() {
    if (!selected) return
    setGeneratingIdeas(true); setIdeasError(null); setPipelineIdeas([])
    try {
      const userContext = buildUserContext()
      const prompt = buildCompetitorIdeasPrompt(
        selected.handle,
        selected.gapsTheyLeave ?? [],
        selected.hooksToSteal ?? [],
        selected.whitespace ?? '',
        userContext
      )
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 1500 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const clean = data.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      const ideas: CompetitorIdea[] = JSON.parse(clean)
      setPipelineIdeas(ideas)
    } catch (e: unknown) {
      setIdeasError(e instanceof Error ? e.message : 'Failed to generate ideas')
    } finally {
      setGeneratingIdeas(false)
    }
  }

  const threatColor = (level: string) =>
    level === 'high' ? 'var(--red)' : level === 'medium' ? 'var(--yellow)' : 'var(--green)'

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title="Competitors" subtitle="Paste any Instagram link or handle to analyse" />

      <div style={{ display: 'flex', gap: 0, minHeight: '60vh' }}>
        {/* Left — niche tags + tracked */}
        <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid var(--border)', paddingRight: 16, display: 'flex', flexDirection: 'column' }}>
          <p className="section-label" style={{ padding: '0 0 12px' }}>Niche</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 24 }}>
            {NICHE_TAGS.slice(0, 8).map(tag => (
              <button key={tag} className="chip-filter" style={{ fontSize: 11 }} onClick={() => setInput(tag)}>
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
                  onClick={() => { setSelected(c); setPipelineIdeas([]) }}
                  className={`chip-filter${selected?.handle === c.handle ? ' active' : ''}`}
                  style={{ fontSize: 12 }}
                >
                  {c.handle}
                  <span className="chip-count" style={{
                    background: c.threatLevel === 'high' ? 'var(--red-subtle)' : 'var(--bg-elevated)',
                    color: c.threatLevel === 'high' ? 'var(--red)' : 'var(--text-tertiary)',
                  }}>
                    {c.threatLevel}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Center */}
        <div style={{ flex: 1, padding: '0 24px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Add form */}
          <div>
            <p className="section-label" style={{ marginBottom: 10 }}>Analyse account</p>
            <div style={{ display: 'flex', gap: 8, maxWidth: 440 }}>
              <input
                className="input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') analyzeCompetitor() }}
                placeholder="@handle or instagram.com/handle"
                autoComplete="off"
                spellCheck={false}
                style={{ flex: 1 }}
              />
              <button
                onClick={analyzeCompetitor}
                disabled={loading || !input.trim()}
                className="btn-primary"
                style={{ flexShrink: 0 }}
              >
                {loading ? 'Analysing...' : 'Analyse'}
              </button>
            </div>
            {error && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{error}</p>}
          </div>

          {selected ? (
            <>
              {/* Analysis */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                  <button
                    onClick={() => {
                      const updated = competitors.filter(c => c.handle !== selected.handle)
                      saveCompetitors(updated)
                      setSelected(updated[0] ?? null)
                      setPipelineIdeas([])
                    }}
                    className="btn-ghost"
                    style={{ fontSize: 12, width: 'auto', padding: '5px 10px' }}
                    title="Remove"
                  >
                    ✕
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
                        <span style={{ color: 'var(--green)', flexShrink: 0 }}>→</span>{gap}
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

              {/* ── Content Pipeline ── */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <p className="section-label">Content pipeline</p>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                      Ideas inspired by {selected.handle}&apos;s gaps — rewritten in your voice
                    </p>
                  </div>
                  <button
                    onClick={generateContentIdeas}
                    disabled={generatingIdeas}
                    className="btn-secondary"
                    style={{ fontSize: 12, flexShrink: 0 }}
                  >
                    {generatingIdeas ? 'Generating...' : pipelineIdeas.length > 0 ? 'Regenerate' : 'Generate ideas →'}
                  </button>
                </div>

                {ideasError && (
                  <p style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{ideasError}</p>
                )}

                {pipelineIdeas.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {pipelineIdeas.map((idea, i) => (
                      <div
                        key={i}
                        className="card"
                        style={{ cursor: 'default' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <span style={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: 'var(--text-tertiary)',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                borderRadius: 4,
                                padding: '2px 6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                              }}>
                                {idea.format}
                              </span>
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}>
                              {idea.title}
                            </p>
                            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic', marginBottom: 6, lineHeight: 1.5 }}>
                              &ldquo;{idea.hook}&rdquo;
                            </p>
                            <p style={{ fontSize: 11, color: 'var(--accent)', lineHeight: 1.4 }}>
                              {idea.angle}
                            </p>
                          </div>
                          <button
                            onClick={() => router.push(`/studio?idea=${encodeURIComponent(idea.title + ' — ' + idea.hook)}`)}
                            className="btn-primary"
                            style={{ fontSize: 11, padding: '6px 12px', flexShrink: 0 }}
                          >
                            Write this →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Analyse an account above to see the breakdown</p>
            </div>
          )}
        </div>

        {/* Right — hooks to steal */}
        <div style={{ width: 260, flexShrink: 0, borderLeft: '1px solid var(--border)', paddingLeft: 24 }}>
          <p className="section-label" style={{ marginBottom: 12 }}>Hooks to steal</p>
          {selected?.hooksToSteal?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selected.hooksToSteal.map((hook, i) => (
                <div
                  key={i}
                  style={{ padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 7, border: '1px solid var(--border)' }}
                >
                  <p style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 8 }}>{hook}</p>
                  <button
                    onClick={() => router.push(`/studio?idea=${encodeURIComponent(hook)}`)}
                    style={{
                      fontSize: 10,
                      color: 'var(--accent)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      fontFamily: 'inherit',
                      fontWeight: 500,
                    }}
                  >
                    Write this →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Analyse a competitor to see hook ideas</p>
          )}
        </div>
      </div>
    </div>
  )
}
