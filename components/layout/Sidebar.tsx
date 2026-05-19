'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import { ScanStatus } from './ScanStatus'
import { createClient } from '@/lib/supabase/client'

const CREATE_NAV = [
  { href: '/studio',   label: 'Script Studio' },
  { href: '/ideas',    label: 'Content Library' },
  { href: '/triggers', label: 'Trigger Words' },
]

const STRATEGY_NAV = [
  { href: '/dashboard',   label: 'Dashboard' },
  { href: '/audit',       label: 'Account Audit' },
  { href: '/pillars',     label: 'Content Pillars' },
  { href: '/calendar',    label: '30-Day Calendar' },
  { href: '/competitors', label: 'Competitors' },
  { href: '/actions',     label: 'Priority Actions' },
]

const ACCOUNT_NAV = [
  { href: '/settings', label: 'Settings' },
]

const MOBILE_NAV = [
  { href: '/studio',    label: 'Studio',   icon: '✦' },
  { href: '/ideas',     label: 'Library',  icon: '◉' },
  { href: '/dashboard', label: 'Dashboard',icon: '⊙' },
  { href: '/calendar',  label: 'Calendar', icon: '▦' },
  { href: '/actions',   label: 'Actions',  icon: '◈' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="sidebar-wrap"
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
          padding: '20px 14px',
          transition: 'background 200ms ease, border-color 200ms ease',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '8px 8px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: 8,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Script Studio
          </p>
        </div>

        {/* Create */}
        <NavSection label="Create">
          {CREATE_NAV.map(item => (
            <NavItem key={item.href} href={item.href} label={item.label} active={pathname === item.href} />
          ))}
        </NavSection>

        <div style={{ height: 8 }} />

        {/* Strategy */}
        <NavSection label="Strategy">
          {STRATEGY_NAV.map(item => (
            <NavItem key={item.href} href={item.href} label={item.label} active={pathname === item.href} />
          ))}
        </NavSection>

        {/* Account */}
        <div style={{ height: 8 }} />
        <NavSection label="Account">
          {ACCOUNT_NAV.map(item => (
            <NavItem key={item.href} href={item.href} label={item.label} active={pathname === item.href} />
          ))}
        </NavSection>

        {/* Bottom */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 16 }}>
          <ScanStatus />

          {/* Theme + sign out row */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={toggle}
              className="btn-ghost"
              style={{ flex: 1, height: 30, fontSize: 14, color: 'var(--text-tertiary)' }}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? '☀' : '☽'}
            </button>
            <button
              onClick={handleSignOut}
              className="btn-ghost"
              style={{ flex: 1, height: 30, fontSize: 12, color: 'var(--text-tertiary)' }}
              title="Sign out"
            >
              ↩
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom bar ── */}
      <nav
        className="mobile-nav-bar"
        style={{
          background: 'var(--bg-sidebar)',
          borderTop: '1px solid var(--border)',
          padding: '6px 0 8px',
          transition: 'background 200ms ease',
        }}
      >
        {MOBILE_NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '4px 0',
              fontSize: 10,
              color: pathname === item.href ? 'var(--accent)' : 'var(--text-tertiary)',
              fontWeight: pathname === item.href ? 500 : 400,
              textDecoration: 'none',
              transition: 'color 120ms ease',
            }}
          >
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        {/* Theme toggle on mobile */}
        <button
          onClick={toggle}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '4px 0',
            fontSize: 10,
            color: 'var(--text-tertiary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <span style={{ fontSize: 15 }}>{theme === 'dark' ? '☀' : '☽'}</span>
          <span>Theme</span>
        </button>
      </nav>
    </>
  )
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'var(--text-tertiary)',
          padding: '10px 8px 4px',
        }}
      >
        {label}
      </p>
      {children}
    </div>
  )
}

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 8px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: active ? 'var(--accent-subtle)' : 'transparent',
        border: `1px solid ${active ? 'var(--accent-border)' : 'transparent'}`,
        transition: 'all 120ms ease',
        textDecoration: 'none',
        marginBottom: 1,
      }}
      onMouseEnter={e => {
        if (!active) {
          const el = e.currentTarget
          el.style.background = 'var(--bg-elevated)'
          el.style.color = 'var(--text-primary)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          const el = e.currentTarget
          el.style.background = 'transparent'
          el.style.color = 'var(--text-secondary)'
        }
      }}
    >
      {label}
    </Link>
  )
}
