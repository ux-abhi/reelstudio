import { NextRequest, NextResponse } from 'next/server'
import { ApifyClient } from 'apify-client'
import Groq from 'groq-sdk'
import { kv, KV_KEYS, KV_TTL } from '@/lib/kv'
import { CompetitorAnalysis } from '@/types/scan'
import { buildCompetitorPrompt } from '@/lib/prompts/competitorAnalysis'
import { parseGroqJson } from '@/lib/scan'
import { GROQ_MODEL } from '@/lib/groq'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { handle, forceRefresh = false } = await req.json()
    const cleanHandle = (handle as string).replace('@', '').toLowerCase()
    const cacheKey = KV_KEYS.apifyCompetitor(cleanHandle)

    if (!forceRefresh) {
      const cached = await kv.get<CompetitorAnalysis>(cacheKey)
      if (cached) return NextResponse.json(cached)
    }

    if (!process.env.APIFY_TOKEN) {
      return NextResponse.json({ error: 'APIFY_TOKEN not configured' }, { status: 503 })
    }

    const client = new ApifyClient({ token: process.env.APIFY_TOKEN })

    // Scrape profile + posts in parallel
    const [profileRun, postsRun] = await Promise.all([
      client.actor('apify/instagram-profile-scraper').call({
        usernames: [cleanHandle],
      }),
      client.actor('apify/instagram-post-scraper').call({
        directUrls: [`https://www.instagram.com/${cleanHandle}/`],
        resultsType: 'posts',
        resultsLimit: 20,
      }),
    ])

    const [{ items: profileItems }, { items: postItems }] = await Promise.all([
      client.dataset(profileRun.defaultDatasetId).listItems(),
      client.dataset(postsRun.defaultDatasetId).listItems(),
    ])

    const rawProfile = profileItems[0] as Record<string, unknown> | undefined
    const profileContext = rawProfile
      ? JSON.stringify({
          handle: rawProfile.username,
          name: rawProfile.fullName,
          bio: rawProfile.biography,
          followers: rawProfile.followersCount,
          following: rawProfile.followingCount,
          postCount: rawProfile.postsCount,
          isVerified: rawProfile.verified,
        })
      : `handle: ${cleanHandle} (profile unavailable)`

    const postsContext = JSON.stringify(
      postItems.slice(0, 20).map((p: Record<string, unknown>) => ({
        caption: (p.caption as string)?.slice(0, 200),
        likes: p.likesCount,
        comments: p.commentsCount,
        type: p.type,
        timestamp: p.timestamp,
      }))
    )

    // Fetch trends for context
    let trendsData = '[]'
    try {
      const trendsRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/trends`
      )
      trendsData = JSON.stringify(await trendsRes.json())
    } catch {
      // ignore
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const prompt = buildCompetitorPrompt(
      cleanHandle,
      `PROFILE: ${profileContext}\n\nRECENT POSTS: ${postsContext}`,
      trendsData
    )

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const analysis = parseGroqJson<CompetitorAnalysis>(raw)
    analysis.scrapedAt = new Date().toISOString()

    await kv.set(cacheKey, analysis, { ex: KV_TTL.competitor })
    return NextResponse.json(analysis)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Competitor analysis failed'
    console.error('Apify competitor error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
