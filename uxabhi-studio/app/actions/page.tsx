'use client'

import { useState, useEffect } from 'react'
import { useScan } from '@/components/scan/ScanContext'
import { EmptyState } from '@/components/shared/EmptyState'

const MONTHLY_NON_NEGOTIABLES = [
  'Post minimum 12 times (3x/week)',
  'Analyse top 3 posts — identify what made them work',
  'DM 5 new people in your niche (no pitch, just genuine reply)',
  'Try 1 new format you\'ve never done before',
  'Update your bio based on what\'s resonating this month',
]

const COLLAB_TARGETS = [
  { handle: '@uxwithjanelle', reason: 'Career UX overlap, complementary audiences, no direct competition', score: '9/10' },
  { handle: '@mizko', reason: 'Figma + design tools niche, you cover Indian market she doesn\'t reach', score: '8/10' },
  { handle: '@femke.design', reason: 'Process content alignment, different geo = no audience cannibalisation', score: '8/10' },
  { handle: '@uibreakfast', reason: 'Educational formats match, good for cross-promotional carousel series', score: '7/10' },
  { handle: '@adhamdannaway', reason: 'Bridges tools + career like you do, India angle differentiates you', score: '7/10' },
]

const URGENCY_COLORS = {
  'do first': { bg: 'rgba(255,69,58,0.12)', color: '#FF453A', border: 'rgba(255,69,58,0.25)', dot: '#FF453A' },
  'this week': { bg: 'rgba(255,214,10,0.10)', color: '#FFD60A', border: 'rgba(255,214,10,0.20)', dot: '#FFD60A' },
  'this month': { bg: 'rgba(52,199,89,0.12)', color: '#34C759', border: 'rgba(52,199,89,0.25)', dot: '#34C759' },
}

const STORAGE_KEY = 'uxabhi:action_checks'

function loadChecks(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

export default function ActionsPage() {
  const { scan } = useScan()
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const [activeFilter, setActiveFilter] = useState<'all' | 'do first' | 'this week' | 'this month'>('all')

  useEffect(() => { setChecks(loadChecks()) }, [])

  function toggle(key: string) {
    const updated = { ...checks, [key]: !checks[key] }
    setChecks(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  if (!scan) {
    return (
      <div className="page-enter p-6 md:p-10 min-h-screen">
        <EmptyState
          title="No actions yet"
          description="Run a scan to generate your personalised priority action list."
          actionLabel="Go to Dashboard"
          actionHref="/dashboard"
        />
      </div>
    )
  }

  const actions = scan.priorityActions || []
  const filtered = activeFilter === 'all' ? actions : actions.filter(a => a.urgency === activeFilter)
  const doneCount = actions.filter(a => checks[a.action]).length

  return (
    <div className="page-enter p-6 md:p-10 min-h-screen max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[rgba(255,255,255,0.92)] mb-1">Priority Actions</h1>
        <p className="text-sm text-[rgba(255,255,255,0.45)]">
          {doneCount}/{actions.length} completed — your personalised growth checklist
        </p>
      </div>

      {/* Progress bar */}
      {actions.length > 0 && (
        <div className="mb-6">
          <div className="bar-track mb-1.5">
            <div
              className="bar-fill bar-accent"
              style={{ width: `${Math.round((doneCount / actions.length) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-[rgba(255,255,255,0.35)]">{Math.round((doneCount / actions.length) * 100)}% complete</p>
        </div>
      )}

      {/* Urgency filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'do first', 'this week', 'this month'] as const).map(f => {
          const col = f === 'all' ? null : URGENCY_COLORS[f]
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: activeFilter === f ? (col?.bg || 'rgba(110,106,255,0.15)') : 'rgba(255,255,255,0.05)',
                color: activeFilter === f ? (col?.color || '#8480ff') : 'rgba(255,255,255,0.50)',
                border: activeFilter === f
                  ? `0.5px solid ${col?.border || 'rgba(110,106,255,0.35)'}`
                  : '0.5px solid rgba(255,255,255,0.08)',
              }}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          )
        })}
      </div>

      {/* Action list */}
      <div className="space-y-2 mb-10">
        {filtered.map((action, i) => {
          const done = !!checks[action.action]
          const urg = URGENCY_COLORS[action.urgency] || URGENCY_COLORS['this month']
          return (
            <button
              key={i}
              onClick={() => toggle(action.action)}
              className="w-full text-left card flex items-start gap-3 transition-all"
              style={{
                opacity: done ? 0.5 : 1,
                background: done ? 'rgba(255,255,255,0.02)' : undefined,
              }}
            >
              {/* Checkbox */}
              <div
                className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full flex items-center justify-center border transition-all"
                style={{
                  background: done ? 'rgba(52,199,89,0.20)' : 'transparent',
                  borderColor: done ? '#34C759' : 'rgba(255,255,255,0.20)',
                }}
              >
                {done && <span className="text-[10px] text-[#34C759]">✓</span>}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-[10px] text-[rgba(255,255,255,0.40)]">{action.day}</span>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: urg.bg, color: urg.color, border: `0.5px solid ${urg.border}` }}
                  >
                    {action.urgency}
                  </span>
                </div>
                <p className={`text-sm font-medium mb-0.5 ${done ? 'line-through text-[rgba(255,255,255,0.30)]' : 'text-[rgba(255,255,255,0.85)]'}`}>
                  {action.action}
                </p>
                <p className="text-xs text-[rgba(255,255,255,0.40)]">{action.impact}</p>
              </div>
            </button>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-[rgba(255,255,255,0.35)] text-sm">
            No actions for this filter.
          </div>
        )}
      </div>

      {/* Monthly non-negotiables */}
      <div className="card mb-8">
        <p className="text-sm font-semibold text-[rgba(255,255,255,0.80)] mb-4">Monthly non-negotiables</p>
        <div className="space-y-2">
          {MONTHLY_NON_NEGOTIABLES.map((item, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-[rgba(255,255,255,0.05)] last:border-0">
              <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(110,106,255,0.15)', color: '#8480ff' }}
              >
                {i + 1}
              </span>
              <p className="text-sm text-[rgba(255,255,255,0.65)]">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Collab targets */}
      <div className="card">
        <p className="text-sm font-semibold text-[rgba(255,255,255,0.80)] mb-4">Collab targets</p>
        <div className="space-y-3">
          {COLLAB_TARGETS.map((target, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(110,106,255,0.12)', color: '#8480ff' }}
              >
                #{i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-[rgba(255,255,255,0.80)]">{target.handle}</span>
                  <span className="text-xs text-[rgba(255,255,255,0.35)]">Score: {target.score}</span>
                </div>
                <p className="text-xs text-[rgba(255,255,255,0.50)]">{target.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
