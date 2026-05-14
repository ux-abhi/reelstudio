'use client'
import { useScan } from '@/components/scan/ScanContext'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ago`
}

export function ScanStatus() {
  const { scan, isScanning, hasProfile, runScan } = useScan()

  if (!hasProfile) return null

  async function handleRefresh() {
    const saved = localStorage.getItem('uxabhi:profile')
    if (!saved) return
    await runScan(JSON.parse(saved), true)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        borderRadius: 7,
        border: '1px solid var(--border)',
        background: 'var(--bg-subtle)',
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: isScanning ? 'var(--yellow)' : scan ? 'var(--green)' : 'var(--text-tertiary)',
          flexShrink: 0,
          animation: isScanning ? 'pulseDot 1.4s ease-in-out infinite' : undefined,
        }}
      />
      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flex: 1 }}>
        {isScanning ? 'Scanning...' : scan ? `Scanned ${timeAgo(scan.scannedAt)}` : 'Not scanned'}
      </span>
      <button
        onClick={handleRefresh}
        disabled={isScanning}
        className="btn-ghost"
        style={{ width: 22, height: 22, fontSize: 13, color: 'var(--accent)' }}
        title="Re-run scan"
      >
        ↻
      </button>
    </div>
  )
}
