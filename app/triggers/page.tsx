'use client'
import { useState } from 'react'
import { useScan } from '@/components/scan/ScanContext'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { TriggerWord } from '@/types/scan'

const COMPETITOR_SWIPE: { account: string; trigger: string; offer: string; comments: string }[] = [
  { account: '@uxabhi_ (Jun 2024)', trigger: 'MAGIC', offer: 'Animated Figma component library link', comments: '1,900' },
  { account: '@ayzz.thedesigner', trigger: 'COLOR', offer: '4-step color system resource', comments: '521' },
  { account: '@uthinhpham', trigger: 'ANIMATION', offer: 'All Framer components used in portfolio', comments: '4,700' },
  { account: '@uthinhpham', trigger: 'FRIDAY', offer: 'Google Doc of free fonts (updated weekly)', comments: '691' },
  { account: '@vaibhavshukla.design', trigger: 'DESIGN', offer: 'AI design hiring system mini-course', comments: '2,400' },
  { account: '@vaibhavshukla.design', trigger: 'AI', offer: 'Design hiring course access', comments: '653' },
]

const SUGGESTED_TRIGGERS = [
  { word: 'FRAMER', offer: 'Your favourite Framer components used in client work', why: 'Framer content getting outsized reach right now' },
  { word: 'EUROPE', offer: 'Step-by-step guide: getting UX clients in Europe as an Indian designer', why: 'Unique angle no competitor owns' },
  { word: 'HCI', offer: 'Your semester UX research notes as a Notion doc', why: 'Academic credibility — nobody else has this' },
  { word: 'TOOLS', offer: 'Your current AI + design tool stack as a living Google Sheet', why: 'Proven: similar triggers get 500-2000 comments' },
  { word: 'PORTFOLIO', offer: 'Your UX portfolio checklist — what you look for when reviewing', why: 'High pain point for your audience' },
  { word: 'STACK', offer: 'Your 2026 UX toolkit (same as TOOLS, positioned for product designers)', why: '"2026 stack" format currently breakout on the algorithm' },
]

export default function TriggersPage() {
  const { scan, isScanning } = useScan()
  const [expanded, setExpanded] = useState<string | null>(null)

  if (isScanning) return (
    <div className="page-enter flex flex-col gap-4">
      <SkeletonCard lines={3} />
      <SkeletonCard lines={3} />
    </div>
  )

  const triggers: TriggerWord[] = scan?.triggerWords?.length ? scan.triggerWords : SUGGESTED_TRIGGERS.map(t => ({
    word: t.word,
    offer: t.offer,
    expectedComments: '200-500',
    basedOn: t.why,
    captionTemplate: `I've been using this for every project and people keep asking me for it.\n\nComment "${t.word}" below and I'll DM you the link directly.\n\nSAVE this post so you can find it later.`,
  }))

  return (
    <div className="page-enter flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.92)' }}>Trigger Words</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>
          Comment triggers that drive DMs — your Jun 2024 post proved this format works (1,900 comments)
        </p>
        <hr className="divider mt-4" />
      </div>

      {/* Your triggers */}
      <section>
        <SectionLabel>Your Triggers</SectionLabel>
        <div className="flex flex-col gap-3 mt-3">
          {triggers.map((t: TriggerWord) => (
            <div key={t.word} className="rounded-2xl overflow-hidden" style={{ border: '0.5px solid rgba(255,255,255,0.09)' }}>
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer transition-all"
                style={{ background: 'rgba(255,255,255,0.04)' }}
                onClick={() => setExpanded(expanded === t.word ? null : t.word)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold" style={{ color: '#FFD60A', letterSpacing: '0.05em' }}>
                    &ldquo;{t.word}&rdquo;
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.50)' }}>{t.offer}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,199,89,0.12)', color: '#34C759' }}>
                    ~{t.expectedComments} comments
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.30)', fontSize: 12 }}>{expanded === t.word ? '↑' : '↓'}</span>
                </div>
              </div>

              {expanded === t.word && (
                <div className="px-4 py-4" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '0.5px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Why this will work: {t.basedOn}</p>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,214,10,0.06)', border: '0.5px solid rgba(255,214,10,0.15)' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: '#FFD60A', letterSpacing: '0.04em' }}>CAPTION TEMPLATE</p>
                    <pre className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.70)', fontFamily: 'inherit' }}>
                      {t.captionTemplate}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Competitor swipe file */}
      <section>
        <SectionLabel>Competitor Swipe File</SectionLabel>
        <p className="text-xs mt-1 mb-4" style={{ color: 'rgba(255,255,255,0.30)' }}>
          Real trigger words from competitor accounts — with actual comment counts
        </p>
        <div className="rounded-2xl overflow-hidden" style={{ border: '0.5px solid rgba(255,255,255,0.09)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                {['Account', 'Trigger', 'What they offered', 'Comments'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPETITOR_SWIPE.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < COMPETITOR_SWIPE.length - 1 ? '0.5px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <td style={{ padding: '10px 16px', color: 'rgba(255,255,255,0.60)', fontSize: 12 }}>{row.account}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span className="font-bold text-xs" style={{ color: '#FFD60A' }}>{row.trigger}</span>
                  </td>
                  <td style={{ padding: '10px 16px', color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{row.offer}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span className="text-xs font-semibold" style={{ color: '#34C759' }}>{row.comments}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)' }}>{children}</p>
}
