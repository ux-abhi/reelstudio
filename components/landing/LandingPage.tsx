'use client'
import { useState } from 'react'
import Link from 'next/link'

// ── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  bg:     '#E3E2DE',
  blue:   '#1351AA',
  black:  '#141414',
  gray:   '#444343',
  muted:  '#7A7A7A',
  border: '#C7C7C7',
}

const T = {
  hero:    { fontSize: 'clamp(3.5rem, 9vw, 9.5rem)', fontWeight: 900, lineHeight: 0.85, letterSpacing: '-0.04em' },
  section: { fontSize: 'clamp(2.5rem, 5.5vw, 6rem)', fontWeight: 800, lineHeight: 0.88, letterSpacing: '-0.03em' },
  label:   { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: C.muted },
  body:    { fontSize: '1.0625rem', fontWeight: 400, lineHeight: 1.6, color: C.gray },
  mono:    { fontFamily: 'monospace', fontSize: '0.75rem', color: C.muted, fontWeight: 500, letterSpacing: '0.05em' },
}

// ── Grid helpers ──────────────────────────────────────────────────────────────

function Grid({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gap: 0,
      ...style,
    }}>
      {children}
    </div>
  )
}

function SidebarLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      gridColumn: '1 / 4',
      borderRight: `1px solid ${C.border}`,
      padding: '2rem 2rem 2rem 0',
      display: 'flex',
      alignItems: 'flex-start',
      paddingTop: '2.5rem',
    }}>
      <span style={T.label}>{children}</span>
    </div>
  )
}

function Content({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ gridColumn: '4 / 13', padding: '2.5rem 0 2.5rem 3rem', ...style }}>
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ borderTop: `1px solid ${C.border}` }} />
}

// ── Buttons ───────────────────────────────────────────────────────────────────

function PosterButton({
  children, href, variant = 'blue', style,
}: {
  children: React.ReactNode
  href: string
  variant?: 'blue' | 'black'
  style?: React.CSSProperties
}) {
  const [hovered, setHovered] = useState(false)
  const base = variant === 'blue' ? C.blue : C.black
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-block',
        padding: '14px 32px',
        background: hovered ? C.black : base,
        color: C.bg,
        fontSize: '0.8125rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        borderRadius: 0,
        transition: 'background 0.3s linear',
        fontFamily: 'inherit',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </Link>
  )
}

// ── Feature card ──────────────────────────────────────────────────────────────

function FeatureCard({ index, title, desc }: { index: string; title: string; desc: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${C.border}`,
        padding: '2rem 1.75rem',
        background: hovered ? 'rgba(19,81,170,0.04)' : 'transparent',
        transition: 'background 0.3s linear',
        cursor: 'default',
      }}
    >
      <span style={{ ...T.mono, display: 'block', marginBottom: '1.25rem' }}>{index}</span>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: C.black,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
        marginBottom: '0.75rem',
      }}>
        {title}
      </h3>
      <p style={{ ...T.body, fontSize: '0.9375rem', lineHeight: 1.55 }}>{desc}</p>
    </div>
  )
}

// ── List item (Why Different) ─────────────────────────────────────────────────

function ListItem({ index, title, desc }: { index: string; title: string; desc: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderTop: `1px solid ${C.border}`,
        padding: '2rem 0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '2rem',
        cursor: 'default',
      }}
    >
      <span style={{ ...T.mono, width: 36, flexShrink: 0, paddingTop: '0.5rem' }}>{index}</span>
      <div style={{ flex: 1 }}>
        <h3 style={{
          fontSize: 'clamp(1.75rem, 3.5vw, 3rem)',
          fontWeight: 800,
          color: hovered ? C.blue : C.black,
          letterSpacing: '-0.025em',
          lineHeight: 1,
          marginBottom: '0.5rem',
          transition: 'color 0.3s linear',
        }}>
          {title}
        </h3>
        <p style={{ ...T.body, fontSize: '0.9375rem', maxWidth: 560 }}>{desc}</p>
      </div>
    </div>
  )
}

// ── Step item (How It Works) ──────────────────────────────────────────────────

function StepItem({ index, title, desc }: { index: string; title: string; desc: string }) {
  return (
    <div style={{
      borderTop: `1px solid ${C.border}`,
      padding: '1.75rem 0',
      display: 'grid',
      gridTemplateColumns: '3rem 1fr 2fr',
      gap: '1.5rem',
      alignItems: 'start',
    }}>
      <span style={T.mono}>{index}</span>
      <h4 style={{
        fontSize: '1.0625rem',
        fontWeight: 700,
        color: C.black,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      }}>
        {title}
      </h4>
      <p style={{ ...T.body, fontSize: '0.9375rem', lineHeight: 1.55 }}>{desc}</p>
    </div>
  )
}

// ── Main landing page ─────────────────────────────────────────────────────────

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div style={{
      background: C.bg,
      color: C.black,
      fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 72,
        background: `${C.bg}f2`,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 2.5rem',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <span style={{
          fontSize: '0.8125rem',
          fontWeight: 800,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: C.black,
        }}>
          Draftr
        </span>

        {/* Nav right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/login" style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: C.muted,
            textDecoration: 'none',
            letterSpacing: '0.04em',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = C.black)}
            onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
          >
            Sign in
          </Link>
          <PosterButton href="/onboarding" variant="blue" style={{ padding: '10px 22px', fontSize: '0.75rem' }}>
            Get Started
          </PosterButton>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ borderBottom: `1px solid ${C.border}`, minHeight: '88vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Grid>
          {/* Sidebar */}
          <div style={{
            gridColumn: '1 / 4',
            borderRight: `1px solid ${C.border}`,
            padding: '3rem 2rem 3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: '1.25rem',
            minHeight: '60vh',
          }}>
            {/* Black square marker */}
            <div style={{ width: 14, height: 14, background: C.black, flexShrink: 0 }} />
            <div>
              <p style={T.label}>For Creators</p>
              <p style={{ ...T.label, marginTop: '0.35rem', color: C.border }}>Instagram × LinkedIn</p>
            </div>
          </div>

          {/* Main headline */}
          <div style={{
            gridColumn: '4 / 13',
            padding: '5rem 2.5rem 4rem 3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '3rem',
          }}>
            <div>
              <h1 style={{ ...T.hero, color: C.black, margin: 0 }}>
                YOUR REAL<br />
                WORK IS YOUR<br />
                BEST{' '}
                <span style={{ color: C.blue }}>CONTENT.</span>
              </h1>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '400px 1fr',
              gap: '3rem',
              alignItems: 'end',
            }}>
              <p style={{ ...T.body, fontSize: '1.0625rem', margin: 0 }}>
                Draftr scans your actual Instagram account, analyses what&apos;s working,
                and turns real things that happened to you this week into scripts for
                Instagram Reels and LinkedIn posts — in your voice, not AI voice.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <PosterButton href="/onboarding" variant="blue">
                  Get Started Free →
                </PosterButton>
                <Link href="/login" style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: C.gray,
                  textDecoration: 'underline',
                  textUnderlineOffset: 4,
                  letterSpacing: '0.02em',
                }}>
                  Already have an account ↗
                </Link>
              </div>
            </div>
          </div>
        </Grid>
      </section>

      {/* ── SYSTEM ── */}
      <section style={{ borderBottom: `1px solid ${C.border}` }}>
        <Grid>
          <SidebarLabel>The System</SidebarLabel>
          <Content>
            <h2 style={{ ...T.section, color: C.black, marginBottom: '3rem' }}>
              SCAN.<br />LOG.<br />CREATE.
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
              <FeatureCard
                index="01"
                title="Account Scan"
                desc="We scrape your last 30 posts via Apify. Analyse your real engagement rates, top hooks, best formats, trending keywords in your niche, and hashtag performance. Your strategy is built on actual data — not guesswork."
              />
              <FeatureCard
                index="02"
                title="Life Log"
                desc="Dump what happened today or this week in plain text. Draftr extracts the most content-worthy moments and generates Instagram Reels scripts and LinkedIn posts from your real experiences — not made-up AI ideas."
              />
              <FeatureCard
                index="03"
                title="Studio"
                desc="Write, rewrite, and hook any content idea. Format selector (Reel / Carousel / Talking Head), tone controls, section-level regen. Every output is calibrated to your content pillars and proven formats."
              />
            </div>
          </Content>
        </Grid>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ borderBottom: `1px solid ${C.border}` }}>
        <Grid>
          <SidebarLabel>How It Works</SidebarLabel>
          <Content>
            <h2 style={{ ...T.section, color: C.black, marginBottom: '2.5rem' }}>
              FOUR<br />STEPS.
            </h2>
            <div>
              <StepItem
                index="01"
                title="Connect Your Instagram"
                desc="Paste your handle. We scrape your profile and top 30 posts using Apify. Takes about 60 seconds — then your full content strategy is built from real data."
              />
              <StepItem
                index="02"
                title="Tell Us What Happened"
                desc="Open Life Log. Type rough notes about your week — what you shipped, learned, struggled with. No structure needed. Just dump it."
              />
              <StepItem
                index="03"
                title="Pick Your Platform"
                desc="Switch between Instagram and LinkedIn. Get Reel scripts, Carousel breakdowns, and Talking Head outlines for Instagram — and story, insight, or progress posts for LinkedIn."
              />
              <StepItem
                index="04"
                title="Save and Ship"
                desc="Every script saved to your board. LinkedIn posts include an AI image prompt ready for DALL-E 3 or Midjourney. Your 30-day calendar is already planned."
              />
            </div>
          </Content>
        </Grid>
      </section>

      {/* ── WHY DIFFERENT ── */}
      <section style={{ borderBottom: `1px solid ${C.border}` }}>
        <Grid>
          <SidebarLabel>Why Different</SidebarLabel>
          <Content>
            <h2 style={{ ...T.section, color: C.black, marginBottom: '2rem' }}>
              NOT<br />ANOTHER<br />AI TOOL.
            </h2>
            <div>
              <ListItem
                index="001"
                title="Built on Your Real Data"
                desc="Not templates. Not &quot;best practices&quot;. Your actual post history, your actual hooks, your actual audience engagement patterns."
              />
              <ListItem
                index="002"
                title="Both Platforms, One Input"
                desc="Life Log generates Instagram Reels and LinkedIn posts from the same life story. One input, two platform-native outputs."
              />
              <ListItem
                index="003"
                title="Your Voice, Not AI Voice"
                desc="System prompts are calibrated to your niche, your proven hook styles, and your brand tone. The output should sound like you — because it starts with you."
              />
              <ListItem
                index="004"
                title="Image Prompts Included"
                desc="Every LinkedIn post comes with a ready-to-paste image generation prompt for DALL-E 3, Midjourney v6, or Ideogram. Editorial, professional, not stock-photo."
              />
            </div>
          </Content>
        </Grid>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section style={{ borderBottom: `1px solid ${C.border}` }}>
        <Grid>
          <SidebarLabel>Everything</SidebarLabel>
          <Content>
            <h2 style={{ ...T.section, color: C.black, marginBottom: '2.5rem' }}>
              INSIDE<br />DRAFTR.
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 0,
            }}>
              {[
                ['Account Audit', 'Engagement rate, hook strength, bio score, top formats — from your real post history.'],
                ['Content Pillars', '5 AI-inferred pillars from your actual posts. Not generic. Based on what you already create.'],
                ['30-Day Calendar', 'Real dates, real hooks, real posting times — tuned to your cadence goal and trending topics.'],
                ['Ideas Bank', '10–15 content ideas ranked by trend score, each with a hook suggestion and urgency rating.'],
                ['Trigger Words', 'Comment triggers tailored to your niche. &quot;Comment X and I&apos;ll DM you&quot; — set up for ManyChat.'],
                ['Competitor Analysis', 'Paste any Instagram handle. Get their strategy, gaps they leave open, and hooks you can adapt.'],
              ].map(([title, desc], i) => (
                <div key={i} style={{
                  borderTop: `1px solid ${C.border}`,
                  borderRight: i % 2 === 0 ? `1px solid ${C.border}` : 'none',
                  padding: '1.75rem 2rem 1.75rem 0',
                  paddingLeft: i % 2 === 1 ? '2rem' : 0,
                }}>
                  <p style={{ ...T.label, marginBottom: '0.5rem', color: C.blue }}>{title}</p>
                  <p style={{ ...T.body, fontSize: '0.9375rem' }}>{desc}</p>
                </div>
              ))}
            </div>
          </Content>
        </Grid>
      </section>

      {/* ── ACCESS / CTA ── */}
      <section style={{ minHeight: '55vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Grid style={{ minHeight: '55vh' }}>
          <SidebarLabel>Access</SidebarLabel>
          <Content style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            paddingTop: '4rem',
            paddingBottom: '4rem',
          }}>
            <div>
              <h2 style={{ ...T.hero, fontSize: 'clamp(3rem, 7vw, 7.5rem)', color: C.black, marginBottom: '1.5rem' }}>
                START CREATING<br />
                FROM WHAT<br />
                <span style={{ color: C.blue }}>ACTUALLY</span><br />
                HAPPENED.
              </h2>
              <p style={{ ...T.body, maxWidth: 480, marginBottom: '2.5rem' }}>
                No generic templates. No made-up content ideas.
                Just your real work, your real week, turned into
                real content that sounds like you.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <PosterButton href="/onboarding" variant="black" style={{ padding: '18px 40px', fontSize: '0.875rem' }}>
                Get Started Free →
              </PosterButton>
              <div>
                <p style={{ ...T.label, color: C.muted, marginBottom: '0.2rem' }}>Early access</p>
                <p style={{ fontSize: '0.875rem', color: C.gray }}>Free while we&apos;re building</p>
              </div>
            </div>
          </Content>
        </Grid>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: '1.75rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ ...T.label, color: C.muted }}>Draftr — by @uxabhi_</span>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/login" style={{ ...T.label, color: C.muted, textDecoration: 'none' }}>Sign in</Link>
          <Link href="/onboarding" style={{ ...T.label, color: C.black, textDecoration: 'none' }}>Get Started</Link>
        </div>
      </footer>
    </div>
  )
}
