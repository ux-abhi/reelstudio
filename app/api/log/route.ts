import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getUser } from '@/lib/supabase/server'
import { GROQ_MODEL } from '@/lib/groq'
import {
  buildLifeLogInstagramPrompt,
  buildLinkedInPostPrompt,
  buildLinkedInImagePrompt,
  INSTAGRAM_SYSTEM,
  LINKEDIN_SYSTEM,
} from '@/lib/prompts/contentWriter'
import type { LogTimeframe, InstagramLogPost, LinkedInLogPost } from '@/types/log'

export const dynamic = 'force-dynamic'

const LINKEDIN_TYPES: Array<'story' | 'insight' | 'progress'> = ['story', 'insight', 'progress']

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  try {
    const { rawInput, timeframe, who, brandContext, niche, trendingKeywords } = await req.json() as {
      rawInput: string
      timeframe: LogTimeframe
      who?: string
      brandContext?: string
      niche?: string
      trendingKeywords?: string
    }

    if (!rawInput?.trim()) {
      return NextResponse.json({ error: 'Tell me what happened first' }, { status: 400 })
    }

    const creatorWho = who ?? niche ?? 'content creator'
    const postCount  = timeframe === 'week' ? 3 : 1

    // ── Instagram ──────────────────────────────────────────────────────────────
    const igCompletion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: INSTAGRAM_SYSTEM },
        { role: 'user',   content: buildLifeLogInstagramPrompt({ rawInput, timeframe, who: creatorWho, brandContext, niche, trendingKeywords }) },
      ],
      max_tokens: 1200,
    })
    const igRaw = igCompletion.choices[0]?.message?.content ?? '[]'
    let instagram: InstagramLogPost[] = []
    try {
      instagram = JSON.parse(igRaw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim())
    } catch {
      instagram = []
    }

    // ── LinkedIn ───────────────────────────────────────────────────────────────
    const linkedinTypes = LINKEDIN_TYPES.slice(0, postCount)
    const linkedInPosts: LinkedInLogPost[] = []

    for (const type of linkedinTypes) {
      const liCompletion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: LINKEDIN_SYSTEM },
          {
            role: 'user',
            content: buildLinkedInPostPrompt({ rawInput, timeframe, postType: type, who: creatorWho, brandContext }),
          },
        ],
        max_tokens: 700,
      })
      const postText = liCompletion.choices[0]?.message?.content?.trim() ?? ''

      // Image prompt — separate call, small
      const imgCompletion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'user',
            content: buildLinkedInImagePrompt(postText, type, creatorWho, niche),
          },
        ],
        max_tokens: 250,
      })
      const imagePromptText = imgCompletion.choices[0]?.message?.content?.trim() ?? ''

      // Extract hook (first line), body, cta, hashtags from freeform text
      const lines = postText.split('\n').filter(l => l.trim())
      const hook  = lines[0] ?? ''
      const hashtagLine = lines.findLast(l => l.startsWith('#')) ?? ''
      const hashtags = hashtagLine.match(/#\w+/g) ?? []
      const bodyLines = lines.slice(1, lines.length - (hashtagLine ? 1 : 0))
      const ctaLine   = bodyLines.findLast(l => /\?|comment|share|reply|follow/i.test(l)) ?? bodyLines[bodyLines.length - 1] ?? ''
      const bodyText  = bodyLines.filter(l => l !== ctaLine).join('\n')

      linkedInPosts.push({
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} post`,
        hook,
        body: bodyText,
        cta: ctaLine,
        hashtags,
        basedOn: rawInput.slice(0, 80),
        imagePrompt: {
          prompt: imagePromptText,
          aspectRatio: '4:5',
          worksWellWith: ['DALL-E 3', 'Midjourney v6', 'Ideogram'],
        },
      })
    }

    return NextResponse.json({ timeframe, instagram, linkedin: linkedInPosts })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Generation failed'
    console.error('[Log API]', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
