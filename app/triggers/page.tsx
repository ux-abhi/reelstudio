'use client'
import { useState } from 'react'
import { useScan } from '@/components/scan/ScanContext'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { TriggerWord } from '@/types/scan'

const COMPETITOR_SWIPE = [
  { account: '@ayzz.thedesigner',     trigger: 'COLOR',     offer: '4-step color system resource',              comments: '521'   },
  { account: '@uthinhpham',           trigger: 'ANIMATION', offer: 'All Framer components used in portfolio',   comments: '4,700' },
  { account: '@uthinhpham',           trigger: 'FRIDAY',    offer: 'Google Doc of free fonts (updated weekly)', comments: '691'   },
  { account: '@vaibhavshukla.design', trigger: 'DESIGN',    offer: 'AI design hiring system mini-course',       comments: '2,400' },
]

const GENERIC_TRIGGERS: TriggerWord[] = [
  {
    word: 'TOOLS',
    offer: 'Your current toolkit as a shareable doc or sheet',
    expectedComments: '200–800',
    basedOn: 'Tool roundups are consistently high-engagement in creator niches',
    captionTemplate: 'I use these tools in every single project.\n\nComment "TOOLS" and I\'ll DM you the full list.\n\nSAVE this so you can find it later.',
  },
  {
    word: 'TEMPLATE',
    offer: 'Your most-used template or framework',
    expectedComments: '150–500',
    basedOn: 'Resource-gating consistently drives DMs',
    captionTemplate: 'This is my go-to template for this kind of work.\n\nComment "TEMPLATE" and I\'ll send it over.\n\nSAVE this — you\'ll come back to it.',
  },
  {
    word: 'RESOURCE',
    offer: 'A curated resource list relevant to your niche',
    expectedComments: '150–400',
    basedOn: 'Curated lists get saved and shared',
    captionTemplate: 'I\'ve been collecting these for months and finally putting them in one place.\n\nComment "RESOURCE" and I\'ll DM you the link.\n\nSAVE this post.',
  },
  {
    word: 'CHECKLIST',
    offer: 'A step-by-step checklist for a common problem in your niche',
    expectedComments: '200–600',
    basedOn: 'Checklists reduce friction — high save and share rates',
    captionTemplate: 'I wish I had this checklist when I started.\n\nComment "CHECKLIST" and I\'ll send it to your DMs.\n\nSAVE this before the algorithm buries it.',
  },
  {
    word: 'GUIDE',
    offer: 'A detailed guide or process doc for your main workflow',
    expectedComments: '200–700',
    basedOn: 'Guides drive comments from people who want the shortcut',
    captionTemplate: 'I spent a long time figuring this out so you don\'t have to.\n\nComment "GUIDE" and I\'ll DM you the full breakdown.\n\nSAVE this for when you need it.',
  },
  {
    word: 'STACK',
    offer: 'Your current tech/tool stack for your specific workflow',
    expectedComments: '300–900',
    basedOn: '"My stack" format is breakout on the algorithm — high curiosity and shareability',
    captionTemplate: 'My current stack — every tool I\'m actually using.\n\nComment "STACK" and I\'ll DM you the full list.\n\nSAVE this before the algorithm buries it.',
  },
]

export default function TriggersPage() {
  const { scan, isScanning, isInitialLoad } = useScan()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  if (isScanning || isInitialLoad) return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SkeletonCard lines={3} />
      <SkeletonCard lines={3} />
    </div>
  )

  const triggers: TriggerWord[] = scan?.triggerWords?.length ? scan.triggerWords : GENERIC_TRIGGERS
  const isFromScan = !!(scan?.triggerWords?.length)

  async function copyTemplate(word: string, template: string) {
    await navigator.clipboard.writeText(template)
    setCopied(word)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageHeader
        title="Trigger Words"
        subtitle={isFromScan ? 'Comment triggers generated from your account scan' : 'Proven comment-trigger formats — run a scan for personalised triggers'}
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
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>Real triggers that have worked in creator niches</p>
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
