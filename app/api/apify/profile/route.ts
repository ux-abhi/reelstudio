import { NextRequest, NextResponse } from 'next/server'
import { ApifyClient } from 'apify-client'
import { kv, KV_KEYS, KV_TTL } from '@/lib/kv'
import { InstagramProfile } from '@/types/scan'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { handle, forceRefresh = false } = await req.json()
    const cleanHandle = (handle as string).replace('@', '').toLowerCase()

    if (!forceRefresh) {
      const cached = await kv.get<InstagramProfile>(KV_KEYS.apifyProfile)
      if (cached) return NextResponse.json(cached)
    }

    if (!process.env.APIFY_TOKEN) {
      return NextResponse.json({ error: 'APIFY_TOKEN not configured' }, { status: 503 })
    }

    const client = new ApifyClient({ token: process.env.APIFY_TOKEN })
    const run = await client.actor('apify/instagram-profile-scraper').call({
      usernames: [cleanHandle],
    })

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
    }

    await kv.set(KV_KEYS.apifyProfile, profile, { ex: KV_TTL.apify })
    return NextResponse.json(profile)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Profile scrape failed'
    console.error('Apify profile error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
