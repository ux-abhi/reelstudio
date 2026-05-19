'use client'
import Link from 'next/link'
import { useScan } from '@/components/scan/ScanContext'

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
}) {
  const { hasProfile } = useScan()

  const href = actionHref ?? (hasProfile ? '/settings' : '/onboarding')
  const label = actionLabel ?? (hasProfile ? 'Re-scan account' : 'Run scan')

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px',
        minHeight: 320,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'var(--accent-subtle)',
          border: '1px solid var(--accent-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          fontSize: 18,
        }}
      >
        ◉
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 300, lineHeight: 1.6 }}>
          {description}
        </p>
      )}
      <Link href={href} className="btn-primary">
        {label}
      </Link>
    </div>
  )
}
