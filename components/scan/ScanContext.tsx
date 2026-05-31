'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { ScanResult, ProfileInput } from '@/types/scan'

interface ScanContextType {
  scan: ScanResult | null
  isScanning: boolean
  isInitialLoad: boolean
  scanProgress: string[]
  error: string | null
  scanError: string | null
  clearScanError: () => void
  runScan: (handleOrProfile: string | ProfileInput, force?: boolean) => Promise<boolean>
  hasProfile: boolean
}

const ScanContext = createContext<ScanContextType>({
  scan: null,
  isScanning: false,
  isInitialLoad: false,
  scanProgress: [],
  error: null,
  scanError: null,
  clearScanError: () => {},
  runScan: async () => false,
  hasProfile: false,
})

const SCAN_STEPS = [
  'Scraping your Instagram profile...',
  'Fetching your recent posts...',
  'Pulling Google Trends for your niche...',
  'Groq is analysing everything...',
  'Building your content calendar...',
]

export function ScanProvider({ children }: { children: ReactNode }) {
  const [scan, setScan] = useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(false)
  const [scanProgress, setScanProgress] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [hasProfile, setHasProfile] = useState(false)

  const clearScanError = useCallback(() => setScanError(null), [])

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
          setScanError(data.error)
        } else {
          setScan(data)
        }
      })
      .catch(e => {
        console.warn('[ScanContext] initial load failed:', e)
        setScanError('Failed to load scan data')
      })
      .finally(() => setIsInitialLoad(false))
  }, [])

  const runScan = useCallback(async (handleOrProfile: string | ProfileInput, force = false): Promise<boolean> => {
    setIsScanning(true)
    setError(null)
    setScanError(null)
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
      let postingGoal: string | undefined
      let niche: string | undefined
      try {
        postingGoal = localStorage.getItem('ss:posting-goal') ?? undefined
        niche = localStorage.getItem('ss:niche') ?? undefined
      } catch {}

      if (typeof handleOrProfile === 'string') {
        const cleanHandle = handleOrProfile.replace('@', '').toLowerCase()
        localStorage.setItem('ss:handle', cleanHandle)
        localStorage.removeItem('ss:profile')
        body = { handle: cleanHandle, forceRefresh: force, postingGoal, niche }
      } else {
        localStorage.setItem('ss:profile', JSON.stringify(handleOrProfile))
        localStorage.removeItem('ss:handle')
        body = { profileInput: handleOrProfile, forceRefresh: force, postingGoal, niche }
      }

      // Clear calendar edits on force-rescan so stale overrides don't mask new AI content.
      // Script attachments (ss:calendar:scripts) are kept — user explicitly scheduled those.
      if (force) {
        try { localStorage.removeItem('ss:calendar:edits') } catch {}
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
      return true
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Scan failed'
      setError(msg)
      setScanError(msg)
      return false
    } finally {
      clearInterval(stepInterval)
      setIsScanning(false)
      setScanProgress([])
    }
  }, [])

  return (
    <ScanContext.Provider value={{ scan, isScanning, isInitialLoad, scanProgress, error, scanError, clearScanError, runScan, hasProfile }}>
      {children}
    </ScanContext.Provider>
  )
}

export const useScan = () => useContext(ScanContext)
