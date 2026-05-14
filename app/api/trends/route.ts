import { NextResponse } from 'next/server'
import { kv, KV_KEYS, KV_TTL } from '@/lib/kv'
import { fetchTrend, TREND_KEYWORDS, TrendResult } from '@/lib/trends'

export async function GET() {
  try {
    const cached = await kv.get<TrendResult[]>(KV_KEYS.trends)
    if (cached) {
      return NextResponse.json(cached)
    }

    const results = await Promise.allSettled(
      TREND_KEYWORDS.map(fetchTrend)
    )

    const trends = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<TrendResult>).value)

    await kv.set(KV_KEYS.trends, trends, { ex: KV_TTL.trends })

    return NextResponse.json(trends)
  } catch (error) {
    console.error('Trends error:', error)
    const stale = await kv.get<TrendResult[]>(KV_KEYS.trends)
    if (stale) return NextResponse.json(stale)
    return NextResponse.json([], { status: 200 })
  }
}
