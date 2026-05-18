import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { ApifyClient } from 'apify-client'
import { getUser } from '@/lib/supabase/server'
import { getScanResult, setScanResult, setApifyCache, getTrendsCache, setTrendsCache, getUserContext } from '@/lib/db'
import { buildMasterScanPrompt } from '@/lib/prompts/masterScan'
import { buildScanSchema, parseGroqJson, buildTomorrowDate, validateScanResult } from '@/lib/scan'
import { ScanResult, InstagramProfile, ProfileInput } from '@/types/scan'
import { GROQ_MODEL } from '@/lib/groq'
import { fetchTrend, TREND_KEYWORDS, TrendResult } from '@/lib/trends'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const APIFY_TTL = 60 * 60 * 24

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  try {
    const body = await req.json()
    const { handle, profileInput, forceRefresh = false } = body as {
      handle?: string
      profileInput?: ProfileInput
      forceRefresh?: boolean
    }

    if (!forceRefresh) {
      const cached = await getScanResult(user.id)
      if (cached) return NextResponse.json(cached)
    }

    const tomorrowDate = buildTomorrowDate()
    const schema = buildScanSchema()
    const userContext = await getUserContext(user.id)

    const useApify = !!(process.env.APIFY_TOKEN && handle)
    let profileData = ''
    let postsData = ''
    let trendsData = '[]'
    let instagramProfile: InstagramProfile | undefined

    if (useApify) {
      const cleanHandle = handle!.replace('@', '').toLowerCase()
      const client = new ApifyClient({ token: process.env.APIFY_TOKEN })

      const [profileRun, postsRun, trendsResult] = await Promise.allSettled([
        client.actor('apify/instagram-profile-scraper').call({ usernames: [cleanHandle] }),
        client.actor('apify/instagram-scraper').call({
          directUrls: [`https://www.instagram.com/${cleanHandle}/`],
          resultsType: 'posts',
          resultsLimit: 30,
        }),
        fetchTrends(),
      ])

      if (profileRun.status === 'rejected') console.error('[Apify] Profile scraper failed:', profileRun.reason)
      if (postsRun.status === 'rejected') console.error('[Apify] Post scraper failed:', postsRun.reason)
      if (trendsResult.status === 'rejected') console.error('[Apify] Trends failed:', trendsResult.reason)

      if (profileRun.status === 'fulfilled') {
        const { items } = await client.dataset(profileRun.value.defaultDatasetId).listItems()
        const raw = items[0] as Record<string, unknown> | undefined
        if (raw) {
          instagramProfile = {
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
          profileData = JSON.stringify(instagramProfile)
          await setApifyCache(`apify:profile:${cleanHandle}`, instagramProfile, APIFY_TTL)
        }
      }

      if (postsRun.status === 'fulfilled') {
        const { items } = await client.dataset(postsRun.value.defaultDatasetId).listItems()
        const rawPosts = items.map((p: Record<string, unknown>) => ({
          id: (p.id as string) ?? (p.shortCode as string) ?? '',
          timestamp: p.timestamp,
          caption: (p.caption as string)?.slice(0, 500) ?? '',
          likesCount: p.likesCount,
          commentsCount: p.commentsCount,
          type: p.type,
          url: p.url,
          hashtags: (p.hashtags as string[]) ?? [],
          videoViewCount: (p.videoViewCount as number) ?? undefined,
          videoPlayCount: (p.videoPlayCount as number) ?? undefined,
          location: (p.locationName as string) ?? (p.location as string) ?? undefined,
          topComments: (p.latestComments as Array<{text: string; ownerUsername: string; likesCount: number}>)
            ?.slice(0, 3)
            .map(c => `"${c.text}" — @${c.ownerUsername} (${c.likesCount ?? 0} likes)`) ?? [],
        }))
        postsData = JSON.stringify(rawPosts)
        await setApifyCache(`apify:posts:${cleanHandle}`, items, APIFY_TTL)
      }

      if (trendsResult.status === 'fulfilled') {
        trendsData = JSON.stringify(trendsResult.value)
      }

      if (!profileData) profileData = handle ? `{ "handle": "${handle}" }` : '{}'
      if (!postsData) postsData = '[]'
    } else {
      profileData = JSON.stringify(profileInput ?? {})
      postsData = JSON.stringify((profileInput as ProfileInput & { posts?: unknown[] })?.posts ?? [])
      try { trendsData = JSON.stringify(await fetchTrends()) } catch (e) { console.error('[Trends] fetch failed:', e) }
    }

    const prompt = buildMasterScanPrompt(profileData, postsData, trendsData, tomorrowDate, schema, userContext?.masterDocSummary)

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 8000,
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const scanResult = parseGroqJson<ScanResult>(raw)

    if (!validateScanResult(scanResult)) {
      throw new Error('Invalid scan result structure from Groq')
    }

    scanResult.scannedAt = new Date().toISOString()
    scanResult.handle = handle ?? profileInput?.handle ?? ''
    if (instagramProfile) scanResult.instagramProfile = instagramProfile
    if (profileInput) scanResult.profileInput = profileInput

    await setScanResult(user.id, scanResult)
    return NextResponse.json(scanResult)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Scan failed'
    console.error('Scan error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function fetchTrends(): Promise<TrendResult[]> {
  const cached = await getTrendsCache()
  if (cached) return cached as TrendResult[]
  const results = await Promise.allSettled(TREND_KEYWORDS.map(fetchTrend))
  const trends = results
    .filter(r => r.status === 'fulfilled')
    .map(r => (r as PromiseFulfilledResult<TrendResult>).value)
  await setTrendsCache(trends)
  return trends
}
