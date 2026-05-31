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
  title: 'Draftr',
  description: 'Turn real life into drafts — Instagram scripts and LinkedIn posts, built on your actual account data.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} data-theme="light" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('ss:theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}else{document.documentElement.setAttribute('data-theme','light')}}catch(e){}`,
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
