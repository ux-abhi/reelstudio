'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { ScanStatus } from './ScanStatus'

const CREATE_NAV = [
  { href: '/studio', label: 'Script Studio', icon: '✍' },
  { href: '/saved', label: 'Save Board', icon: '🔖' },
  { href: '/ideas', label: 'Ideas Bank', icon: '💡' },
  { href: '/hooks', label: 'Hooks Library', icon: '🎣' },
  { href: '/triggers', label: 'Trigger Words', icon: '💬' },
]

const STRATEGY_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '◎' },
  { href: '/audit', label: 'Account Audit', icon: '📊' },
  { href: '/pillars', label: 'Content Pillars', icon: '🏛' },
  { href: '/calendar', label: '30-Day Calendar', icon: '📅' },
  { href: '/competitors', label: 'Competitors', icon: '🔍' },
  { href: '/actions', label: 'Priority Actions', icon: '✓' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { scan } = useScan()

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="fixed left-0 top-0 h-screen flex-col hidden md:flex"
        style={{
          width: 240,
          background: 'rgba(12,12,18,0.80)',
          backdropFilter: 'blur(40px)',
          borderRight: '0.5px solid rgba(255,255,255,0.08)',
          padding: '20px 12px',
          gap: 4,
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 12 }}>
          <div className="flex items-baseline gap-1 px-2 py-1">
            <span style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.50)' }}>
              @uxabhi_
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>
              Studio
            </span>
          </div>
          {scan && (
            <p className="px-2" style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
              {scan.profileInput?.followers?.toLocaleString() ?? ''} followers
            </p>
          )}
          <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)', marginTop: 12 }} />
        </div>

        {/* Create section */}
        <NavSection label="Create">
          {CREATE_NAV.map(item => (
            <NavItem key={item.href} {...item} active={pathname === item.href} />
          ))}
        </NavSection>

        <div style={{ height: 8 }} />

        {/* Strategy section */}
        <NavSection label="Strategy">
          {STRATEGY_NAV.map(item => (
            <NavItem key={item.href} {...item} active={pathname === item.href} />
          ))}
        </NavSection>

        {/* Bottom */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ScanStatus />
          {scan && (
            <div
              className="px-3 py-3 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.08)',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.80)' }}>
                @{scan.profileInput?.handle}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                {scan.profileInput?.followers?.toLocaleString()} → {scan.profileInput?.goal?.toLocaleString()} goal
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex md:hidden"
        style={{
          background: 'rgba(12,12,18,0.95)',
          backdropFilter: 'blur(40px)',
          borderTop: '0.5px solid rgba(255,255,255,0.08)',
          zIndex: 50,
          padding: '8px 0',
        }}
      >
        {[...CREATE_NAV.slice(0, 3), ...STRATEGY_NAV.slice(0, 2)].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center gap-1 py-1"
            style={{
              color: pathname === item.href ? '#6e6aff' : 'rgba(255,255,255,0.40)',
              fontSize: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span>{item.label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.25)',
          padding: '12px 10px 4px',
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
  icon,
  active,
}: {
  href: string
  label: string
  icon: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg transition-all"
      style={{
        padding: '7px 10px',
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.50)',
        background: active ? 'rgba(110,106,255,0.12)' : 'transparent',
        border: `0.5px solid ${active ? 'rgba(110,106,255,0.20)' : 'transparent'}`,
      }}
    >
      <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{icon}</span>
      {label}
    </Link>
  )
}
