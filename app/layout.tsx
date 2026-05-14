import type { Metadata } from 'next'
import './globals.css'
import { ScanProvider } from '@/components/scan/ScanContext'
import { Sidebar } from '@/components/layout/Sidebar'

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
    <html lang="en">
      <body>
        <ScanProvider>
          <Sidebar />
          <main className="md:ml-[240px] pb-24 md:pb-0 min-h-screen px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto">
            {children}
          </main>
        </ScanProvider>
      </body>
    </html>
  )
}
