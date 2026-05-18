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
Fields: handle, name, bio, followers, following, postCount, isVerified, category (Creator/Business/Personal), website

LIVE RECENT POSTS (last 30, most recent first):
${postsData}
Fields per post: id, timestamp, caption (up to 500 chars), likesCount, commentsCount, type (Image/Video/Sidecar),
hashtags[], videoViewCount (reels), videoPlayCount (reels), location (tagged location),
topComments[] (top 3 comment texts + authors — use these to understand audience sentiment and what questions arise)

LIVE GOOGLE TRENDS DATA (this week):
${trendsData}

Analyse everything above and return a complete JSON object.
Calendar starts from tomorrow: ${tomorrowDate}

Rules:
- Base ALL recommendations on the actual account data provided above
- Infer the creator's niche, tone, and audience from their actual bio, posts, captions, and top comments
- Use videoViewCount and videoPlayCount to assess reel performance separately from image/carousel performance
- Use topComments to understand what topics drive conversation and what questions the audience asks
- Use location data to identify local vs global content angles where relevant
- Use the website field to understand the creator's off-Instagram goals (course, portfolio, product, etc.)
- Use the category field to understand account type (Creator, Business, Personal)
- Every recommendation must reference SPECIFIC posts or engagement patterns from the data above
- Every content idea must reference SPECIFIC trending keywords from the trends data
- Be specific: name exact topics based on the creator's actual content history
- Generate exactly 20 ideas, 20 hooks (5 per type), 30 calendar days, 6 trigger words, 5 pillars, 7 priority actions
- All ideas ranked by trendScore (0–100) based on trends data
- For posts analysis: tier 1 = top 20% by (likes + comments), tier 2 = middle 60%, tier 3 = bottom 20%
- For reels/videos: factor in videoViewCount when determining tier (views matter more than likes for reach)
- Detect post format from type field: video→Reel, carousel/Sidecar→Carousel, image→Image
- hashtagClusters.primary: 8–10 core niche hashtags (100K–1M posts) specific to this creator's content
- hashtagClusters.secondary: 8–10 broader topic hashtags (1M–5M posts) for reach
- hashtagClusters.niche: 8–10 long-tail micro hashtags (<100K posts) for targeted reach
- Return ONLY valid JSON matching this schema. No explanation. No markdown.

SCHEMA:
${schema}`
}
