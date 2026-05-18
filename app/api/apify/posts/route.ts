import { NextRequest, NextResponse } from 'next/server'
import { ApifyClient } from 'apify-client'
import { getUser } from '@/lib/supabase/server'
import { getApifyCache, setApifyCache } from '@/lib/db'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const APIFY_TTL = 60 * 60 * 24

export interface RawApifyPost {
  id: string
  timestamp: string
  caption: string
  likesCount: number
  commentsCount: number
  type: string
  url: string
  hashtags: string[]
  mentions: string[]
  isSponsored: boolean
  videoViewCount?: number
  videoPlayCount?: number
  displayUrl?: string
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { handle, forceRefresh = false } = await req.json()
    const cleanHandle = (handle as string).replace('@', '').toLowerCase()
    const cacheKey = `apify:posts:${cleanHandle}`

    if (!forceRefresh) {
      const cached = await getApifyCache<RawApifyPost[]>(cacheKey)
      if (cached) return NextResponse.json(cached)
    }

    if (!process.env.APIFY_TOKEN) {
      return NextResponse.json({ error: 'APIFY_TOKEN not configured' }, { status: 503 })
    }

    const client = new ApifyClient({ token: process.env.APIFY_TOKEN })
    const run = await client.actor('apify/instagram-post-scraper').call({
      directUrls: [`https://www.instagram.com/${cleanHandle}/`],
      resultsType: 'posts',
      resultsLimit: 30,
    })

    const { items } = await client.dataset(run.defaultDatasetId).listItems()
    const posts: RawApifyPost[] = items.map((raw: Record<string, unknown>) => ({
      id: (raw.id as string) ?? (raw.shortCode as string) ?? '',
      timestamp: (raw.timestamp as string) ?? '',
      caption: (raw.caption as string) ?? '',
      likesCount: (raw.likesCount as number) ?? 0,
      commentsCount: (raw.commentsCount as number) ?? 0,
      type: (raw.type as string) ?? 'image',
      url: (raw.url as string) ?? '',
      hashtags: (raw.hashtags as string[]) ?? extractHashtags((raw.caption as string) ?? ''),
      mentions: (raw.mentions as string[]) ?? [],
      isSponsored: (raw.isSponsored as boolean) ?? false,
      videoViewCount: (raw.videoViewCount as number) ?? undefined,
      videoPlayCount: (raw.videoPlayCount as number) ?? undefined,
      displayUrl: (raw.displayUrl as string) ?? undefined,
    }))

    await setApifyCache(cacheKey, posts, APIFY_TTL)
    return NextResponse.json(posts)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Posts scrape failed'
    console.error('Apify posts error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function extractHashtags(caption: string): string[] {
  return (caption.match(/#[\wऀ-ॿ]+/g) ?? []).map(t => t.slice(1))
}
