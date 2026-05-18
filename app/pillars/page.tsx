'use client'
import { useState, useEffect } from 'react'
import { useScan } from '@/components/scan/ScanContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonGrid } from '@/components/shared/SkeletonCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pillar } from '@/types/scan'

const UNFAIR_ADVANTAGES = [
  {
    title: 'Indian Designer Living in Germany',
    desc: 'The dual cultural lens of Indian design education + European professional standards. Every Indian designer wants to know how to get from India to Europe. You\'ve done it.',
    reel: '"I compared Indian vs German UX job interviews — the questions, the process, the salary, and what they actually look for. Posted from Berlin."',
    reach: '50K–200K impressions expected',
  },
  {
    title: 'HCI Masters Student Doing Real Research',
    desc: 'Actual academic credibility in human-computer interaction. No creator in this space has a current HCI research project.',
    reel: '"My HCI thesis studies [X behaviour]. I\'m running user research this week. Here\'s the protocol — and here\'s what we found."',
    reach: 'Academic + practitioner crossover',
  },
  {
    title: 'Builds Actual Products with AI at 2am',
    desc: 'Real builder energy with designer aesthetics. Most design creators talk about AI tools. You ship things with them.',
    reel: '"It\'s 11pm. I have a design problem I can\'t solve with existing tools. So I\'m building the tool. Follow along." — weekly series',
    reach: 'Chrome extension reel: 6.5% engagement from 1,242 followers',
  },
  {
    title: 'Uses Framer + Claude Together in Real Client Work',
    desc: 'The specific workflow of AI-assisted Framer development for client projects. Nobody documents the AI-assisted Framer workflow.',
    reel: '"A client needed a landing page. I had 4 hours. Here\'s the exact Framer + Claude workflow — comment \'WORKFLOW\' for the full process doc."',
    reach: 'Highest save potential — founders + designers + freelancers all save this',
  },
  {
    title: 'Speaks Hindi/Hinglish to a Global Design Audience',
    desc: 'The authentic bilingual voice that switches naturally. Hindi rant: 7.2% engagement — double the niche average.',
    reel: '"European design agencies mein Indian designers ko kya problem aati hai — aur main iske baare mein honestly baat karta hun."',
    reach: 'Indian diaspora design community globally — underserved, highly engaged',
  },
]

export default function PillarsPage() {
  const { scan, isScanning } = useScan()
  const [barWidths, setBarWidths] = useState(false)
  useEffect(() => { setTimeout(() => setBarWidths(true), 150) }, [])

  if (isScanning) return <SkeletonGrid count={5} />
  if (!scan) return <EmptyState title="No pillars yet" description="Run your scan to see your AI-inferred content pillars based on your real post history." />

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageHeader title="Content Pillars" subtitle="Inferred by Groq from your actual post history" />

      {/* Pillars */}
      <section>
        <p className="section-label" style={{ marginBottom: 16 }}>Your 5 Pillars</p>
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

      {/* Unfair advantages */}
      <section>
        <p className="section-label" style={{ marginBottom: 4 }}>Your 5 Unfair Advantages</p>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>Content angles no 50K+ account in your niche can replicate</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {UNFAIR_ADVANTAGES.map((adv, i) => (
            <div key={i} className="card" style={{ borderColor: 'var(--accent-border)' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, lineHeight: 1.5 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{adv.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{adv.desc}</p>
                  <div style={{ padding: '10px 12px', borderRadius: 7, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 6 }}>The reel only you can make</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>{adv.reel}</p>
                    <p style={{ fontSize: 12, color: 'var(--green)', marginTop: 8, fontWeight: 500 }}>→ {adv.reach}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Do's and don'ts */}
      {scan.accountHealth && (
        <section>
          <p className="section-label" style={{ marginBottom: 16 }}>Do&apos;s & Don&apos;ts</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card" style={{ borderColor: 'rgba(48,164,108,0.25)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--green)', textTransform: 'uppercase' as const, marginBottom: 12 }}>Do more of this</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Screen recording + practical shortcut + comment trigger', 'Hindi/Hinglish opinion reels — your highest engagement rate format', "Builder's Log: document real builds in progress", 'Result-first hooks — show the output in the first 2 seconds', 'Weekly recurring series (Free Tool Tuesday, etc.)'].map((item, i) => (
                  <p key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>{item}
                  </p>
                ))}
              </div>
            </div>
            <div className="card" style={{ borderColor: 'rgba(229,72,77,0.25)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--red)', textTransform: 'uppercase' as const, marginBottom: 12 }}>Stop doing this</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Generic motivation reels (penguin, quotes) — consistently underperform', "Slow intros (\"Hi I'm Abhishek...\") — viewers leave in 2 seconds", 'UX Series episodes without strong hooks — consistently 40–53 likes', 'Productivity content without specific tool angle', 'Posts without a comment trigger or save CTA'].map((item, i) => (
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
