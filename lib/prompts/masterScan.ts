export function buildMasterScanPrompt(
  profileData: string,
  postsData: string,
  trendsData: string,
  tomorrowDate: string,
  schema: string
): string {
  return `You are an Instagram growth strategist analysing the account @uxabhi_ (Abhishek Jha).

FIXED PROFILE CONTEXT (always true):
- Handle: @uxabhi_ | UX & Web Designer | M.Sc HCI student, Germany
- Originally from India | Speaks Hindi/Hinglish naturally
- Skills: Figma, Framer, Claude AI, Google AI Studio, vibe coding, Chrome extensions
- Niche: UX design + AI tools + Framer + HCI research + Indian designer in Europe
- Tone: casual, direct, like texting a design friend — never corporate
- Viral formula: screen recording + practical shortcut + comment trigger
  (Jun 2024: 2,100 likes / 1,900 comments using this formula)
- Highest engagement format: Hindi/Hinglish rant (7.2% — double niche average)
- Top 5 competitors: @jitu.ux 80K, @ux.wheee 25K, @thedesignely 35K,
  @designbyjav 20K, @uthinhpham 30K
- Whitespace opportunities: Hindi/Hinglish UX education, Indian designer in Europe POV,
  HCI research simplified, Framer + Claude workflow, builder midnight log series

LIVE ACCOUNT PROFILE:
${profileData}

LIVE RECENT POSTS (last 30, chronological):
${postsData}

LIVE GOOGLE TRENDS DATA (this week):
${trendsData}

Analyse everything above and return a complete JSON object.
Calendar starts from tomorrow: ${tomorrowDate}

Rules:
- Every recommendation must reference SPECIFIC posts from the account data above
- Every content idea must reference SPECIFIC trending keywords from the trends data
- Be specific: not "post a tool tutorial" but "post the Framer + Claude workflow —
  framer is up 34% this week and you have not posted Framer content in 14 days"
- Generate exactly 20 ideas, 20 hooks (5 per type), 30 calendar days, 6 trigger words,
  5 pillars, 7 priority actions
- All ideas ranked by trendScore (0-100) based on trends data
- For posts analysis: set tier 1 for top 20% by engagement, tier 2 for middle 60%, tier 3 for bottom 20%
- Detect post format from the type field: video→Reel, carousel→Carousel, image→Image, sidecar→Carousel
- Return ONLY valid JSON matching this schema. No explanation. No markdown.

SCHEMA:
${schema}`
}
