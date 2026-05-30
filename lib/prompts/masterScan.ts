import type { MasterDocSummary } from '@/lib/db'

const CALENDAR_COUNT: Record<string, string> = {
  '1×/week': '4–5',
  '3×/week': '12–14',
  '5×/week': '20–22',
  'Daily':   '28–30',
}

export function buildMasterScanPrompt(
  profileData: string,
  postsData: string,
  trendsData: string,
  tomorrowDate: string,
  schema: string,
  masterDoc?: MasterDocSummary,
  postingGoal?: string,
  niche?: string
): string {
  const docSection = masterDoc ? `
CREATOR'S BRAND DOCUMENT (uploaded by user — use this to calibrate ALL recommendations):
Niche: ${masterDoc.niche}
Tone: ${masterDoc.tone}
Target Audience: ${masterDoc.targetAudience}
Key Topics: ${masterDoc.keyTopics?.join(', ')}
Unique Angles: ${masterDoc.uniqueAngles?.join(' | ')}
Goals: ${masterDoc.contentGoals?.join(', ')}
` : ''

  const nicheSection = !masterDoc && niche ? `
CREATOR'S DECLARED NICHE: ${niche}
` : ''

  const goal = postingGoal ?? '3×/week'
  const calendarCount = CALENDAR_COUNT[goal] ?? '12–14'

  return `You are an Instagram growth strategist performing a comprehensive account analysis.
${docSection}${nicheSection}
LIVE ACCOUNT PROFILE:
${profileData}
Fields: handle, name, bio, followers, following, postCount, isVerified, category (Creator/Business/Personal), website

LIVE RECENT POSTS (last 30, most recent first):
${postsData}
Fields per post: id, timestamp, caption (up to 500 chars), likesCount, commentsCount, type (Image/Video/Sidecar),
hashtags[], videoViewCount (reels), videoPlayCount (reels), location (tagged location),
topComments[] (top 3 comment texts + authors — use to understand audience sentiment and recurring questions)

LIVE GOOGLE TRENDS DATA (this week):
${trendsData}

Analyse everything above and return a complete JSON object.
Calendar starts from tomorrow: ${tomorrowDate}

Rules:
- Base ALL recommendations on the actual account data above
${masterDoc
  ? '- The Brand Document overrides any inferences — if niche/tone/audience is specified there, use it exactly'
  : niche
    ? `- The creator's declared niche is "${niche}" — use this as the primary lens. Validate and enrich it against their actual posts, bio, and captions`
    : '- Infer the creator\'s niche, tone, and audience from their actual bio, posts, captions, and top comments'
}
- Use videoViewCount/videoPlayCount to assess reel performance separately from image/carousel performance
- Use topComments to understand what topics drive conversation and what questions the audience asks
- Use location data to identify local vs global content angles where relevant
- Use the website field to understand the creator's off-Instagram goals (course, portfolio, product, etc.)
- Use the category field to understand account type (Creator, Business, Personal)
- Every recommendation must reference SPECIFIC posts or engagement patterns from the data above
- Every content idea must reference SPECIFIC trending keywords from the trends data
- Be specific: name exact topics based on the creator's actual content history
- The creator's posting goal is ${goal} — generate exactly ${calendarCount} calendar entries spread across the 30-day window, evenly spaced to match this cadence
- Generate exactly 15 ideas, 12 hooks (3 per type), 6 trigger words, 5 pillars, 7 priority actions
- All ideas ranked by trendScore (0–100) based on trends data
- For posts analysis: tier 1 = top 20% by (likes + comments), tier 2 = middle 60%, tier 3 = bottom 20%
- For reels/videos: factor in videoViewCount when determining tier (views matter more than likes for reach)
- Detect post format from type field: video→Reel, carousel/Sidecar→Carousel, image→Image
- hashtagClusters.primary: 8–10 core niche hashtags (100K–1M posts) specific to this creator's content${niche ? ` — must reflect the "${niche}" niche` : ''}
- hashtagClusters.secondary: 8–10 broader topic hashtags (1M–5M posts) for reach
- hashtagClusters.niche: 8–10 long-tail micro hashtags (<100K posts) for targeted reach${niche ? ` — hyper-specific to "${niche}"` : ''}
- Return ONLY valid JSON matching this schema. No explanation. No markdown.

SCHEMA:
${schema}`
}
