export function buildCompetitorPrompt(
  handle: string,
  context: string,
  trendsData: string
): string {
  return `Analyse this Instagram account as a competitor to @uxabhi_:

COMPETITOR:
Handle: ${handle}
Context: ${context}

@uxabhi_ PROFILE:
UX designer, HCI master's Germany, Indian designer, Framer + AI tools, 1,242 followers
Viral formula: screen recording + practical shortcut + comment trigger
Whitespace: Hindi/Hinglish UX education, Indian designer in Europe POV, HCI research simplified

CURRENT TRENDS IN NICHE:
${trendsData}

Return this exact JSON (no markdown, no explanation):
{
  "handle": "${handle}",
  "strategy": "2-3 sentences on what they post and why it works",
  "hooksToSteal": [
    "hook 1 adapted to @uxabhi_ voice",
    "hook 2",
    "hook 3",
    "hook 4",
    "hook 5"
  ],
  "gapsTheyLeave": [
    "specific gap 1 their audience wants but they don't provide",
    "specific gap 2",
    "specific gap 3"
  ],
  "threatLevel": "high | medium | low",
  "threatReason": "specific reason why",
  "collabScore": "X/10",
  "collabPitch": "exact DM message ready to copy-paste",
  "whitespace": "the one specific angle they never touch that @uxabhi_ can own"
}`
}

export function buildNicheSuggestionsPrompt(trendsData: string): string {
  return `Suggest 6 Instagram accounts that are competitors or relevant creators to @uxabhi_.

@uxabhi_ profile: UX designer, HCI master's student Germany, Indian designer in Europe,
Figma + Framer + AI tools + vibe coding, 1,242 followers, goal: 10K in 30 days.

Current trends in niche:
${trendsData}

Return ONLY this JSON array (no markdown):
[
  {
    "handle": "@username",
    "approxFollowers": "50K",
    "niche": "what they post about",
    "whyRelevant": "specific reason for @uxabhi_",
    "threatLevel": "high | medium | low"
  }
]`
}

export function buildBatchReportPrompt(
  competitors: string,
  trendsData: string
): string {
  return `You are analysing a group of Instagram competitors for @uxabhi_.

@uxabhi_ profile: UX designer, HCI master's Germany, Indian designer, Framer + AI tools.

COMPETITORS:
${competitors}

CURRENT TRENDS:
${trendsData}

Return ONLY this JSON (no markdown):
{
  "combinedStealReport": ["top 5 hooks across all competitors adapted to @uxabhi_ voice"],
  "sharedGaps": ["3 content gaps ALL competitors leave open"],
  "topWhitespace": "the single best unclaimed content angle for @uxabhi_",
  "positioningMap": "2-3 sentences on where @uxabhi_ sits vs all competitors"
}`
}
