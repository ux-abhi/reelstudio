'use client'
import { useState, useEffect } from 'react'
import { useScan } from '@/components/scan/ScanContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Post } from '@/types/scan'

export default function AuditPage() {
  const { scan, isScanning, isInitialLoad } = useScan()
  const [barWidths, setBarWidths] = useState(false)
  useEffect(() => { setTimeout(() => setBarWidths(true), 150) }, [])

  if (isScanning || isInitialLoad) return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1,2,3].map(i => <SkeletonCard key={i} lines={4} />)}
    </div>
  )
  if (!scan) return <EmptyState title="No audit data" description="Run your scan to see your full account health analysis." />

  const { accountHealth, posts, bioFix, hashtagClusters } = scan
  const sortedPosts = [...(posts ?? [])].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
  const engRate = parseFloat(String(accountHealth?.engagementRate ?? '0'))
  const engFill = engRate >= 5 ? 'good' : engRate >= 3 ? 'medium' : 'low'
  const bioScore = accountHealth?.bioScore ?? 0
  const bioFill  = bioScore >= 7 ? 'good' : bioScore >= 4 ? 'medium' : 'low'

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageHeader title="Account Audit" subtitle="Your real account health, analysed by Groq" />

      {/* Health metrics */}
      {accountHealth && (
        <section>
          <p className="section-label" style={{ marginBottom: 16 }}>Health Metrics</p>
          <div className="card" style={{ padding: '20px 24px' }}>
            <HealthBar label="Engagement Rate" value={String(accountHealth.engagementRate)} fill={engFill} pct={Math.min(engRate * 10, 100)} animate={barWidths} note={accountHealth.engagementVerdict} />
            <HealthBar label="Bio Score" value={`${bioScore}/10`} fill={bioFill} pct={bioScore * 10} animate={barWidths} note={accountHealth.bioIssues?.join(' · ') ?? ''} />
            <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-subtle)', marginTop: 8, display: 'flex', gap: 32 }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' as const, letterSpacing: '0.04em', fontWeight: 600, marginBottom: 4 }}>Top Format</p>
                <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{accountHealth.topPerformingFormat}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' as const, letterSpacing: '0.04em', fontWeight: 600, marginBottom: 4 }}>Weakest Format</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{accountHealth.weakestFormat}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' as const, letterSpacing: '0.04em', fontWeight: 600, marginBottom: 4 }}>Posting Cadence</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{accountHealth.postingCadence}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bio fix */}
      {bioFix && (
        <section>
          <p className="section-label" style={{ marginBottom: 16 }}>Bio Fix</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card" style={{ borderColor: 'rgba(229,72,77,0.25)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--red)', textTransform: 'uppercase' as const, marginBottom: 10 }}>Current</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{bioFix.current}</p>
              {bioFix.issues?.length > 0 && (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {bioFix.issues.map((issue, i) => (
                    <li key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--red)' }}>
                      <span>×</span>{issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card" style={{ borderColor: 'rgba(48,164,108,0.25)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--green)', textTransform: 'uppercase' as const, marginBottom: 10 }}>Recommended</p>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{bioFix.recommended}</p>
            </div>
          </div>
        </section>
      )}

      {/* Posts table */}
      {sortedPosts.length > 0 && (
        <section>
          <p className="section-label" style={{ marginBottom: 16 }}>All Posts</p>
          <div className="table-wrapper card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  {['Post', 'Date', 'Likes', 'Comments', 'Tier', 'Hook', 'What worked'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedPosts.map((post: Post, i) => (
                  <tr key={post.id || i}>
                    <td className="primary" style={{ maxWidth: 220 }}>{post.topic}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{post.date}</td>
                    <td className="primary">{post.likes?.toLocaleString()}</td>
                    <td className="primary">{post.comments?.toLocaleString()}</td>
                    <td><span className={`badge badge-t${post.tier}`}>T{post.tier}</span></td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 500, color: post.hookStrength === 'strong' ? 'var(--green)' : post.hookStrength === 'medium' ? 'var(--yellow)' : 'var(--text-tertiary)' }}>
                        {post.hookStrength}
                      </span>
                    </td>
                    <td style={{ maxWidth: 200, fontSize: 12 }}>{post.whatWorked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Hashtag clusters */}
      {hashtagClusters && (
        <section>
          <p className="section-label" style={{ marginBottom: 16 }}>Hashtag Clusters</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Tool Tutorials',     tags: hashtagClusters.toolTutorials },
              { label: 'Education / Student', tags: hashtagClusters.educationStudent },
              { label: 'Opinion / India',     tags: hashtagClusters.opinionIndia },
            ].map(cluster => (
              <div key={cluster.label} className="card">
                <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 12 }}>{cluster.label}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(cluster.tags ?? []).map(tag => (
                    <span key={tag} className="tag tag-toolbox" style={{ fontSize: 11 }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function HealthBar({ label, value, fill, pct, animate, note }: { label: string; value: string; fill: string; pct: number; animate: boolean; note: string }) {
  return (
    <div className="health-row">
      <span className="health-label">{label}</span>
      <div className="health-track">
        <div className={`health-fill ${fill}`} style={{ width: animate ? `${pct}%` : '0%' }} />
      </div>
      <span className="health-value">{value}</span>
      {note && <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 8, flex: 1 }}>{note}</span>}
    </div>
  )
}
