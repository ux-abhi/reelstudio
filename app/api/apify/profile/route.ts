import { NextRequest, NextResponse } from 'next/server'
import { ApifyClient } from 'apify-client'
import { getUser } from '@/lib/supabase/server'
import { getApifyCache, setApifyCache } from '@/lib/db'
import { InstagramProfile } from '@/types/scan'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const APIFY_TTL = 60 * 60 * 24

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { handle, forceRefresh = false } = await req.json()
    const cleanHandle = (handle as string).replace('@', '').toLowerCase()
    const cacheKey = `apify:profile:${cleanHandle}`

    if (!forceRefresh) {
      const cached = await getApifyCache<InstagramProfile>(cacheKey)
      if (cached) return NextResponse.json(cached)
    }

    if (!process.env.APIFY_TOKEN) {
      return NextResponse.json({ error: 'APIFY_TOKEN not configured' }, { status: 503 })
    }

    const client = new ApifyClient({ token: process.env.APIFY_TOKEN })
    const run = await client.actor('apify/instagram-profile-scraper').call({ usernames: [cleanHandle] })
    const { items } = await client.dataset(run.defaultDatasetId).listItems()

    if (!items.length) {
      return NextResponse.json({ error: 'Profile not found on Instagram' }, { status: 404 })
    }

    const raw = items[0] as Record<string, unknown>
    const profile: InstagramProfile = {
      handle: (raw.username as string) ?? cleanHandle,
      name: (raw.fullName as string) ?? '',
      bio: (raw.biography as string) ?? '',
      followers: (raw.followersCount as number) ?? 0,
      following: (raw.followingCount as number) ?? 0,
      postCount: (raw.postsCount as number) ?? 0,
      isVerified: (raw.verified as boolean) ?? false,
      profilePicUrl: (raw.profilePicUrl as string) ?? undefined,
      category: (raw.businessCategoryName as string) ?? (raw.category as string) ?? undefined,
      website: (raw.externalUrl as string) ?? (raw.website as string) ?? undefined,
    }

    await setApifyCache(cacheKey, profile, APIFY_TTL)
    return NextResponse.json(profile)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Profile scrape failed'
    console.error('Apify profile error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
