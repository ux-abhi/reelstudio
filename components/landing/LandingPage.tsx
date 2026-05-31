'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// ── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  bg:        '#E3E2DE',
  bgCard:    '#FFFFFF',
  blue:      '#1351AA',
  black:     '#141414',
  gray:      '#444343',
  muted:     '#7A7A7A',
  border:    '#C7C7C7',
  borderDk:  '#AEADAA',
}

// ── Animation hook ────────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}

// spring-like ease-out — same cubic as Framer Motion's default
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

function fu(inView: boolean, delay = 0, dist = 28): React.CSSProperties {
  return {
    opacity:    inView ? 1 : 0,
    transform:  inView ? 'none' : `translateY(${dist}px)`,
    transition: `opacity 0.8s ${EASE} ${delay}s, transform 0.8s ${EASE} ${delay}s`,
  }
}

// ── Counter hook (animates numbers on enter) ──────────────────────────────────

function useCounter(target: number, inView: boolean, duration = 1400) {
  const [val, setVal] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 4) // ease-out-quart
      setVal(Math.round(eased * target))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [inView, target, duration])

  return val
}

// ── Primitives ────────────────────────────────────────────────────────────────

function Label({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: color ?? C.muted, margin: 0 }}>
      {children}
    </p>
  )
}

function Btn({ href, children, dark }: { href: string; children: React.ReactNode; dark?: boolean }) {
  const [hov, setHov] = useState(false)
  const base = dark ? C.black : C.blue
  return (
    <Link href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '14px 30px',
        background: hov ? (dark ? C.blue : C.black) : base,
        color: C.bg,
        fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        textDecoration: 'none', transition: 'background 0.3s linear, transform 0.15s ease',
        fontFamily: 'inherit', whiteSpace: 'nowrap',
        transform: hov ? 'translateY(-1px)' : 'none',
      }}
    >
      {children}
    </Link>
  )
}

// ── Stat card with counter ────────────────────────────────────────────────────

function StatCard({ num, label, inView, delay }: { num: string; label: string; inView: boolean; delay: number }) {
  const isNumeric = /^\d+$/.test(num.replace(/[^0-9]/g, ''))
  const target    = isNumeric ? parseInt(num.replace(/[^0-9]/g, ''), 10) : 0
  const counted   = useCounter(target, inView && isNumeric, 1200)
  const display   = isNumeric ? num.replace(/\d+/, String(counted)) : num

  return (
    <div style={{ ...fu(inView, delay) }}>
      <p style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 900, color: C.blue, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 0.3rem', fontVariantNumeric: 'tabular-nums' }}>
        {display}
      </p>
      <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0, lineHeight: 1.4 }}>{label}</p>
    </div>
  )
}

// ── Feature box ───────────────────────────────────────────────────────────────

function FeatureBox({ index, title, desc, noRight, inView, delay }: {
  index: string; title: string; desc: string; noRight?: boolean; inView: boolean; delay: number
}) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRight: noRight ? 'none' : `1px solid ${C.border}`,
        borderTop: `1px solid ${C.border}`,
        padding: '2rem',
        background: hov ? 'rgba(19,81,170,0.035)' : 'transparent',
        transition: 'background 0.3s linear',
        cursor: 'default',
        ...fu(inView, delay),
      }}
    >
      <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: hov ? C.blue : C.muted, fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: '1.25rem', transition: 'color 0.3s' }}>
        {index}
      </span>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: C.black, letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 0.6rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: C.muted, lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  )
}

// ── Why item ──────────────────────────────────────────────────────────────────

function WhyItem({ index, title, desc, inView, delay }: {
  index: string; title: string; desc: string; inView: boolean; delay: number
}) {
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
        ...fu(inView, delay),
      }}
    >
      <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: C.muted, fontWeight: 600, letterSpacing: '0.05em', paddingTop: '0.25rem' }}>
        {index}
      </span>
      <h3 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', fontWeight: 800, color: hov ? C.blue : C.black, letterSpacing: '-0.025em', lineHeight: 1.05, margin: 0, transition: `color 0.3s ${EASE}` }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.9375rem', color: C.muted, lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  )
}

// ── Step row ──────────────────────────────────────────────────────────────────

function StepRow({ num, title, body, tag, last, inView, delay }: {
  num: string; title: string; body: string; tag: string; last?: boolean; inView: boolean; delay: number
}) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '200px 1fr',
      borderBottom: last ? 'none' : `1px solid ${C.border}`,
      ...fu(inView, delay),
    }}>
      <div style={{ borderRight: `1px solid ${C.border}`, padding: '2.5rem 2rem 2.5rem 0', display: 'flex', alignItems: 'flex-start' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: C.muted, fontWeight: 600, letterSpacing: '0.05em' }}>{num}</span>
      </div>
      <div style={{ padding: '2.5rem 0 2.5rem 3rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '3rem' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)', fontWeight: 800, color: C.black, letterSpacing: '-0.025em', lineHeight: 1.05, margin: '0 0 0.75rem' }}>
            {title}
          </h3>
          <p style={{ fontSize: '1rem', color: C.gray, lineHeight: 1.6, margin: 0, maxWidth: 520 }}>{body}</p>
        </div>
        <div style={{ flexShrink: 0, padding: '0.4rem 1rem', border: `1px solid ${C.border}`, fontSize: '0.75rem', fontWeight: 600, color: C.muted, whiteSpace: 'nowrap' }}>
          {tag}
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function LandingPage() {
  const statsRef  = useInView()
  const howRef    = useInView(0.08)
  const platformRef = useInView(0.1)
  const featRef   = useInView(0.06)
  const whyRef    = useInView(0.1)
  const ctaRef    = useInView(0.15)

  return (
    <div style={{
      background: C.bg,
      color: C.black,
      fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      minHeight: '100vh',
    }}>
      <style>{`
        html { scroll-behavior: smooth; }

        /* Marquee */
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .dft-marquee { animation: marquee 20s linear infinite; }
        .dft-marquee:hover { animation-play-state: paused; }

        /* Hero entrance — each line animates in with stagger */
        @keyframes heroLine {
          from { opacity: 0; transform: translateY(32px) skewY(1deg); }
          to   { opacity: 1; transform: none; }
        }
        .hero-l1 { animation: heroLine 0.9s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .hero-l2 { animation: heroLine 0.9s cubic-bezier(0.16,1,0.3,1) 0.18s both; }
        .hero-l3 { animation: heroLine 0.9s cubic-bezier(0.16,1,0.3,1) 0.31s both; }
        .hero-l4 { animation: heroLine 0.9s cubic-bezier(0.16,1,0.3,1) 0.44s both; }

        @keyframes heroPop {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: none; }
        }
        .hero-sub  { animation: heroPop 0.8s cubic-bezier(0.16,1,0.3,1) 0.62s both; }
        .hero-cta  { animation: heroPop 0.8s cubic-bezier(0.16,1,0.3,1) 0.72s both; }
        .hero-stat { animation: heroPop 0.8s cubic-bezier(0.16,1,0.3,1) 0.84s both; }

        /* Cursor blink */
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .cursor { display: inline-block; width: 3px; height: 0.85em; background: #1351AA; margin-left: 4px; vertical-align: middle; animation: blink 1.1s step-end infinite; }

        /* Nav link underline slide-in */
        .nav-link { position: relative; }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 100%; height: 1.5px;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .nav-link:hover::after { transform: scaleX(1); }

        /* Platform row hover */
        .platform-row { transition: background 0.25s ease; }
        .platform-row:hover { background: rgba(19,81,170,0.03); }

        /* Dot grid on hero */
        .hero-grid {
          background-image: radial-gradient(circle, rgba(19,81,170,0.10) 1px, transparent 1px);
          background-size: 28px 28px;
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: `${C.bg}f2`, backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.border}`,
        height: 64, display: 'flex', alignItems: 'center',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.black }}>
            Draftr
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <a href="#how" className="nav-link" style={{ fontSize: '0.8125rem', fontWeight: 500, color: C.muted, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.black)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >How it works</a>
            <a href="#features" className="nav-link" style={{ fontSize: '0.8125rem', fontWeight: 500, color: C.muted, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.black)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >Features</a>
            <Link href="/login" className="nav-link" style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.black, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.blue)}
              onMouseLeave={e => (e.currentTarget.style.color = C.black)}
            >Sign in</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hero-grid" style={{ borderBottom: `1px solid ${C.border}`, minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '5rem 2.5rem 4rem' }}>

          <div className="hero-l1" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2.5rem' }}>
            <div style={{ width: 10, height: 10, background: C.blue, flexShrink: 0 }} />
            <Label color={C.blue}>For Instagram + LinkedIn Creators</Label>
          </div>

          <div style={{ overflow: 'hidden' }}>
            <h1 style={{ fontSize: 'clamp(3.5rem, 8.5vw, 9rem)', fontWeight: 900, lineHeight: 0.87, letterSpacing: '-0.04em', color: C.black, margin: '0 0 2.5rem', maxWidth: '900px' }}>
              <span className="hero-l1" style={{ display: 'block' }}>YOUR WEEK IS</span>
              <span className="hero-l2" style={{ display: 'block' }}>
                FULL OF{' '}
                <span style={{ color: C.blue }}>CONTENT.</span>
                <span className="cursor" />
              </span>
              <span className="hero-l3" style={{ display: 'block' }}>YOU&apos;RE JUST</span>
              <span className="hero-l4" style={{ display: 'block' }}>NOT POSTING IT.</span>
            </h1>
          </div>

          <div className="hero-cta" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2.5rem' }}>
            <p className="hero-sub" style={{ fontSize: '1.125rem', color: C.gray, lineHeight: 1.65, maxWidth: 480, margin: 0 }}>
              Draftr scans your real Instagram account, then turns what happened
              this week into platform-native scripts for Reels and LinkedIn posts —
              in your voice, built on your actual data.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Btn href="/login">Get Started Free →</Btn>
              <a href="#how" style={{ fontSize: '0.875rem', fontWeight: 600, color: C.gray, textDecoration: 'none', borderBottom: `1px solid ${C.borderDk}`, paddingBottom: 2 }}>
                See how it works ↓
              </a>
            </div>
          </div>

          {/* Stats */}
          <div ref={statsRef.ref} className="hero-stat" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginTop: '4rem', borderTop: `1px solid ${C.border}` }}>
            {([
              ['2',    'Platforms — Instagram + LinkedIn'],
              ['60',   'Seconds to scan your account'],
              ['3',    'Posts per week, auto-planned'],
              ['100',  'Percent based on your real data'],
            ] as [string, string][]).map(([num, label], i) => (
              <div key={i} style={{ padding: '1.5rem 0', borderRight: i < 3 ? `1px solid ${C.border}` : 'none', paddingRight: i < 3 ? '2rem' : 0, paddingLeft: i > 0 ? '2rem' : 0 }}>
                <StatCard num={num} label={label} inView={statsRef.inView} delay={i * 0.08} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────── */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: '0.875rem 0', overflow: 'hidden', background: C.black }}>
        <div className="dft-marquee" style={{ display: 'flex', width: 'max-content' }}>
          {[...Array(2)].map((_, rep) => (
            <div key={rep} style={{ display: 'flex', alignItems: 'center' }}>
              {['REEL SCRIPTS','LINKEDIN POSTS','CAROUSEL DECKS','HOOK LINES','IMAGE PROMPTS','CAPTION COPY','CONTENT CALENDAR','TRIGGER WORDS','ACCOUNT AUDIT','COMPETITOR ANALYSIS','TALKING HEAD','LIFE LOG →'].map((item, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: item === 'LIFE LOG →' ? C.blue : '#E3E2DE', padding: '0 2rem', whiteSpace: 'nowrap' }}>
                    {item}
                  </span>
                  <span style={{ color: C.muted, fontSize: '0.45rem' }}>◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div ref={howRef.ref} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: `1px solid ${C.border}`, ...fu(howRef.inView, 0) }}>
            <div style={{ borderRight: `1px solid ${C.border}`, padding: '2.5rem 2rem 2.5rem 0' }}><Label>How it works</Label></div>
            <div style={{ padding: '2.5rem 0 2.5rem 3rem' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 4.5rem)', fontWeight: 800, color: C.black, letterSpacing: '-0.03em', lineHeight: 0.9, margin: 0 }}>
                THREE STEPS.<br /><span style={{ color: C.blue }}>ZERO TEMPLATES.</span>
              </h2>
            </div>
          </div>
          <StepRow num="01" title="Scan your Instagram" body="Connect your handle. We scrape your last 30 posts via Apify — real engagement rates, top hooks, best formats, trending hashtags. Everything built from what you've actually posted." tag="Takes 60 seconds" inView={howRef.inView} delay={0.1} />
          <StepRow num="02" title="Log what happened" body="Open Life Log. Dump your week in rough notes — what you shipped, learnt, struggled with, figured out. No structure required. Just what happened." tag="Freeform. Messy is fine." inView={howRef.inView} delay={0.2} />
          <StepRow num="03" title="Get your drafts" body="Draftr generates Instagram Reel scripts, carousel breakdowns, and LinkedIn posts from your actual story. Each LinkedIn post includes an AI image prompt for DALL-E or Midjourney." tag="Platform-native. In your voice." last inView={howRef.inView} delay={0.3} />
        </div>
      </section>

      {/* ── TWO PLATFORMS ────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${C.border}` }}>
        <div ref={platformRef.ref} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: `1px solid ${C.border}`, ...fu(platformRef.inView, 0) }}>
            <div style={{ borderRight: `1px solid ${C.border}`, padding: '2.5rem 2rem 2.5rem 0' }}><Label>Output</Label></div>
            <div style={{ padding: '2.5rem 0 2.5rem 3rem' }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3.5rem)', fontWeight: 800, color: C.black, letterSpacing: '-0.03em', lineHeight: 0.95, margin: 0 }}>
                ONE INPUT.<br />TWO PLATFORMS.
              </h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', borderBottom: 'none' }}>
            <div style={{ borderRight: `1px solid ${C.border}` }} />

            {/* Instagram column */}
            <div style={{ borderRight: `1px solid ${C.border}`, padding: '2.5rem 2.5rem 2.5rem 0', paddingLeft: '0', marginLeft: '3rem', ...fu(platformRef.inView, 0.1) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
                <div style={{ width: 8, height: 8, background: C.blue }} />
                <Label color={C.blue}>Instagram</Label>
              </div>
              {[
                ['Reel Script', 'Hook + body + CTA for maximum watch time'],
                ['Carousel Deck', 'Slide-by-slide with hook slide + CTA'],
                ['Talking Head', 'Conversational direct-to-camera script'],
                ['Caption Copy', 'First-2-lines hook + trigger word + hashtags'],
                ['Hook Variants', '3 A/B hooks — curiosity, interrupt, result-first'],
              ].map(([t, d], i) => (
                <div key={i} className="platform-row" style={{ padding: '0.875rem 0', borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.black, margin: '0 0 0.15rem' }}>{t}</p>
                  <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0, lineHeight: 1.5 }}>{d}</p>
                </div>
              ))}
            </div>

            {/* LinkedIn column */}
            <div style={{ padding: '2.5rem 0 2.5rem 2.5rem', ...fu(platformRef.inView, 0.2) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
                <div style={{ width: 8, height: 8, border: `2px solid ${C.blue}` }} />
                <Label color={C.blue}>LinkedIn</Label>
              </div>
              {[
                ['Story Post', 'Narrative — what happened, learnt, what it means'],
                ['Insight Post', 'Sharp professional insight, built for engagement'],
                ['Progress Post', 'Milestone, build log, or honest reflection'],
                ['Image Prompt', 'AI image prompt for DALL-E 3 or Midjourney — every post'],
                ['Hashtags', '3–5 relevant professional hashtags, never stuffed'],
              ].map(([t, d], i) => (
                <div key={i} className="platform-row" style={{ padding: '0.875rem 0', borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.black, margin: '0 0 0.15rem' }}>{t}</p>
                  <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0, lineHeight: 1.5 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div ref={featRef.ref} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: `1px solid ${C.border}`, ...fu(featRef.inView, 0) }}>
            <div style={{ borderRight: `1px solid ${C.border}`, padding: '2.5rem 2rem 2.5rem 0' }}><Label>The system</Label></div>
            <div style={{ padding: '2.5rem 0 2.5rem 3rem' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 800, color: C.black, letterSpacing: '-0.03em', lineHeight: 0.92, margin: 0 }}>
                EVERYTHING<br />INSIDE DRAFTR.
              </h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {[
              { i: '01', title: 'Account Scan',       desc: 'Real Instagram data via Apify — 30 posts, engagement analysis, hook strength, top formats, niche hashtags.' },
              { i: '02', title: 'Life Log',            desc: 'Dump your week in plain text. Get Instagram scripts and LinkedIn posts built from your actual story.' },
              { i: '03', title: 'Studio',              desc: 'Write, rewrite, and hook any idea. Section-level regen, tone controls, 5 hook types, A/B variants.' },
              { i: '04', title: '30-Day Calendar',     desc: 'Real dates, AI-generated hooks, posting times — tuned to your cadence and trending keywords.' },
              { i: '05', title: 'Competitor Analysis', desc: 'Analyse any public Instagram account. Get their strategy, gaps they leave, and hooks you can adapt.' },
              { i: '06', title: 'Hooks + Triggers',    desc: 'AI-generated hooks by type and comment trigger words ("Comment X for Y") tailored to your niche.' },
            ].map(({ i, title, desc }, idx) => (
              <FeatureBox key={i} index={i} title={title} desc={desc} noRight={idx % 3 === 2} inView={featRef.inView} delay={0.05 + (idx % 3) * 0.08 + Math.floor(idx / 3) * 0.15} />
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY DRAFTR ───────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${C.border}` }}>
        <div ref={whyRef.ref} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: `1px solid ${C.border}`, ...fu(whyRef.inView, 0) }}>
            <div style={{ borderRight: `1px solid ${C.border}`, padding: '2.5rem 2rem 2.5rem 0' }}><Label>Why Draftr</Label></div>
            <div style={{ padding: '2.5rem 0 2.5rem 3rem' }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3.5rem)', fontWeight: 800, color: C.black, letterSpacing: '-0.03em', lineHeight: 0.95, margin: 0 }}>
                NOT ANOTHER<br />AI CONTENT TOOL.
              </h2>
            </div>
          </div>
          <WhyItem index="01" title="Built on your real data"    desc="Not templates. Your actual post history, hooks, and audience engagement — Apify-scraped on demand. Every recommendation references your real numbers." inView={whyRef.inView} delay={0.05} />
          <WhyItem index="02" title="Your voice, not AI voice"   desc="Every output is calibrated to your niche, your proven hook styles, and your brand tone. It sounds like you because it starts with you." inView={whyRef.inView} delay={0.15} />
          <WhyItem index="03" title="Both platforms, one input"  desc="Life Log takes one story and generates Instagram scripts AND LinkedIn posts simultaneously — platform-native formatting, not copy-pasted content." inView={whyRef.inView} delay={0.25} />
          <WhyItem index="04" title="Image prompts included"     desc="Every LinkedIn post includes a ready-to-paste image prompt for DALL-E 3, Midjourney v6, or Ideogram. Editorial. Professional. Never stock photo cliché." inView={whyRef.inView} delay={0.35} />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div ref={ctaRef.ref} style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '5rem 2.5rem' }}>
          <div style={{ maxWidth: 800, ...fu(ctaRef.inView, 0) }}>
            <Label color={C.blue}>Early Access · Free</Label>
            <h2 style={{ fontSize: 'clamp(3rem, 7vw, 7.5rem)', fontWeight: 900, color: C.black, letterSpacing: '-0.04em', lineHeight: 0.87, margin: '1rem 0 2rem', ...fu(ctaRef.inView, 0.1) }}>
              START WITH<br />YOUR REAL<br /><span style={{ color: C.blue }}>WEEK.</span>
            </h2>
            <p style={{ fontSize: '1.125rem', color: C.gray, lineHeight: 1.65, maxWidth: 480, margin: '0 0 2.5rem', ...fu(ctaRef.inView, 0.2) }}>
              No templates. No made-up ideas. Just your real work turned into posts that sound like you — free while we&apos;re building.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', ...fu(ctaRef.inView, 0.3) }}>
              <Btn href="/login" dark>Get Started Free →</Btn>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, margin: '0 0 0.2rem' }}>Free during beta</p>
                <p style={{ fontSize: '0.875rem', color: C.gray, margin: 0 }}>New users set up automatically after Google login</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.75rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.black }}>Draftr</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.muted }}>by @uxabhi_</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link href="/login" className="nav-link" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.muted, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.black)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >Sign in</Link>
            <Link href="/login" className="nav-link" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.black, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.blue)}
              onMouseLeave={e => (e.currentTarget.style.color = C.black)}
            >Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
