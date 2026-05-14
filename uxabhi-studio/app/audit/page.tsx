'use client'
import { useState, useEffect } from 'react'
import { useScan } from '@/components/scan/ScanContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { Post } from '@/types/scan'

export default function AuditPage() {
  const { scan, isScanning } = useScan()
  const [barWidths, setBarWidths] = useState(false)

  useEffect(() => { setTimeout(() => setBarWidths(true), 150) }, [])

  if (isScanning) return (
    <div className="page-enter flex flex-col gap-4">
      {[1,2,3].map(i => <SkeletonCard key={i} lines={4} />)}
    </div>
  )
  if (!scan) return <EmptyState title="No audit data" description="Run your scan to see your full account health analysis." />

  const { accountHealth, posts, bioFix, hashtagClusters } = scan
  const sortedPosts = [...(posts ?? [])].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))

  const engRate = parseFloat(accountHealth?.engagementRate ?? '0')
  const engBarClass = engRate >= 5 ? 'bar-good' : engRate >= 3 ? 'bar-medium' : 'bar-low'
  const bioScore = accountHealth?.bioScore ?? 0

  return (
    <div className="page-enter flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.92)' }}>Account Audit</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>Your real account health, analysed by Groq</p>
        <hr className="divider mt-4" />
      </div>

      {/* Health bars */}
      {accountHealth && (
        <section className="card flex flex-col gap-5">
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)' }}>Health Metrics</p>
          <HealthBar label="Engagement Rate" value={accountHealth.engagementRate} barClass={engBarClass} pct={Math.min(engRate * 10, 100)} animate={barWidths} verdict={accountHealth.engagementVerdict} />
          <HealthBar label="Bio Score" value={`${bioScore}/10`} barClass={bioScore >= 7 ? 'bar-good' : bioScore >= 4 ? 'bar-medium' : 'bar-low'} pct={bioScore * 10} animate={barWidths} verdict={accountHealth.bioIssues?.join(' · ') ?? ''} />
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>Top Format</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.70)' }}>{accountHealth.topPerformingFormat}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>Weakest Format</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>{accountHealth.weakestFormat}</span>
            </div>
          </div>
          <div>
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>Posting Cadence: </span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.70)' }}>{accountHealth.postingCadence}</span>
          </div>
        </section>
      )}

      {/* Bio fix */}
      {bioFix && (
        <section>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)', marginBottom: 12 }}>Bio Fix</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card" style={{ border: '0.5px solid rgba(255,69,58,0.20)', background: 'rgba(255,69,58,0.05)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#FF453A', letterSpacing: '0.04em' }}>CURRENT</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{bioFix.current}</p>
              {bioFix.issues?.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1">
                  {bioFix.issues.map((issue, i) => (
                    <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: '#FF453A' }}>
                      <span>×</span>{issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card" style={{ border: '0.5px solid rgba(52,199,89,0.20)', background: 'rgba(52,199,89,0.05)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#34C759', letterSpacing: '0.04em' }}>RECOMMENDED</p>
              <p className="text-sm whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.80)', lineHeight: 1.7 }}>{bioFix.recommended}</p>
            </div>
          </div>
        </section>
      )}

      {/* Posts table */}
      {sortedPosts.length > 0 && (
        <section>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)', marginBottom: 12 }}>All Posts</p>
          <div className="rounded-2xl overflow-hidden" style={{ border: '0.5px solid rgba(255,255,255,0.09)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                  {['Post', 'Date', 'Likes', 'Comments', 'Tier', 'Hook', 'What worked'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedPosts.map((post: Post, i) => (
                  <tr key={post.id || i} style={{ borderBottom: i < sortedPosts.length - 1 ? '0.5px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.75)', maxWidth: 200 }}>{post.topic}</td>
                    <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.40)', fontSize: 12 }}>{post.date}</td>
                    <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.80)', fontWeight: 500 }}>{post.likes?.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.80)', fontWeight: 500 }}>{post.comments?.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={`badge badge-t${post.tier}`} style={{ padding: '2px 8px', borderRadius: 980, fontSize: 11, fontWeight: 600 }}>T{post.tier}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 11, color: post.hookStrength === 'strong' ? '#34C759' : post.hookStrength === 'medium' ? '#FFD60A' : 'rgba(255,255,255,0.35)' }}>
                        {post.hookStrength}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.45)', fontSize: 12, maxWidth: 200 }}>{post.whatWorked}</td>
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
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)', marginBottom: 12 }}>Hashtag Clusters</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Tool Tutorials', tags: hashtagClusters.toolTutorials },
              { label: 'Education / Student', tags: hashtagClusters.educationStudent },
              { label: 'Opinion / India', tags: hashtagClusters.opinionIndia },
            ].map(cluster => (
              <div key={cluster.label} className="card">
                <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.50)', letterSpacing: '0.04em' }}>{cluster.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(cluster.tags ?? []).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(110,106,255,0.10)', color: '#8480ff', border: '0.5px solid rgba(110,106,255,0.20)' }}>
                      {tag}
                    </span>
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

function HealthBar({ label, value, barClass, pct, animate, verdict }: { label: string; value: string; barClass: string; pct: number; animate: boolean; verdict: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.70)' }}>{label}</span>
        <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>{value}</span>
      </div>
      <div className="bar-track">
        <div className={`bar-fill ${barClass}`} style={{ width: animate ? `${pct}%` : '0%' }} />
      </div>
      {verdict && <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{verdict}</p>}
    </div>
  )
}
