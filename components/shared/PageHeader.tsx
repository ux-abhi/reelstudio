export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.04em',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
          {subtitle}
        </p>
      )}
      <div className="divider" />
    </div>
  )
}
