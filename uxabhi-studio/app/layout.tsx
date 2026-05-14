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
          <div className="flex min-h-screen">
            <Sidebar />
            <main
              className="flex-1 min-h-screen"
              style={{ marginLeft: 0, paddingBottom: 80 }}
            >
              <div
                className="md:ml-[240px]"
                style={{ maxWidth: '100%', padding: '32px 24px' }}
              >
                {children}
              </div>
            </main>
          </div>
        </ScanProvider>
      </body>
    </html>
  )
}
