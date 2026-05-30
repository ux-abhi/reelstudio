'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import { ScanStatus } from './ScanStatus'
import { createClient } from '@/lib/supabase/client'

// ── Nav structure ────────────────────────────────────────────────────────────

const CREATE_NAV = [
  { href: '/studio',   label: 'Script Studio',    icon: 'studio'    },
  { href: '/ideas',    label: 'Content Library',  icon: 'library'   },
  { href: '/triggers', label: 'Trigger Words',    icon: 'triggers'  },
]

const STRATEGY_NAV = [
  { href: '/dashboard',   label: 'Dashboard',        icon: 'dashboard'    },
  { href: '/audit',       label: 'Account Audit',    icon: 'audit'        },
  { href: '/pillars',     label: 'Content Pillars',  icon: 'pillars'      },
  { href: '/calendar',    label: '30-Day Calendar',  icon: 'calendar'     },
  { href: '/competitors', label: 'Competitors',      icon: 'competitors'  },
  { href: '/actions',     label: 'Priority Actions', icon: 'actions'      },
]

const ACCOUNT_NAV = [
  { href: '/settings', label: 'Settings', icon: 'settings' },
]

const MOBILE_NAV = [
  { href: '/studio',    label: 'Studio',    icon: 'studio'    },
  { href: '/ideas',     label: 'Library',   icon: 'library'   },
  { href: '/dashboard', label: 'Home',      icon: 'dashboard' },
  { href: '/calendar',  label: 'Calendar',  icon: 'calendar'  },
  { href: '/actions',   label: 'Actions',   icon: 'actions'   },
]

// ── Icon component ────────────────────────────────────────────────────────────

function Icon({ name, size = 13 }: { name: string; size?: number }) {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 as const }
  switch (name) {
    case 'studio':
      return (
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={s}>
          <path d="M9.5 2.5l2 2-6 6-2.5.5.5-2.5 6-6z" />
          <path d="M8.5 3.5l2 2" />
        </svg>
      )
    case 'library':
      return (
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={s}>
          <rect x="2" y="3" width="10" height="8" rx="1" />
          <path d="M2 6h10M5 3v8" />
        </svg>
      )
    case 'triggers':
      return (
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={s}>
          <path d="M8 1.5L4.5 7.5H7L5.5 12.5L11 5.5H8L9.5 1.5H8z" />
        </svg>
      )
    case 'dashboard':
      return (
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={s}>
          <rect x="2" y="2" width="4" height="4" rx="0.8" />
          <rect x="8" y="2" width="4" height="4" rx="0.8" />
          <rect x="2" y="8" width="4" height="4" rx="0.8" />
          <rect x="8" y="8" width="4" height="4" rx="0.8" />
        </svg>
      )
    case 'audit':
      return (
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={s}>
          <path d="M2 11L4 7.5L6.5 9.5L9 5L12 8" />
          <path d="M2 11h10" />
        </svg>
      )
    case 'pillars':
      return (
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={s}>
          <rect x="2" y="9" width="2.5" height="4" rx="0.5" />
          <rect x="5.75" y="6" width="2.5" height="7" rx="0.5" />
          <rect x="9.5" y="3" width="2.5" height="10" rx="0.5" />
        </svg>
      )
    case 'calendar':
      return (
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={s}>
          <rect x="2" y="3" width="10" height="9" rx="1" />
          <path d="M2 6.5h10M5 1.5v3M9 1.5v3" />
        </svg>
      )
    case 'competitors':
      return (
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={s}>
          <circle cx="5" cy="5" r="2.5" />
          <circle cx="9" cy="5" r="2.5" />
          <path d="M2 12c0-2 1.3-3 3-3M7 9c1.7 0 3 1 3 3" />
        </svg>
      )
    case 'actions':
      return (
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={s}>
          <path d="M2 4h9M2 7h7M2 10h5" />
          <path d="M10 8l1.5 1.5L14 7" />
        </svg>
      )
    case 'settings':
      return (
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={s}>
          <circle cx="7" cy="7" r="2" />
          <path d="M7 1.5v1.2M7 11.3v1.2M1.5 7h1.2M11.3 7h1.2M3.2 3.2l.85.85M9.95 9.95l.85.85M3.2 10.8l.85-.85M9.95 4.05l.85-.85" />
        </svg>
      )
    case 'theme-dark':
      return (
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" style={s}>
          <path d="M12 8.5A5.5 5.5 0 015.5 2a5.5 5.5 0 106.5 6.5z" />
        </svg>
      )
    case 'theme-light':
      return (
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" style={s}>
          <circle cx="7" cy="7" r="2.5" />
          <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.8 2.8l1 1M10.2 10.2l1 1M2.8 11.2l1-1M10.2 3.8l1-1" />
        </svg>
      )
    case 'sign-out':
      return (
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={s}>
          <path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" />
        </svg>
      )
    default:
      return null
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-tertiary)',
        padding: '12px 8px 4px',
      }}>
        {label}
      </p>
      {children}
    </div>
  )
}

function NavItem({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
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
      <span style={{ color: active ? 'var(--accent)' : 'var(--text-tertiary)', transition: 'color 120ms ease' }}>
        <Icon name={icon} size={13} />
      </span>
      {label}
    </Link>
  )
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────

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
          padding: '18px 12px 16px',
          transition: 'background 200ms ease, border-color 200ms ease',
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '2px 8px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 4,
        }}>
          {/* Brand mark — small accent square with inner dot */}
          <div style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M7 1.5L3.5 5l3 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="3.5" cy="8.5" r="1" fill="white" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              Script Studio
            </p>
            <p style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.01em', lineHeight: 1 }}>
              by @uxabhi_
            </p>
          </div>
        </div>

        {/* Create */}
        <NavSection label="Create">
          {CREATE_NAV.map(item => (
            <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} active={pathname === item.href} />
          ))}
        </NavSection>

        <div style={{ height: 4 }} />

        {/* Strategy */}
        <NavSection label="Strategy">
          {STRATEGY_NAV.map(item => (
            <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} active={pathname === item.href} />
          ))}
        </NavSection>

        <div style={{ height: 4 }} />

        {/* Account */}
        <NavSection label="Account">
          {ACCOUNT_NAV.map(item => (
            <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} active={pathname === item.href} />
          ))}
        </NavSection>

        {/* Bottom */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 16 }}>
          <ScanStatus />

          <div style={{
            display: 'flex',
            gap: 4,
            padding: '2px 0',
          }}>
            <button
              onClick={toggle}
              className="btn-ghost"
              style={{ flex: 1, height: 28, gap: 6, fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              <Icon name={theme === 'dark' ? 'theme-light' : 'theme-dark'} size={12} />
            </button>
            <button
              onClick={handleSignOut}
              className="btn-ghost"
              style={{ flex: 1, height: 28, gap: 6, fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Sign out"
            >
              <Icon name="sign-out" size={12} />
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
          padding: '6px 4px 8px',
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
              gap: 3,
              padding: '4px 0',
              fontSize: 10,
              color: pathname === item.href ? 'var(--accent)' : 'var(--text-tertiary)',
              fontWeight: pathname === item.href ? 500 : 400,
              textDecoration: 'none',
              transition: 'color 120ms ease',
            }}
          >
            <Icon name={item.icon} size={16} />
            <span>{item.label}</span>
          </Link>
        ))}

        <button
          onClick={toggle}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            padding: '4px 0',
            fontSize: 10,
            color: 'var(--text-tertiary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <Icon name={theme === 'dark' ? 'theme-light' : 'theme-dark'} size={16} />
          <span>Theme</span>
        </button>
      </nav>
    </>
  )
}
