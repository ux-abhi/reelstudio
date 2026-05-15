'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { ScanResult, ProfileInput } from '@/types/scan'

interface ScanContextType {
  scan: ScanResult | null
  isScanning: boolean
  scanProgress: string[]
  error: string | null
  runScan: (handleOrProfile: string | ProfileInput, force?: boolean) => Promise<void>
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

const SCAN_STEPS = [
  'Scraping your Instagram profile...',
  'Fetching your recent posts...',
  'Pulling Google Trends for your niche...',
  'Groq is analysing everything...',
  'Building your 30-day content calendar...',
]

export function ScanProvider({ children }: { children: ReactNode }) {
  const [scan, setScan] = useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hasProfile, setHasProfile] = useState(false)

  // On mount: load cached scan if we have a stored handle
  useEffect(() => {
    const storedHandle = localStorage.getItem('uxabhi:handle')
    // Legacy: also support old profile-based storage
    const storedProfile = localStorage.getItem('uxabhi:profile')

    if (storedHandle || storedProfile) {
      setHasProfile(true)
      const body = storedHandle
        ? { handle: storedHandle, forceRefresh: false }
        : { profileInput: JSON.parse(storedProfile!), forceRefresh: false }

      fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
        .then(r => r.json())
        .then(data => { if (!data.error) setScan(data) })
        .catch(() => {})
    }
  }, [])

  const runScan = useCallback(async (handleOrProfile: string | ProfileInput, force = false) => {
    setIsScanning(true)
    setError(null)
    setScanProgress([])

    // Animate steps while scan runs
    let stepIndex = 0
    const stepInterval = setInterval(() => {
      if (stepIndex < SCAN_STEPS.length) {
        setScanProgress(prev => [...prev, SCAN_STEPS[stepIndex]])
        stepIndex++
      }
    }, 2000)

    try {
      let body: Record<string, unknown>

      if (typeof handleOrProfile === 'string') {
        const cleanHandle = handleOrProfile.replace('@', '').toLowerCase()
        localStorage.setItem('uxabhi:handle', cleanHandle)
        localStorage.removeItem('uxabhi:profile')
        body = { handle: cleanHandle, forceRefresh: force }
      } else {
        localStorage.setItem('uxabhi:profile', JSON.stringify(handleOrProfile))
        localStorage.removeItem('uxabhi:handle')
        body = { profileInput: handleOrProfile, forceRefresh: force }
      }

      setHasProfile(true)

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setScan(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Scan failed')
    } finally {
      clearInterval(stepInterval)
      setIsScanning(false)
      setScanProgress([])
    }
  }, [])

  return (
    <ScanContext.Provider value={{ scan, isScanning, scanProgress, error, runScan, hasProfile }}>
      {children}
    </ScanContext.Provider>
  )
}

export const useScan = () => useContext(ScanContext)
