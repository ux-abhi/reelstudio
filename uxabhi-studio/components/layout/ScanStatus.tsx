'use client'
import { useScan } from '@/components/scan/ScanContext'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ago`
}

export function ScanStatus() {
  const { scan, isScanning, hasProfile, runScan } = useScan()

  if (!hasProfile) return null

  async function handleRefresh() {
    const saved = localStorage.getItem('uxabhi:profile')
    if (!saved) return
    const profile = JSON.parse(saved)
    await runScan(profile, true)
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: isScanning ? '#FFD60A' : scan ? '#34C759' : 'rgba(255,255,255,0.25)',
        }}
      />
      <span className="text-xs flex-1" style={{ color: 'rgba(255,255,255,0.40)' }}>
        {isScanning
          ? 'Scanning...'
          : scan
          ? `Scanned ${timeAgo(scan.scannedAt)}`
          : 'Not scanned'}
      </span>
      <button
        onClick={handleRefresh}
        disabled={isScanning}
        className="text-xs transition-colors"
        style={{ color: 'rgba(110,106,255,0.80)' }}
        title="Re-run scan"
      >
        ↻
      </button>
    </div>
  )
}
