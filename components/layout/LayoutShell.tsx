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
        <div className="max-w-[1080px] mx-auto px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </>
  )
}
