'use client'
import { useEffect, useState } from 'react'
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
  const [niche, setNiche] = useState<string | null>(null)

  useEffect(() => {
    try { setNiche(localStorage.getItem('ss:niche')) } catch {}
  }, [])

  if (!hasProfile) return null

  const handle = scan?.instagramProfile?.handle ?? scan?.handle ?? null
  const followers = scan?.instagramProfile?.followers ?? scan?.profileInput?.followers ?? null

  async function handleRescan() {
    const storedHandle = localStorage.getItem('ss:handle')
    const storedProfile = localStorage.getItem('ss:profile')
    if (storedHandle) { await runScan(storedHandle, true); return }
    if (storedProfile) { try { await runScan(JSON.parse(storedProfile), true) } catch {} }
  }

  return (
    <div
      style={{
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'var(--bg-subtle)',
        overflow: 'hidden',
      }}
    >
      {/* Profile row */}
      <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          {handle && (
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              @{handle}
            </p>
          )}
          {niche && (
            <p style={{ fontSize: 11, color: 'var(--accent-hover)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {niche}
            </p>
          )}
          {followers != null && (
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>
              {followers.toLocaleString()} followers
            </p>
          )}
          {!handle && !niche && (
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>No scan data yet</p>
          )}
        </div>
        {/* Status dot */}
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: isScanning ? 'var(--yellow)' : scan ? 'var(--green)' : 'var(--text-tertiary)',
            flexShrink: 0,
            marginTop: 4,
            animation: isScanning ? 'pulseDot 1.4s ease-in-out infinite' : undefined,
          }}
        />
      </div>

      {/* Re-scan row */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '7px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          {isScanning ? 'Scanning...' : scan ? `Scanned ${timeAgo(scan.scannedAt)}` : 'Not scanned'}
        </span>
        <button
          onClick={handleRescan}
          disabled={isScanning}
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: isScanning ? 'var(--text-tertiary)' : 'var(--accent)',
            background: 'none',
            border: 'none',
            cursor: isScanning ? 'default' : 'pointer',
            padding: '2px 0',
            fontFamily: 'inherit',
            transition: 'color 120ms ease',
          }}
        >
          {isScanning ? '...' : '↻ Re-scan'}
        </button>
      </div>
    </div>
  )
}
