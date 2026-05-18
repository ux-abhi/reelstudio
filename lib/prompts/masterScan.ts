export function buildMasterScanPrompt(
  profileData: string,
  postsData: string,
  trendsData: string,
  tomorrowDate: string,
  schema: string
): string {
  return `You are an Instagram growth strategist performing a comprehensive account analysis.

LIVE ACCOUNT PROFILE:
${profileData}

LIVE RECENT POSTS (last 30, chronological):
${postsData}

LIVE GOOGLE TRENDS DATA (this week):
${trendsData}

Analyse everything above and return a complete JSON object.
Calendar starts from tomorrow: ${tomorrowDate}

Rules:
- Base ALL recommendations on the actual account data provided above
- Infer the creator's niche, tone, and audience from their actual bio, posts, and engagement patterns
- Every recommendation must reference SPECIFIC posts from the account data above
- Every content idea must reference SPECIFIC trending keywords from the trends data
- Be specific: not "post a tutorial" but name the exact topic based on the creator's content patterns
- Generate exactly 20 ideas, 20 hooks (5 per type), 30 calendar days, 6 trigger words,
  5 pillars, 7 priority actions
- All ideas ranked by trendScore (0-100) based on trends data
- For posts analysis: set tier 1 for top 20% by engagement, tier 2 for middle 60%, tier 3 for bottom 20%
- Detect post format from the type field: video→Reel, carousel→Carousel, image→Image, sidecar→Carousel
- Return ONLY valid JSON matching this schema. No explanation. No markdown.

SCHEMA:
${schema}`
}
