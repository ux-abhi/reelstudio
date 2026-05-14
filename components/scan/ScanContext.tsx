'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ScanResult, ProfileInput } from '@/types/scan'

interface ScanContextType {
  scan: ScanResult | null
  isScanning: boolean
  scanProgress: string[]
  error: string | null
  runScan: (profile: ProfileInput, force?: boolean) => Promise<void>
  hasProfile: boolean
}

const ScanContext = createContext<ScanContextType>({
  scan: null,
  isScanning: false,
  scanProgress: [],
  error: null,
  runScan: async () => {},
  hasProfile: false,
})

export function ScanProvider({ children }: { children: ReactNode }) {
  const [scan, setScan] = useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    const savedProfile = localStorage.getItem('uxabhi:profile')
    if (savedProfile) {
      setHasProfile(true)
      fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileInput: JSON.parse(savedProfile),
          forceRefresh: false,
        }),
      })
        .then(r => r.json())
        .then(data => { if (!data.error) setScan(data) })
        .catch(() => {})
    }
  }, [])

  async function runScan(profile: ProfileInput, force = false) {
    setIsScanning(true)
    setError(null)
    setScanProgress([])

    const steps = [
      'Reading your post data...',
      'Fetching Google Trends for your niche...',
      'Groq is analysing everything...',
      'Generating your content strategy...',
      'Building your 30-day calendar...',
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 1800))
      setScanProgress(prev => [...prev, steps[i]])
    }

    try {
      localStorage.setItem('uxabhi:profile', JSON.stringify(profile))
      setHasProfile(true)

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileInput: profile, forceRefresh: force }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setScan(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Scan failed')
    } finally {
      setIsScanning(false)
      setScanProgress([])
    }
  }

  return (
    <ScanContext.Provider value={{ scan, isScanning, scanProgress, error, runScan, hasProfile }}>
      {children}
    </ScanContext.Provider>
  )
}

export const useScan = () => useContext(ScanContext)
