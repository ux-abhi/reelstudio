import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { ScanProvider } from '@/components/scan/ScanContext'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { LayoutShell } from '@/components/layout/LayoutShell'

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
})

export const metadata: Metadata = {
  title: 'Script Studio',
  description: 'AI-powered Instagram content command centre',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} data-theme="dark" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('ss:theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
        <ThemeProvider>
          <ScanProvider>
            <LayoutShell>{children}</LayoutShell>
          </ScanProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
