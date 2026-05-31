'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  bg:      '#E3E2DE',
  blue:    '#1351AA',
  black:   '#141414',
  gray:    '#444343',
  muted:   '#7A7A7A',
  border:  '#C7C7C7',
  borderDk:'#AEADAA',
}

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref    = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function useCounter(target: number, inView: boolean, duration = 1200) {
  const [val, setVal] = useState(0)
  const raf = useRef<number>(0)
  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const tick = (now: number) => {
      const t      = Math.min((now - start) / duration, 1)
      const eased  = 1 - Math.pow(1 - t, 4)
      setVal(Math.round(eased * target))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [inView, target, duration])
  return val
}

// ── Animation helper ──────────────────────────────────────────────────────────

function fu(inView: boolean, delay = 0, dist = 26): React.CSSProperties {
  return {
    opacity:   inView ? 1 : 0,
    transform: inView ? 'none' : `translateY(${dist}px)`,
    transition:`opacity 0.8s ${EASE} ${delay}s, transform 0.8s ${EASE} ${delay}s`,
  }
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
  return (
    <Link href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '14px 30px',
        background: hov ? (dark ? C.blue : C.black) : (dark ? C.black : C.blue),
        color: C.bg, fontSize: '0.8125rem', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        textDecoration: 'none', fontFamily: 'inherit', whiteSpace: 'nowrap',
        transition: 'background 0.3s linear, transform 0.15s ease',
        transform: hov ? 'translateY(-1px)' : 'none',
      }}
    >
      {children}
    </Link>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ raw, suffix, label, inView, delay }: {
  raw: number; suffix?: string; label: string; inView: boolean; delay: number
}) {
  const counted = useCounter(raw, inView, 1100)
  return (
    <div style={fu(inView, delay)}>
      <p style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)', fontWeight: 900, color: C.blue, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 0.3rem', fontVariantNumeric: 'tabular-nums' }}>
        {counted}{suffix ?? ''}
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
  // Wrap in animation div so fu() transition doesn't conflict with hover transition
  return (
    <div style={fu(inView, delay)} className={noRight ? '' : 'feat-border-r'}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className="feat-box"
        style={{ height: '100%', padding: '2rem', background: hov ? 'rgba(19,81,170,0.04)' : 'transparent', transition: 'background 0.3s linear', cursor: 'default' }}
      >
        <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: hov ? C.blue : C.muted, fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: '1.25rem', transition: 'color 0.3s' }}>
          {index}
        </span>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: C.black, letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 0.6rem' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.875rem', color: C.muted, lineHeight: 1.6, margin: 0 }}>{desc}</p>
      </div>
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
      className="why-item"
      style={{ borderTop: `1px solid ${C.border}`, padding: '1.75rem 0', cursor: 'default', ...fu(inView, delay) }}
    >
      <span className="why-idx" style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: C.muted, fontWeight: 600, letterSpacing: '0.05em', paddingTop: '0.25rem' }}>
        {index}
      </span>
      <h3 className="why-title" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', fontWeight: 800, color: hov ? C.blue : C.black, letterSpacing: '-0.025em', lineHeight: 1.05, margin: 0, transition: `color 0.3s ${EASE}` }}>
        {title}
      </h3>
      <p className="why-desc" style={{ fontSize: '0.9375rem', color: C.muted, lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  )
}

// ── Step row ──────────────────────────────────────────────────────────────────

function StepRow({ num, title, body, tag, last, inView, delay }: {
  num: string; title: string; body: string; tag: string; last?: boolean; inView: boolean; delay: number
}) {
  return (
    <div className="step-row" style={{ borderBottom: last ? 'none' : `1px solid ${C.border}`, ...fu(inView, delay) }}>
      <div className="step-num" style={{ borderRight: `1px solid ${C.border}`, padding: '2.5rem 2rem 2.5rem 0', display: 'flex', alignItems: 'flex-start' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: C.muted, fontWeight: 600, letterSpacing: '0.05em' }}>{num}</span>
      </div>
      <div className="step-content" style={{ padding: '2.5rem 0 2.5rem 3rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 2.25rem)', fontWeight: 800, color: C.black, letterSpacing: '-0.025em', lineHeight: 1.05, margin: '0 0 0.75rem' }}>
            {title}
          </h3>
          <p style={{ fontSize: '1rem', color: C.gray, lineHeight: 1.6, margin: 0 }}>{body}</p>
        </div>
        <div className="step-tag" style={{ flexShrink: 0, padding: '0.4rem 0.875rem', border: `1px solid ${C.border}`, fontSize: '0.75rem', fontWeight: 600, color: C.muted, whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>
          {tag}
        </div>
      </div>
    </div>
  )
}

// ── Section grid wrapper ──────────────────────────────────────────────────────

function SectionGrid({ label, children, id }: { label: string; children: React.ReactNode; id?: string }) {
  return (
    <div className="sec-grid" id={id}>
      <div className="sec-label" style={{ borderRight: `1px solid ${C.border}`, padding: '2.5rem 2rem 2.5rem 0' }}>
        <Label>{label}</Label>
      </div>
      <div className="sec-content" style={{ padding: '2.5rem 0 2.5rem 3rem' }}>
        {children}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function LandingPage() {
  const statsRef    = useInView()
  const howRef      = useInView(0.08)
  const platformRef = useInView(0.1)
  const featRef     = useInView(0.06)
  const whyRef      = useInView(0.1)
  const ctaRef      = useInView(0.12)

  return (
    <div style={{ background: C.bg, color: C.black, fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif", minHeight: '100vh' }}>
      <style>{`
        html { scroll-behavior: smooth; }

        /* ── Marquee ── */
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .dft-marquee { animation: marquee 20s linear infinite; }
        .dft-marquee:hover { animation-play-state: paused; }

        /* ── Hero entrance ── */
        @keyframes heroLine {
          from { opacity: 0; transform: translateY(32px) skewY(1.2deg); }
          to   { opacity: 1; transform: none; }
        }
        .hl1 { animation: heroLine 0.9s ${EASE} 0.04s both; }
        .hl2 { animation: heroLine 0.9s ${EASE} 0.17s both; }
        .hl3 { animation: heroLine 0.9s ${EASE} 0.30s both; }
        .hl4 { animation: heroLine 0.9s ${EASE} 0.43s both; }
        @keyframes heroPop { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .hpop1 { animation: heroPop 0.8s ${EASE} 0.60s both; }
        .hpop2 { animation: heroPop 0.8s ${EASE} 0.70s both; }
        .hpop3 { animation: heroPop 0.8s ${EASE} 0.80s both; }

        /* ── Cursor ── */
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        .cursor { display:inline-block; width:3px; height:0.82em; background:#1351AA; margin-left:5px; vertical-align:middle; animation: blink 1.1s step-end infinite; }

        /* ── Nav underline ── */
        .nav-link { position: relative; }
        .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:100%; height:1.5px; background:currentColor; transform:scaleX(0); transform-origin:left; transition:transform 0.25s ${EASE}; }
        .nav-link:hover::after { transform:scaleX(1); }

        /* ── Feature grid ── */
        .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
        .feat-border-r { border-right: 1px solid ${C.border}; }
        .feat-box { border-top: 1px solid ${C.border}; }

        /* ── Section grid (label sidebar) ── */
        .sec-grid { display: grid; grid-template-columns: 200px 1fr; border-top: 1px solid ${C.border}; max-width: 1200px; margin: 0 auto; padding: 0 2.5rem; }
        .sec-label { /* side label column */ }

        /* ── Step grid ── */
        .step-row { display: grid; grid-template-columns: 200px 1fr; }
        .step-num { /* number column */ }
        .step-content { /* content column */ }

        /* ── Why item ── */
        .why-item { display: grid; grid-template-columns: 3rem 1fr 2fr; gap: 1.5rem; align-items: start; }
        .why-idx { padding-top: 0.25rem; }

        /* ── Platform grid ── */
        .plat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }

        /* ── Platform hover rows ── */
        .plat-row { transition: background 0.25s ease; padding: 0.875rem 0; }
        .plat-row:hover { background: rgba(19,81,170,0.03); }
        .plat-row + .plat-row { border-top: 1px solid ${C.border}; }

        /* ── Shared max-width wrapper ── */
        .dft-wrap { max-width: 1200px; margin: 0 auto; padding: 0 2.5rem; }

        /* ── Stats ── */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-top: 4rem; border-top: 1px solid ${C.border}; }
        .stat-cell { padding: 1.5rem 0; }
        .stat-cell:not(:last-child) { border-right: 1px solid ${C.border}; padding-right: 2rem; }
        .stat-cell:not(:first-child) { padding-left: 2rem; }

        /* ─────────────────────────────────────────────────────── */
        /* TABLET — ≤ 900px */
        /* ─────────────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .sec-grid { grid-template-columns: 1fr; }
          .sec-label { display: none; }
          .sec-content { padding: 2rem 0 !important; }

          .step-row { grid-template-columns: 1fr; }
          .step-num { display: none; }
          .step-content { padding: 1.75rem 0 !important; border-left: none; }

          .why-item { grid-template-columns: 2.5rem 1fr; }
          .why-desc { display: none; }

          .feat-grid { grid-template-columns: repeat(2, 1fr); }
          .feat-border-r:nth-child(2n) { border-right: none; }

          .plat-grid { grid-template-columns: 1fr; }
          .plat-li-pad { border-top: 1px solid ${C.border}; padding-top: 2rem !important; padding-left: 0 !important; margin-top: 0 !important; }
          .plat-ig-pad { border-right: none !important; padding-right: 0 !important; }

          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .stat-cell:nth-child(2) { border-right: none; }
          .stat-cell:nth-child(3) { border-right: 1px solid ${C.border}; padding-left: 0; }
          .stat-cell:nth-child(3), .stat-cell:nth-child(4) { border-top: 1px solid ${C.border}; padding-top: 1.5rem; }

          .hero-cta-row { flex-direction: column !important; align-items: flex-start !important; }
        }

        /* ─────────────────────────────────────────────────────── */
        /* MOBILE — ≤ 600px */
        /* ─────────────────────────────────────────────────────── */
        @media (max-width: 600px) {
          .dft-wrap { padding: 0 1.25rem; }
          .sec-grid { padding: 0 1.25rem; }

          .feat-grid { grid-template-columns: 1fr; }
          .feat-border-r { border-right: none; }

          .why-item { grid-template-columns: 1fr; gap: 0.4rem; }
          .why-idx { display: none; }
          .why-desc { display: block; margin-top: 0.4rem; }

          .stats-grid { grid-template-columns: 1fr 1fr; }

          .nav-links { gap: 1.25rem !important; }

          .hero-pad { padding: 3rem 1.25rem 2.5rem !important; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: `${C.bg}f2`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}`, height: 64, display: 'flex', alignItems: 'center' }}>
        <div className="dft-wrap" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.black }}>Draftr</span>
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
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
      <section style={{
        borderBottom: `1px solid ${C.border}`,
        minHeight: '90vh',
        display: 'flex', alignItems: 'center',
        backgroundImage: 'radial-gradient(circle, rgba(19,81,170,0.09) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}>
        <div className="dft-wrap hero-pad" style={{ width: '100%', padding: '5rem 2.5rem 4rem' }}>

          <div className="hl1" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2.5rem' }}>
            <div style={{ width: 10, height: 10, background: C.blue, flexShrink: 0 }} />
            <Label color={C.blue}>For Instagram + LinkedIn Creators</Label>
          </div>

          <h1 style={{ fontSize: 'clamp(3rem, 8.5vw, 9rem)', fontWeight: 900, lineHeight: 0.87, letterSpacing: '-0.04em', color: C.black, margin: '0 0 2.5rem', maxWidth: '900px' }}>
            <span className="hl1" style={{ display: 'block', overflow: 'hidden' }}>YOUR WEEK IS</span>
            <span className="hl2" style={{ display: 'block', overflow: 'hidden' }}>
              FULL OF{' '}<span style={{ color: C.blue }}>CONTENT.</span><span className="cursor" />
            </span>
            <span className="hl3" style={{ display: 'block', overflow: 'hidden' }}>YOU&apos;RE JUST</span>
            <span className="hl4" style={{ display: 'block', overflow: 'hidden' }}>NOT POSTING IT.</span>
          </h1>

          <div className="hero-cta-row hpop1" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
            <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', color: C.gray, lineHeight: 1.65, maxWidth: 480, margin: 0 }}>
              Draftr scans your real Instagram account, then turns what happened this week into platform-native scripts for Reels and LinkedIn posts — in your voice, built on your actual data.
            </p>
            <div className="hpop2" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Btn href="/login">Get Started Free →</Btn>
              <a href="#how" style={{ fontSize: '0.875rem', fontWeight: 600, color: C.gray, textDecoration: 'none', borderBottom: `1px solid ${C.borderDk}`, paddingBottom: 2 }}>
                See how it works ↓
              </a>
            </div>
          </div>

          {/* Stats */}
          <div ref={statsRef.ref} className="stats-grid hpop3">
            {([
              { raw: 2,   suffix: '',  label: 'Platforms — Instagram + LinkedIn' },
              { raw: 60,  suffix: 's', label: 'To scan your account' },
              { raw: 3,   suffix: '+', label: 'Posts per week, auto-planned' },
              { raw: 100, suffix: '%', label: 'Based on your real data' },
            ]).map(({ raw, suffix, label }, i) => (
              <div key={i} className="stat-cell">
                <StatCard raw={raw} suffix={suffix} label={label} inView={statsRef.inView} delay={i * 0.08} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────── */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: '0.875rem 0', overflow: 'hidden', background: C.black }}>
        <div className="dft-marquee" style={{ display: 'flex', width: 'max-content' }}>
          {[...Array(2)].map((_, r) => (
            <div key={r} style={{ display: 'flex', alignItems: 'center' }}>
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
      <section style={{ borderBottom: `1px solid ${C.border}` }} id="how">
        <div ref={howRef.ref}>
          <SectionGrid label="How it works">
            <h2 style={{ fontSize: 'clamp(1.75rem, 4.5vw, 4.5rem)', fontWeight: 800, color: C.black, letterSpacing: '-0.03em', lineHeight: 0.9, margin: '0 0 2.5rem', ...fu(howRef.inView, 0) }}>
              THREE STEPS.<br /><span style={{ color: C.blue }}>ZERO TEMPLATES.</span>
            </h2>
          </SectionGrid>
          <div className="dft-wrap" style={{ borderTop: `1px solid ${C.border}` }}>
            <StepRow num="01" title="Scan your Instagram"
              body="Connect your handle. We scrape your last 30 posts via Apify — real engagement rates, top hooks, best formats, trending hashtags. Everything built from what you've actually posted."
              tag="Takes 60 seconds" inView={howRef.inView} delay={0.1} />
            <StepRow num="02" title="Log what happened"
              body="Open Life Log. Dump your week in rough notes — what you shipped, learnt, struggled with, or figured out. No structure required. Just what happened."
              tag="Freeform. Messy is fine." inView={howRef.inView} delay={0.2} />
            <StepRow num="03" title="Get your drafts"
              body="Draftr generates Instagram Reel scripts, carousel breakdowns, and LinkedIn posts from your actual story. Every LinkedIn post includes an AI image prompt for DALL-E or Midjourney."
              tag="Platform-native. In your voice." last inView={howRef.inView} delay={0.3} />
          </div>
        </div>
      </section>

      {/* ── TWO PLATFORMS ────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${C.border}` }}>
        <div ref={platformRef.ref}>
          <SectionGrid label="Output">
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3.5rem)', fontWeight: 800, color: C.black, letterSpacing: '-0.03em', lineHeight: 0.95, margin: '0 0 2.5rem', ...fu(platformRef.inView, 0) }}>
              ONE INPUT.<br />TWO PLATFORMS.
            </h2>
            <div className="plat-grid">
              {/* Instagram */}
              <div className="plat-ig-pad" style={{ borderRight: `1px solid ${C.border}`, paddingRight: '2.5rem', ...fu(platformRef.inView, 0.1) }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                  <div style={{ width: 8, height: 8, background: C.blue }} />
                  <Label color={C.blue}>Instagram</Label>
                </div>
                {[
                  ['Reel Script',    'Hook + body + CTA for maximum watch time'],
                  ['Carousel Deck',  'Slide-by-slide with hook slide and CTA'],
                  ['Talking Head',   'Conversational direct-to-camera script'],
                  ['Caption Copy',   'First-2-lines hook + trigger word + hashtags'],
                  ['Hook Variants',  '3 A/B hooks — curiosity, interrupt, result-first'],
                ].map(([t, d], i) => (
                  <div key={i} className="plat-row">
                    <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.black, margin: '0 0 0.15rem' }}>{t}</p>
                    <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0, lineHeight: 1.5 }}>{d}</p>
                  </div>
                ))}
              </div>

              {/* LinkedIn */}
              <div className="plat-li-pad" style={{ paddingLeft: '2.5rem', ...fu(platformRef.inView, 0.2) }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                  <div style={{ width: 8, height: 8, border: `2px solid ${C.blue}` }} />
                  <Label color={C.blue}>LinkedIn</Label>
                </div>
                {[
                  ['Story Post',   'Narrative — what happened, what you learnt, what it means'],
                  ['Insight Post', 'Sharp professional insight, built for engagement'],
                  ['Progress Post','Milestone, build log, or honest reflection'],
                  ['Image Prompt', 'AI image prompt for DALL-E 3 or Midjourney — every post'],
                  ['Hashtags',     '3–5 relevant professional hashtags, never stuffed'],
                ].map(([t, d], i) => (
                  <div key={i} className="plat-row">
                    <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.black, margin: '0 0 0.15rem' }}>{t}</p>
                    <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0, lineHeight: 1.5 }}>{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionGrid>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${C.border}` }} id="features">
        <div ref={featRef.ref}>
          <SectionGrid label="The system">
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 4rem)', fontWeight: 800, color: C.black, letterSpacing: '-0.03em', lineHeight: 0.92, margin: '0 0 2rem', ...fu(featRef.inView, 0) }}>
              EVERYTHING<br />INSIDE DRAFTR.
            </h2>
          </SectionGrid>
          <div className="dft-wrap">
            <div className="feat-grid">
              {[
                { i: '01', title: 'Account Scan',       desc: 'Real Instagram data via Apify — 30 posts, engagement rates, hook strength, top formats, niche hashtags.' },
                { i: '02', title: 'Life Log',            desc: 'Dump your week in plain text. Get Instagram scripts and LinkedIn posts from your actual story.' },
                { i: '03', title: 'Studio',              desc: 'Write, rewrite, and hook any idea. Section-level regen, tone controls, 5 hook types, A/B variants.' },
                { i: '04', title: '30-Day Calendar',     desc: 'Real dates, AI-generated hooks, posting times — tuned to your cadence and trending keywords.' },
                { i: '05', title: 'Competitor Analysis', desc: 'Analyse any public Instagram account. Get their strategy, gaps they leave, and hooks you can adapt.' },
                { i: '06', title: 'Hooks + Triggers',    desc: 'AI hooks by type (curiosity, hot take, story, hinglish) and comment trigger words for your niche.' },
              ].map(({ i, title, desc }, idx) => (
                <FeatureBox key={i} index={i} title={title} desc={desc} noRight={(idx + 1) % 3 === 0} inView={featRef.inView} delay={0.05 + (idx % 3) * 0.08 + Math.floor(idx / 3) * 0.15} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY DRAFTR ───────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${C.border}` }}>
        <div ref={whyRef.ref}>
          <SectionGrid label="Why Draftr">
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3.5rem)', fontWeight: 800, color: C.black, letterSpacing: '-0.03em', lineHeight: 0.95, margin: '0 0 2rem', ...fu(whyRef.inView, 0) }}>
              NOT ANOTHER<br />AI CONTENT TOOL.
            </h2>
            <WhyItem index="01" title="Built on your real data"   desc="Not templates. Your actual post history, hooks, and engagement — Apify-scraped on demand. Every recommendation references your real numbers." inView={whyRef.inView} delay={0.05} />
            <WhyItem index="02" title="Your voice, not AI voice"  desc="Every output is calibrated to your niche, your proven hook styles, and your brand tone. It sounds like you because it starts with you." inView={whyRef.inView} delay={0.15} />
            <WhyItem index="03" title="Both platforms, one input" desc="Life Log takes one story and generates Instagram scripts AND LinkedIn posts simultaneously — platform-native, not copy-pasted content." inView={whyRef.inView} delay={0.25} />
            <WhyItem index="04" title="Image prompts included"    desc="Every LinkedIn post includes a ready-to-paste image prompt for DALL-E 3, Midjourney v6, or Ideogram. Editorial. Professional. Never stock." inView={whyRef.inView} delay={0.35} />
          </SectionGrid>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div ref={ctaRef.ref} className="dft-wrap" style={{ width: '100%', padding: '5rem 2.5rem' }}>
          <div style={{ maxWidth: 800 }}>
            <div style={fu(ctaRef.inView, 0)}><Label color={C.blue}>Early Access · Free</Label></div>
            <h2 style={{ fontSize: 'clamp(2.5rem, 7vw, 7.5rem)', fontWeight: 900, color: C.black, letterSpacing: '-0.04em', lineHeight: 0.87, margin: '1rem 0 2rem', ...fu(ctaRef.inView, 0.1) }}>
              START WITH<br />YOUR REAL<br /><span style={{ color: C.blue }}>WEEK.</span>
            </h2>
            <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', color: C.gray, lineHeight: 1.65, maxWidth: 480, margin: '0 0 2.5rem', ...fu(ctaRef.inView, 0.2) }}>
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
        <div className="dft-wrap" style={{ padding: '1.75rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.black }}>Draftr</span>
            <a href="https://instagram.com/uxabhi_" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.muted, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.black)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >by @uxabhi_</a>
            <a href="mailto:hello@uxabhi.com" className="nav-link" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.muted, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.black)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >hello@uxabhi.com</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <a href="#how" className="nav-link" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.muted, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.black)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >How it works</a>
            <a href="#features" className="nav-link" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.muted, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.black)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >Features</a>
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
