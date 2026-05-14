import Link from 'next/link'

export function EmptyState({
  title,
  description,
  actionLabel = 'Run scan',
  actionHref = '/onboarding',
}: {
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
}) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-20 px-6"
      style={{ minHeight: 320 }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: 'rgba(110,106,255,0.10)',
          border: '0.5px solid rgba(110,106,255,0.20)',
          fontSize: 22,
        }}
      >
        ⚡
      </div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'rgba(255,255,255,0.80)' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm mb-6 max-w-xs"
          style={{ color: 'rgba(255,255,255,0.40)' }}
        >
          {description}
        </p>
      )}
      <Link
        href={actionHref}
        className="text-sm font-medium px-5 py-2.5 rounded-full transition-all"
        style={{
          background: '#6e6aff',
          color: '#fff',
        }}
      >
        {actionLabel}
      </Link>
    </div>
  )
}
