'use client'
import { useState, useEffect } from 'react'
import { useScan } from '@/components/scan/ScanContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonGrid } from '@/components/shared/SkeletonCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pillar } from '@/types/scan'

export default function PillarsPage() {
  const { scan, isScanning, isInitialLoad } = useScan()
  const [barWidths, setBarWidths] = useState(false)
  useEffect(() => { setTimeout(() => setBarWidths(true), 150) }, [])

  if (isScanning || isInitialLoad) return <SkeletonGrid count={5} />
  if (!scan) return <EmptyState title="No pillars yet" description="Run your scan to see your AI-inferred content pillars based on your real post history." />

  // Build do's from scan data: top formats and what worked in tier-1 posts
  const topFormat = scan.accountHealth?.topPerformingFormat
  const topPosts = (scan.posts ?? []).filter(p => p.tier === 1).slice(0, 3)
  const whatWorked = topPosts.map(p => p.whatWorked).filter(Boolean)
  const doList = [
    topFormat ? `${topFormat} — your top-performing format by engagement` : 'Result-first hooks — show the value in the first 2 seconds',
    ...whatWorked.slice(0, 2),
    'Comment triggers ("Comment X and I\'ll DM you") — drives saves and DMs',
    'Weekly recurring series — builds habit and expectation in your audience',
  ].filter(Boolean).slice(0, 5)

  // Build don'ts from scan data: weak posts and what didn't work
  const weakPosts = (scan.posts ?? []).filter(p => p.tier === 3).slice(0, 3)
  const whatDidnt = weakPosts.map(p => p.whatDidnt).filter(Boolean)
  const weakestFormat = scan.accountHealth?.weakestFormat
  const dontList = [
    weakestFormat ? `${weakestFormat} — your lowest-engagement format` : 'Slow intros — viewers leave in the first 2 seconds',
    ...whatDidnt.slice(0, 2),
    'Posts without a comment trigger or save CTA — no reason to engage',
    'Generic content with no specific angle or point of view',
  ].filter(Boolean).slice(0, 5)

  // Unique angles: derive from top pillars and content gaps
  const uniqueAngles = (scan.contentGaps ?? []).slice(0, 5)

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageHeader title="Content Pillars" subtitle="Inferred by Groq from your actual post history" />

      {/* Pillars */}
      <section>
        <p className="section-label" style={{ marginBottom: 16 }}>Your {scan.pillars?.length ?? 0} Pillars</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(scan.pillars ?? []).map((pillar: Pillar, i) => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{pillar.emoji}</span>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{pillar.name}</h3>
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{pillar.percentage}%</span>
              </div>
              <div className="health-track">
                <div className="health-fill accent" style={{ width: barWidths ? `${pillar.percentage}%` : '0%' }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{pillar.description}</p>
              <div style={{ display: 'flex', gap: 16 }}>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Best: {pillar.bestFormat}</p>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Based on: {pillar.basedOn}</p>
              </div>
              {pillar.exampleIdeas?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                  {pillar.exampleIdeas.slice(0, 3).map((idea, j) => (
                    <p key={j} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>→ {idea}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Unique angles / content gaps */}
      {uniqueAngles.length > 0 && (
        <section>
          <p className="section-label" style={{ marginBottom: 4 }}>Your Unique Angles</p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>Content gaps identified from your account scan — opportunities your competitors aren&apos;t covering</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {uniqueAngles.map((angle, i) => (
              <div key={i} className="card" style={{ borderColor: 'var(--accent-border)', display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, lineHeight: 1.5 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{angle}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Do's and don'ts — derived from scan data */}
      {scan.accountHealth && (
        <section>
          <p className="section-label" style={{ marginBottom: 16 }}>Do&apos;s & Don&apos;ts</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card" style={{ borderColor: 'rgba(48,164,108,0.25)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--green)', textTransform: 'uppercase' as const, marginBottom: 12 }}>Do more of this</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {doList.map((item, i) => (
                  <p key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>{item}
                  </p>
                ))}
              </div>
            </div>
            <div className="card" style={{ borderColor: 'rgba(229,72,77,0.25)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--red)', textTransform: 'uppercase' as const, marginBottom: 12 }}>Stop doing this</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dontList.map((item, i) => (
                  <p key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--red)', flexShrink: 0 }}>×</span>{item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
