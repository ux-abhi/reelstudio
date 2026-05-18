'use client'
import { useState } from 'react'
import { useScan } from '@/components/scan/ScanContext'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { TriggerWord } from '@/types/scan'

const COMPETITOR_SWIPE = [
  { account: '@uxabhi_ (Jun 2024)',     trigger: 'MAGIC',     offer: 'Animated Figma component library link',         comments: '1,900' },
  { account: '@ayzz.thedesigner',       trigger: 'COLOR',     offer: '4-step color system resource',                  comments: '521'   },
  { account: '@uthinhpham',             trigger: 'ANIMATION', offer: 'All Framer components used in portfolio',        comments: '4,700' },
  { account: '@uthinhpham',             trigger: 'FRIDAY',    offer: 'Google Doc of free fonts (updated weekly)',      comments: '691'   },
  { account: '@vaibhavshukla.design',   trigger: 'DESIGN',    offer: 'AI design hiring system mini-course',           comments: '2,400' },
]

const SUGGESTED_TRIGGERS: TriggerWord[] = [
  { word: 'FRAMER',    offer: 'Your favourite Framer components used in client work',                      expectedComments: '300–800', basedOn: 'Framer content getting outsized reach right now',         captionTemplate: 'I\'ve been using this in every client project and people keep asking.\n\nComment "FRAMER" below and I\'ll DM you the link.\n\nSAVE this post so you can find it later.' },
  { word: 'EUROPE',   offer: 'Step-by-step guide: getting UX clients in Europe as an Indian designer',    expectedComments: '200–500', basedOn: 'Unique angle no competitor owns',                        captionTemplate: 'Nobody talks about this honestly.\n\nComment "EUROPE" and I\'ll send you the full guide.\n\nSAVE this — you\'ll want to come back to it.' },
  { word: 'HCI',      offer: 'Your semester UX research notes as a Notion doc',                           expectedComments: '150–400', basedOn: 'Academic credibility — nobody else has this',           captionTemplate: 'I spent a semester studying this in depth.\n\nComment "HCI" and I\'ll DM you my research notes.\n\nSAVE for when you need this.' },
  { word: 'TOOLS',    offer: 'Your current AI + design tool stack as a living Google Sheet',              expectedComments: '500–1500', basedOn: 'Proven: similar triggers get 500–2000 comments',       captionTemplate: 'My entire tool stack in one doc — updated every month.\n\nComment "TOOLS" and I\'ll DM you the link.\n\nSAVE this post.' },
  { word: 'PORTFOLIO', offer: 'Your UX portfolio checklist — what you look for when reviewing',           expectedComments: '300–700', basedOn: 'High pain point for your audience',                     captionTemplate: 'I review portfolios every week. Here\'s the exact checklist.\n\nComment "PORTFOLIO" and I\'ll send it over.\n\nSAVE this for your next portfolio update.' },
  { word: 'STACK',    offer: 'Your 2026 UX toolkit (same as TOOLS, positioned for product designers)',    expectedComments: '400–900', basedOn: '"2026 stack" format currently breakout on the algorithm', captionTemplate: 'My 2026 design stack — every tool I\'m actually using.\n\nComment "STACK" and I\'ll DM you the full list.\n\nSAVE this before the algorithm buries it.' },
]

export default function TriggersPage() {
  const { scan, isScanning } = useScan()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  if (isScanning) return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SkeletonCard lines={3} />
      <SkeletonCard lines={3} />
    </div>
  )

  const triggers: TriggerWord[] = scan?.triggerWords?.length ? scan.triggerWords : SUGGESTED_TRIGGERS

  async function copyTemplate(word: string, template: string) {
    await navigator.clipboard.writeText(template)
    setCopied(word)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageHeader
        title="Trigger Words"
        subtitle="Comment triggers that drive DMs — your Jun 2024 post proved this format works (1,900 comments)"
      />

      {/* Your triggers */}
      <section>
        <p className="section-label" style={{ marginBottom: 12 }}>Your Triggers</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {triggers.map((t: TriggerWord) => (
            <div key={t.word} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === t.word ? null : t.word)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums', minWidth: 72 }}>
                    &ldquo;{t.word}&rdquo;
                  </span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>{t.offer}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{t.expectedComments} expected comments</p>
                  </div>
                </div>
                <button className="btn-ghost" style={{ fontSize: 16, flexShrink: 0 }}>
                  {expanded === t.word ? '−' : '+'}
                </button>
              </div>

              {expanded === t.word && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase' as const, marginBottom: 8 }}>Caption template</p>
                    <pre style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontFamily: 'inherit', background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 7, border: '1px solid var(--border)' }}>
                      {t.captionTemplate}
                    </pre>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => copyTemplate(t.word, t.captionTemplate)} className="btn-secondary" style={{ fontSize: 12, color: copied === t.word ? 'var(--green)' : undefined }}>
                      {copied === t.word ? '✓ Copied' : 'Copy template'}
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Based on: {t.basedOn}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Competitor swipe file */}
      <section>
        <p className="section-label" style={{ marginBottom: 4 }}>Competitor Swipe File</p>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>Real triggers that worked in your niche</p>
        <div style={{ background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Trigger</th>
                <th>Offer</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITOR_SWIPE.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontSize: 12 }}>{row.account}</td>
                  <td><span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 12 }}>&ldquo;{row.trigger}&rdquo;</span></td>
                  <td style={{ fontSize: 12 }}>{row.offer}</td>
                  <td className="primary">{row.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
