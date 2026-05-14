import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { ScanProvider } from '@/components/scan/ScanContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { ThemeProvider } from '@/components/layout/ThemeProvider'

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
})

export const metadata: Metadata = {
  title: '@uxabhi_ Studio',
  description: 'AI-powered Instagram content command centre for @uxabhi_',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} data-theme="dark" suppressHydrationWarning>
      <body>
        {/* Sync theme from localStorage before first paint — prevents FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('uxabhi:theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
        <ThemeProvider>
          <ScanProvider>
            <Sidebar />
            <main
              style={{ minHeight: '100vh', transition: 'margin 200ms ease' }}
              className="md:ml-[220px] pb-[72px] md:pb-0"
            >
              <div className="max-w-[1080px] mx-auto px-4 py-6 md:px-8 md:py-8">
                {children}
              </div>
            </main>
          </ScanProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
