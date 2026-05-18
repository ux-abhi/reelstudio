import { NextResponse } from 'next/server'
import { getTrendsCache, setTrendsCache } from '@/lib/db'
import { fetchTrend, TREND_KEYWORDS, TrendResult } from '@/lib/trends'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cached = await getTrendsCache()
    if (cached) return NextResponse.json(cached)

    const results = await Promise.allSettled(TREND_KEYWORDS.map(fetchTrend))
    const trends = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<TrendResult>).value)

    await setTrendsCache(trends)
    return NextResponse.json(trends)
  } catch (error) {
    console.error('Trends error:', error)
    const stale = await getTrendsCache()
    if (stale) return NextResponse.json(stale)
    return NextResponse.json([], { status: 200 })
  }
}
