'use client'
import { useState, useEffect } from 'react'
import { useScan } from '@/components/scan/ScanContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonGrid } from '@/components/shared/SkeletonCard'
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
    desc: 'The specific workflow of AI-assisted Framer development for client projects. @uthinhpham uses Framer but doesn\'t use Claude. Nobody documents the AI-assisted Framer workflow.',
    reel: '"A client needed a landing page. I had 4 hours. Here\'s the exact Framer + Claude workflow — comment \'WORKFLOW\' for the full process doc."',
    reach: 'Highest save potential — founders + designers + freelancers all save this',
  },
  {
    title: 'Speaks Hindi/Hinglish to a Global Design Audience',
    desc: 'The authentic bilingual voice that switches naturally between Hindi and English without being performative. Hindi rant: 7.2% engagement — double the niche average.',
    reel: '"European design agencies mein Indian designers ko kya problem aati hai — aur main iske baare mein honestly baat karta hun jo koi aur nahi karta."',
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
    <div className="page-enter flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.92)' }}>Content Pillars</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>Inferred by Groq from your actual post history</p>
        <hr className="divider mt-4" />
      </div>

      {/* Pillars */}
      <section>
        <SectionLabel>Your 5 Pillars</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {(scan.pillars ?? []).map((pillar: Pillar, i) => (
            <div key={i} className="card flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 20 }}>{pillar.emoji}</span>
                  <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>{pillar.name}</h3>
                </div>
                <span className="text-sm font-bold" style={{ color: '#6e6aff' }}>{pillar.percentage}%</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill bar-accent" style={{ width: barWidths ? `${pillar.percentage}%` : '0%' }} />
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.50)', lineHeight: 1.5 }}>{pillar.description}</p>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Best format: {pillar.bestFormat}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>Based on: {pillar.basedOn}</p>
              </div>
              {pillar.exampleIdeas?.length > 0 && (
                <div className="flex flex-col gap-1 mt-1">
                  {pillar.exampleIdeas.slice(0, 3).map((idea, j) => (
                    <p key={j} className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>→ {idea}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Unfair advantages */}
      <section>
        <SectionLabel>Your 5 Unfair Advantages</SectionLabel>
        <p className="text-xs mt-1 mb-4" style={{ color: 'rgba(255,255,255,0.30)' }}>Content angles that NO 50K+ account in your niche can replicate</p>
        <div className="flex flex-col gap-4">
          {UNFAIR_ADVANTAGES.map((adv, i) => (
            <div key={i} className="card" style={{ border: '0.5px solid rgba(110,106,255,0.15)' }}>
              <div className="flex items-start gap-3">
                <span className="text-lg font-bold flex-shrink-0" style={{ color: 'rgba(110,106,255,0.60)', fontFamily: 'monospace', lineHeight: 1.4 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>{adv.title}</h3>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.50)', lineHeight: 1.5 }}>{adv.desc}</p>
                  <div className="rounded-lg p-3 mt-1" style={{ background: 'rgba(110,106,255,0.06)', border: '0.5px solid rgba(110,106,255,0.15)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(110,106,255,0.70)', letterSpacing: '0.04em' }}>THE REEL ONLY YOU CAN MAKE</p>
                    <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{adv.reel}</p>
                    <p className="text-xs mt-2" style={{ color: '#34C759' }}>→ {adv.reach}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Do's and Don'ts */}
      {scan.accountHealth && (
        <section>
          <SectionLabel>Do&apos;s & Don&apos;ts</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="card" style={{ border: '0.5px solid rgba(52,199,89,0.15)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: '#34C759', letterSpacing: '0.04em' }}>DO MORE OF THIS</p>
              <div className="flex flex-col gap-2">
                {['Screen recording + practical shortcut + comment trigger', 'Hindi/Hinglish opinion reels — your highest engagement rate format', 'Builder\'s Log: document real builds in progress', 'Result-first hooks — show the output in the first 2 seconds', 'Weekly recurring series (Free Tool Tuesday, etc.)'].map((item, i) => (
                  <p key={i} className="text-xs flex items-start gap-2" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                    <span style={{ color: '#34C759', flexShrink: 0 }}>✓</span>{item}
                  </p>
                ))}
              </div>
            </div>
            <div className="card" style={{ border: '0.5px solid rgba(255,69,58,0.15)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: '#FF453A', letterSpacing: '0.04em' }}>STOP DOING THIS</p>
              <div className="flex flex-col gap-2">
                {['Generic motivation reels (penguin, quotes) — consistently underperform', 'Slow intros ("Hi I\'m Abhishek...") — viewers leave in 2 seconds', 'UX Series episodes without strong hooks — consistently 40-53 likes', 'Productivity content without specific tool angle', 'Posts without a comment trigger or save CTA'].map((item, i) => (
                  <p key={i} className="text-xs flex items-start gap-2" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                    <span style={{ color: '#FF453A', flexShrink: 0 }}>×</span>{item}
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)' }}>{children}</p>
}
