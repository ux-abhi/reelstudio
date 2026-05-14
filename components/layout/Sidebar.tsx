'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { ScanStatus } from './ScanStatus'

const CREATE_NAV = [
  { href: '/studio',  label: 'Script Studio' },
  { href: '/saved',   label: 'Save Board' },
  { href: '/ideas',   label: 'Ideas Bank' },
  { href: '/hooks',   label: 'Hooks Library' },
  { href: '/triggers',label: 'Trigger Words' },
]

const STRATEGY_NAV = [
  { href: '/dashboard',   label: 'Dashboard' },
  { href: '/audit',       label: 'Account Audit' },
  { href: '/pillars',     label: 'Content Pillars' },
  { href: '/calendar',    label: '30-Day Calendar' },
  { href: '/competitors', label: 'Competitors' },
  { href: '/actions',     label: 'Priority Actions' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { scan } = useScan()

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        style={{
          width: 220,
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          zIndex: 50,
        }}
        className="hidden md:flex"
      >
        {/* Logo */}
        <div
          style={{
            padding: '8px 8px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: 8,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
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
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ScanStatus />
          {scan && (
            <div
              style={{
                padding: '10px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-subtle)',
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

      {/* Mobile bottom bar */}
      <nav
        style={{
          background: 'var(--bg-app)',
          borderTop: '1px solid var(--border)',
          zIndex: 50,
          padding: '8px 0',
        }}
        className="fixed bottom-0 left-0 right-0 flex md:hidden"
      >
        {[...CREATE_NAV.slice(0, 3), ...STRATEGY_NAV.slice(0, 2)].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center gap-0.5 py-1"
            style={{
              fontSize: 10,
              color: pathname === item.href ? 'var(--accent)' : 'var(--text-tertiary)',
              fontWeight: pathname === item.href ? 500 : 400,
              textDecoration: 'none',
            }}
          >
            <span style={{ fontSize: 16 }}>{mobileIcon(item.href)}</span>
            <span>{item.label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}

function mobileIcon(href: string): string {
  const icons: Record<string, string> = {
    '/studio':  '✦',
    '/saved':   '◈',
    '/ideas':   '◉',
    '/dashboard': '⊙',
    '/audit':   '▦',
  }
  return icons[href] ?? '·'
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--text-tertiary)',
          padding: '12px 8px 4px',
        }}
      >
        {label}
      </p>
      {children}
    </div>
  )
}

function NavItem({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '7px 8px',
        borderRadius: 7,
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: active ? 'var(--accent-subtle)' : 'transparent',
        border: `1px solid ${active ? 'var(--accent-border)' : 'transparent'}`,
        transition: 'all 140ms ease',
        textDecoration: 'none',
        marginBottom: 1,
      }}
      className="hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
    >
      {label}
    </Link>
  )
}
