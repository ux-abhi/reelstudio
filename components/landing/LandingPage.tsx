'use client'
import { useState } from 'react'
import Link from 'next/link'

// ── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  bg:        '#E3E2DE',
  bgCard:    '#FFFFFF',
  blue:      '#1351AA',
  blueLight: '#E8EFFE',
  black:     '#141414',
  gray:      '#444343',
  muted:     '#7A7A7A',
  border:    '#C7C7C7',
  borderDark:'#AEADAA',
}

// ── Primitives ────────────────────────────────────────────────────────────────

function Label({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <p style={{
      fontSize: '0.7rem',
      fontWeight: 700,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: color ?? C.muted,
      margin: 0,
    }}>
      {children}
    </p>
  )
}

function Btn({ href, children, dark }: { href: string; children: React.ReactNode; dark?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <Link href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '14px 30px',
        background: hov ? (dark ? C.blue : C.black) : (dark ? C.black : C.blue),
        color: C.bg,
        fontSize: '0.8125rem', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        textDecoration: 'none', transition: 'background 0.25s linear',
        fontFamily: 'inherit', whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Link>
  )
}

function Row({ label, children, accent, noBorder }: { label: string; children: React.ReactNode; accent?: boolean; noBorder?: boolean }) {
  return (
    <section style={{ borderTop: noBorder ? 'none' : `1px solid ${C.border}` }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 2.5rem',
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: 0,
      }}>
        <div style={{
          borderRight: `1px solid ${C.border}`,
          padding: '3rem 2rem 3rem 0',
          display: 'flex', alignItems: 'flex-start',
        }}>
          <Label color={accent ? C.blue : undefined}>{label}</Label>
        </div>
        <div style={{ padding: '3rem 0 3rem 3rem' }}>
          {children}
        </div>
      </div>
    </section>
  )
}

// ── Landing page ──────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div style={{
      background: C.bg,
      color: C.black,
      fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      minHeight: '100vh',
    }}>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 22s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: `${C.bg}f2`, backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${C.border}`,
        height: 64, display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', width: '100%',
          padding: '0 2.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.black }}>
            Draftr
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <Link href="#how" style={{ fontSize: '0.8125rem', fontWeight: 500, color: C.muted, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.black)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >
              How it works
            </Link>
            <Link href="#features" style={{ fontSize: '0.8125rem', fontWeight: 500, color: C.muted, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.black)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >
              Features
            </Link>
            <Link href="/login" style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.black, textDecoration: 'none', borderBottom: `1px solid ${C.black}`, paddingBottom: 1 }}
              onMouseEnter={e => { e.currentTarget.style.color = C.blue; e.currentTarget.style.borderColor = C.blue }}
              onMouseLeave={e => { e.currentTarget.style.color = C.black; e.currentTarget.style.borderColor = C.black }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${C.border}`, minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '5rem 2.5rem 4rem' }}>

          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
            <div style={{ width: 10, height: 10, background: C.blue, flexShrink: 0 }} />
            <Label color={C.blue}>For Instagram + LinkedIn Creators</Label>
          </div>

          {/* Main headline */}
          <h1 style={{
            fontSize: 'clamp(3.5rem, 8.5vw, 9rem)',
            fontWeight: 900,
            lineHeight: 0.87,
            letterSpacing: '-0.04em',
            color: C.black,
            margin: '0 0 2.5rem',
            maxWidth: '900px',
          }}>
            YOUR WEEK IS<br />
            FULL OF{' '}
            <span style={{ color: C.blue }}>CONTENT.</span><br />
            YOU&apos;RE JUST<br />
            NOT POSTING IT.
          </h1>

          {/* Subtext + CTA */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2.5rem' }}>
            <p style={{ fontSize: '1.125rem', color: C.gray, lineHeight: 1.6, maxWidth: 480, margin: 0 }}>
              Draftr scans your real Instagram account, then turns what happened
              this week into platform-native scripts for Reels and LinkedIn posts —
              in your voice, built on your actual data.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Btn href="/login">Get Started Free →</Btn>
              <Link href="#how" style={{ fontSize: '0.875rem', fontWeight: 600, color: C.gray, textDecoration: 'none', borderBottom: `1px solid ${C.borderDark}`, paddingBottom: 2 }}>
                See how it works ↓
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', gap: 0, marginTop: '4rem',
            borderTop: `1px solid ${C.border}`,
          }}>
            {[
              ['2', 'Platforms — Instagram + LinkedIn'],
              ['60s', 'To scan your account'],
              ['3–4', 'Posts per week, auto-planned'],
              ['100%', 'Based on your real data'],
            ].map(([num, label], i) => (
              <div key={i} style={{
                flex: 1,
                padding: '1.5rem 0',
                borderRight: i < 3 ? `1px solid ${C.border}` : 'none',
                paddingRight: i < 3 ? '2rem' : 0,
                paddingLeft: i > 0 ? '2rem' : 0,
              }}>
                <p style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 900, color: C.blue, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 0.3rem' }}>
                  {num}
                </p>
                <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0, lineHeight: 1.4 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE TICKER ───────────────────────────────── */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        padding: '0.875rem 0',
        overflow: 'hidden',
        background: C.black,
      }}>
        <div className="marquee-track" style={{ display: 'flex', gap: 0, width: 'max-content' }}>
          {[...Array(2)].map((_, rep) => (
            <div key={rep} style={{ display: 'flex', alignItems: 'center' }}>
              {[
                'REEL SCRIPTS', 'LINKEDIN POSTS', 'CAROUSEL DECKS',
                'HOOK LINES', 'IMAGE PROMPTS', 'CAPTION COPY',
                'CONTENT CALENDAR', 'TRIGGER WORDS', 'ACCOUNT AUDIT',
                'COMPETITOR ANALYSIS', 'TALKING HEAD', 'LIFE LOG →',
              ].map((item, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 700,
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: item === 'LIFE LOG →' ? C.blue : '#E3E2DE',
                    padding: '0 2rem', whiteSpace: 'nowrap',
                  }}>
                    {item}
                  </span>
                  <span style={{ color: C.muted, fontSize: '0.5rem' }}>◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2.5rem' }}>

          {/* Section header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '200px 1fr',
            borderBottom: `1px solid ${C.border}`,
          }}>
            <div style={{ borderRight: `1px solid ${C.border}`, padding: '2.5rem 2rem 2.5rem 0' }}>
              <Label>How it works</Label>
            </div>
            <div style={{ padding: '2.5rem 0 2.5rem 3rem' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 4.5rem)', fontWeight: 800, color: C.black, letterSpacing: '-0.03em', lineHeight: 0.9, margin: 0 }}>
                THREE STEPS.<br />
                <span style={{ color: C.blue }}>ZERO TEMPLATES.</span>
              </h2>
            </div>
          </div>

          {/* Steps */}
          {[
            {
              num: '01',
              title: 'Scan your Instagram',
              body: 'Connect your handle. We scrape your last 30 posts via Apify — real engagement rates, top hooks, best formats, trending hashtags in your niche. Everything is built from what you\'ve already posted.',
              tag: 'Takes 60 seconds',
            },
            {
              num: '02',
              title: 'Log what happened',
              body: 'Open Life Log. Dump your week in rough notes — what you shipped, learnt, struggled with, or figured out. No structure. No format. Just what happened.',
              tag: 'Freeform. Messy is fine.',
            },
            {
              num: '03',
              title: 'Get your drafts',
              body: 'Draftr generates Instagram Reel scripts, carousel breakdowns, and LinkedIn posts from your actual story. Each LinkedIn post includes an AI image prompt for DALL-E or Midjourney.',
              tag: 'Platform-native. In your voice.',
            },
          ].map((step, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr',
              borderBottom: i < 2 ? `1px solid ${C.border}` : 'none',
            }}>
              <div style={{
                borderRight: `1px solid ${C.border}`,
                padding: '2.5rem 2rem 2.5rem 0',
                display: 'flex', alignItems: 'flex-start',
              }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: C.muted, fontWeight: 600, letterSpacing: '0.05em' }}>{step.num}</span>
              </div>
              <div style={{ padding: '2.5rem 0 2.5rem 3rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '3rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)', fontWeight: 800, color: C.black, letterSpacing: '-0.025em', lineHeight: 1.05, margin: '0 0 0.75rem' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '1rem', color: C.gray, lineHeight: 1.6, margin: 0, maxWidth: 520 }}>
                    {step.body}
                  </p>
                </div>
                <div style={{
                  flexShrink: 0, padding: '0.4rem 1rem',
                  border: `1px solid ${C.border}`,
                  fontSize: '0.75rem', fontWeight: 600, color: C.muted, whiteSpace: 'nowrap',
                }}>
                  {step.tag}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TWO PLATFORMS ────────────────────────────────── */}
      <Row label="Output">
        <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3.5rem)', fontWeight: 800, color: C.black, letterSpacing: '-0.03em', lineHeight: 0.95, margin: '0 0 2.5rem' }}>
          ONE INPUT.<br />TWO PLATFORMS.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

          {/* Instagram */}
          <div style={{ borderRight: `1px solid ${C.border}`, paddingRight: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
              <div style={{ width: 8, height: 8, background: C.blue }} />
              <Label color={C.blue}>Instagram</Label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['Reel Script', 'Hook + body + CTA structured for maximum watch time'],
                ['Carousel Deck', 'Slide-by-slide breakdown with hook slide and CTA'],
                ['Talking Head', 'Conversational script for direct-to-camera content'],
                ['Caption Copy', 'First-2-lines hook + trigger word + hashtags'],
                ['Hook Variants', '3 A/B hooks — curiosity, pattern interrupt, result-first'],
              ].map(([title, desc], i) => (
                <div key={i} style={{ padding: '1rem 0', borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.black, margin: '0 0 0.2rem' }}>{title}</p>
                  <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0, lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* LinkedIn */}
          <div style={{ paddingLeft: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
              <div style={{ width: 8, height: 8, border: `2px solid ${C.blue}` }} />
              <Label color={C.blue}>LinkedIn</Label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['Story Post', 'Narrative arc — what happened, what you learnt, what it means'],
                ['Insight Post', 'One sharp professional insight, structured for engagement'],
                ['Progress Post', 'Milestone, build log, or honest reflection'],
                ['Image Prompt', 'Editorial AI image prompt for DALL-E 3 or Midjourney — every post'],
                ['Hashtags', '3–5 relevant professional hashtags, never stuffed'],
              ].map(([title, desc], i) => (
                <div key={i} style={{ padding: '1rem 0', borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.black, margin: '0 0 0.2rem' }}>{title}</p>
                  <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0, lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Row>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '200px 1fr',
            borderBottom: `1px solid ${C.border}`,
          }}>
            <div style={{ borderRight: `1px solid ${C.border}`, padding: '2.5rem 2rem 2.5rem 0' }}>
              <Label>The system</Label>
            </div>
            <div style={{ padding: '2.5rem 0 2.5rem 3rem' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 800, color: C.black, letterSpacing: '-0.03em', lineHeight: 0.92, margin: 0 }}>
                EVERYTHING<br />INSIDE DRAFTR.
              </h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {[
              { i: '01', title: 'Account Scan', desc: 'Real Instagram data via Apify — 30 posts, engagement analysis, hook strength, top formats, niche hashtags.' },
              { i: '02', title: 'Life Log', desc: 'Dump your week in plain text. Get Instagram scripts and LinkedIn posts built from your actual story.' },
              { i: '03', title: 'Studio', desc: 'Write, rewrite, and hook any idea. Section-level regen, tone controls, 5 hook types, A/B variants.' },
              { i: '04', title: '30-Day Calendar', desc: 'Real dates, AI-generated hooks, posting times — tuned to your cadence and trending keywords.' },
              { i: '05', title: 'Competitor Analysis', desc: 'Analyse any public Instagram account. Get their strategy, gaps they leave, and hooks you can adapt.' },
              { i: '06', title: 'Hooks + Triggers', desc: 'AI-generated hooks by type (curiosity, hot take, story, hinglish) and comment trigger words for your niche.' },
            ].map(({ i, title, desc }, idx) => (
              <FeatureBox key={i} index={i} title={title} desc={desc} noRight={idx % 3 === 2} />
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY DRAFTR ───────────────────────────────────── */}
      <Row label="Why Draftr">
        <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3.5rem)', fontWeight: 800, color: C.black, letterSpacing: '-0.03em', lineHeight: 0.95, margin: '0 0 2rem' }}>
          NOT ANOTHER<br />AI CONTENT TOOL.
        </h2>
        <div>
          {[
            ['Built on your real data', 'Not templates. Your actual post history, your actual hooks, your actual audience engagement — Apify scraped on demand.'],
            ['Your voice, not AI voice', 'Every output is calibrated to your niche, your proven hook styles, and your brand tone. It sounds like you because it starts with you.'],
            ['Both platforms, one input', 'Life Log takes one story and generates Instagram scripts AND LinkedIn posts simultaneously — platform-native, not copy-pasted.'],
            ['Image prompts included', 'Every LinkedIn post includes a ready-to-paste image prompt for DALL-E 3, Midjourney v6, or Ideogram. Editorial. Professional. Not stock.'],
          ].map(([title, desc], i) => (
            <WhyItem key={i} index={`0${i + 1}`} title={title} desc={desc} />
          ))}
        </div>
      </Row>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${C.border}`, minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '5rem 2.5rem' }}>
          <div style={{ maxWidth: 800 }}>
            <Label color={C.blue} >Early Access</Label>
            <h2 style={{
              fontSize: 'clamp(3rem, 7vw, 7.5rem)',
              fontWeight: 900,
              color: C.black,
              letterSpacing: '-0.04em',
              lineHeight: 0.87,
              margin: '1rem 0 2rem',
            }}>
              START WITH<br />
              YOUR REAL<br />
              <span style={{ color: C.blue }}>WEEK.</span>
            </h2>
            <p style={{ fontSize: '1.125rem', color: C.gray, lineHeight: 1.6, maxWidth: 480, margin: '0 0 2.5rem' }}>
              No templates. No made-up content ideas. Just your real work turned into
              posts that sound like you — free while we&apos;re building.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <Btn href="/login" dark>Get Started Free →</Btn>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, margin: '0 0 0.2rem' }}>
                  Free during beta
                </p>
                <p style={{ fontSize: '0.875rem', color: C.gray, margin: 0 }}>
                  New users set up automatically after Google login
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}` }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '1.75rem 2.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.black }}>
              Draftr
            </span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.muted }}>
              by @uxabhi_
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link href="/login" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.muted, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.black)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >
              Sign in
            </Link>
            <Link href="/login" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.black, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.blue)}
              onMouseLeave={e => (e.currentTarget.style.color = C.black)}
            >
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FeatureBox({ index, title, desc, noRight }: { index: string; title: string; desc: string; noRight?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRight: noRight ? 'none' : `1px solid ${C.border}`,
        borderTop: `1px solid ${C.border}`,
        padding: '2rem',
        background: hov ? 'rgba(19,81,170,0.03)' : 'transparent',
        transition: 'background 0.25s linear',
        cursor: 'default',
      }}
    >
      <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: C.muted, fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: '1.25rem' }}>
        {index}
      </span>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: C.black, letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 0.6rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: C.muted, lineHeight: 1.6, margin: 0 }}>
        {desc}
      </p>
    </div>
  )
}

function WhyItem({ index, title, desc }: { index: string; title: string; desc: string }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderTop: `1px solid ${C.border}`,
        padding: '1.75rem 0',
        display: 'grid',
        gridTemplateColumns: '3rem 1fr 2fr',
        gap: '1.5rem',
        alignItems: 'start',
        cursor: 'default',
      }}
    >
      <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: C.muted, fontWeight: 600, letterSpacing: '0.05em', paddingTop: '0.25rem' }}>
        {index}
      </span>
      <h3 style={{
        fontSize: 'clamp(1.25rem, 2.5vw, 2rem)',
        fontWeight: 800,
        color: hov ? C.blue : C.black,
        letterSpacing: '-0.025em',
        lineHeight: 1.05,
        margin: 0,
        transition: 'color 0.25s linear',
      }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.9375rem', color: C.muted, lineHeight: 1.6, margin: 0 }}>
        {desc}
      </p>
    </div>
  )
}
