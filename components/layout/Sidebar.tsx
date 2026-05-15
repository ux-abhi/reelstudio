'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { useTheme } from './ThemeProvider'
import { ScanStatus } from './ScanStatus'

const CREATE_NAV = [
  { href: '/studio',   label: 'Script Studio' },
  { href: '/saved',    label: 'Save Board' },
  { href: '/ideas',    label: 'Ideas Bank' },
  { href: '/hooks',    label: 'Hooks Library' },
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

const MOBILE_NAV = [
  { href: '/studio',    label: 'Studio',    icon: '✦' },
  { href: '/ideas',     label: 'Ideas',     icon: '◉' },
  { href: '/dashboard', label: 'Dashboard', icon: '⊙' },
  { href: '/calendar',  label: 'Calendar',  icon: '▦' },
  { href: '/actions',   label: 'Actions',   icon: '◈' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { scan } = useScan()
  const { theme, toggle } = useTheme()

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="sidebar-wrap"
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
          padding: '16px 12px',
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
            @uxabhi_ Studio
          </p>
          {scan && (
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
              {scan.profileInput?.followers?.toLocaleString()} followers
            </p>
          )}
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

        {/* Bottom */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 16 }}>
          <ScanStatus />

          {/* Theme toggle */}
          <button
            onClick={toggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 8px',
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 400,
              color: 'var(--text-tertiary)',
              background: 'transparent',
              border: '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 140ms ease',
              width: '100%',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'var(--bg-elevated)'
              el.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'transparent'
              el.style.color = 'var(--text-tertiary)'
            }}
          >
            <span style={{ fontSize: 14, flexShrink: 0 }}>
              {theme === 'dark' ? '☀' : '☽'}
            </span>
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>

          {/* Profile pill */}
          {scan && (
            <div
              style={{
                padding: '10px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                @{scan.profileInput?.handle}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                {scan.profileInput?.followers?.toLocaleString()} → {scan.profileInput?.goal?.toLocaleString()} goal
              </p>
            </div>
          )}
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
