// google-trends-api type declaration handled in types/google-trends-api.d.ts
// eslint-disable-next-line @typescript-eslint/no-require-imports
const googleTrends = require('google-trends-api')

export const TREND_KEYWORDS = [
  'content creator',
  'instagram growth',
  'social media strategy',
  'ai tools',
  'short form video',
  'personal brand',
  'instagram reels',
  'content marketing',
  'creator economy',
  'viral content',
  'digital marketing',
  'audience growth',
]

export interface TrendResult {
  keyword: string
  interest: number
  direction: 'rising' | 'falling' | 'stable'
  breakout: boolean
  relatedQueries: string[]
  contentOpportunity: string
}

export async function fetchTrend(keyword: string): Promise<TrendResult> {
  const raw = await googleTrends.interestOverTime({
    keyword,
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  })
  const parsed = JSON.parse(raw)
  const timeline = parsed?.default?.timelineData ?? []
  const values = timeline.map((d: { value: number[] }) => d.value[0])
  const latest = values[values.length - 1] ?? 0
  const prev = values[0] ?? 0
  const direction: 'rising' | 'falling' | 'stable' =
    latest > prev + 5 ? 'rising' : latest < prev - 5 ? 'falling' : 'stable'

  let relatedQueries: string[] = []
  try {
    const relatedRaw = await googleTrends.relatedQueries({ keyword })
    const relatedParsed = JSON.parse(relatedRaw)
    relatedQueries =
      relatedParsed?.default?.rankedList?.[0]?.rankedKeyword
        ?.slice(0, 5)
        ?.map((k: { query: string }) => k.query) ?? []
  } catch {
    // related queries are optional
  }

  return {
    keyword,
    interest: latest,
    direction,
    breakout: direction === 'rising' && latest > 70,
    relatedQueries,
    contentOpportunity: '',
  }
}
