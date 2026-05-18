'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { ScanResult, ProfileInput } from '@/types/scan'

interface ScanContextType {
  scan: ScanResult | null
  isScanning: boolean       // running a new forced scan (shows full-screen progress overlay)
  isInitialLoad: boolean    // loading cached scan from Supabase on mount (show inline skeletons)
  scanProgress: string[]
  error: string | null
  runScan: (handleOrProfile: string | ProfileInput, force?: boolean) => Promise<void>
  hasProfile: boolean
}

const ScanContext = createContext<ScanContextType>({
  scan: null,
  isScanning: false,
  isInitialLoad: false,
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
  const [isInitialLoad, setIsInitialLoad] = useState(false)
  const [scanProgress, setScanProgress] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hasProfile, setHasProfile] = useState(false)

  // On mount: load cached scan from Supabase (or trigger fresh scan if expired)
  useEffect(() => {
    const storedHandle = localStorage.getItem('ss:handle')
    const storedProfile = localStorage.getItem('ss:profile')

    if (!storedHandle && !storedProfile) return

    setHasProfile(true)
    setIsInitialLoad(true)

    const body = storedHandle
      ? { handle: storedHandle, forceRefresh: false }
      : { profileInput: JSON.parse(storedProfile!), forceRefresh: false }

    fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          console.warn('[ScanContext] initial load error:', data.error)
          setError(data.error)
        } else {
          setScan(data)
        }
      })
      .catch(e => {
        console.warn('[ScanContext] initial load failed:', e)
        setError(e instanceof Error ? e.message : 'Failed to load scan')
      })
      .finally(() => setIsInitialLoad(false))
  }, [])

  const runScan = useCallback(async (handleOrProfile: string | ProfileInput, force = false) => {
    setIsScanning(true)
    setError(null)
    setScanProgress([])

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
        localStorage.setItem('ss:handle', cleanHandle)
        localStorage.removeItem('ss:profile')
        body = { handle: cleanHandle, forceRefresh: force }
      } else {
        localStorage.setItem('ss:profile', JSON.stringify(handleOrProfile))
        localStorage.removeItem('ss:handle')
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
    <ScanContext.Provider value={{ scan, isScanning, isInitialLoad, scanProgress, error, runScan, hasProfile }}>
      {children}
    </ScanContext.Provider>
  )
}

export const useScan = () => useContext(ScanContext)
