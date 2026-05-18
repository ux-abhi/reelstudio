'use client'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

const AUTH_PATHS = ['/login', '/onboarding']

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_PATHS.includes(pathname) || pathname.startsWith('/auth/')

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar />
      <main className="app-main">
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 48px 56px' }}>
          {children}
        </div>
      </main>
    </>
  )
}
