import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  label?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, label, action }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
      paddingBottom: 24,
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div>
        {label && (
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: 6,
          }}>
            {label}
          </p>
        )}
        <h1 style={{
          fontSize: 26,
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            marginTop: 5,
            lineHeight: 1.5,
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div style={{ flexShrink: 0, paddingTop: label ? 20 : 2 }}>
          {action}
        </div>
      )}
    </div>
  )
}
