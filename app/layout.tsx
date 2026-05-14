import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { ScanProvider } from '@/components/scan/ScanContext'
import { Sidebar } from '@/components/layout/Sidebar'

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
})

export const metadata: Metadata = {
  title: '@uxabhi_ Studio',
  description: 'AI-powered Instagram content command centre for @uxabhi_',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <ScanProvider>
          <Sidebar />
          <main className="md:ml-[220px] min-h-screen pb-20 md:pb-0">
            <div className="max-w-[1080px] mx-auto px-4 py-6 md:px-8 md:py-8">
              {children}
            </div>
          </main>
        </ScanProvider>
      </body>
    </html>
  )
}
