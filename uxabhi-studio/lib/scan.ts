import { ScanResult } from '@/types/scan'

export function buildScanSchema(): string {
  return `{
  "scannedAt": "ISO string",
  "accountHealth": {
    "engagementRate": "X.X%",
    "engagementVerdict": "string",
    "postingCadence": "string",
    "topPerformingFormat": "string",
    "weakestFormat": "string",
    "bioScore": 0,
    "bioIssues": ["string"],
    "bioFix": "4-line bio rewrite"
  },
  "posts": [{ "id":"string","date":"string","topic":"string","likes":0,"comments":0,
    "tier":1,"format":"string","pillarTag":"string",
    "hookStrength":"strong|medium|weak","whatWorked":"string" }],
  "pillars": [{ "name":"string","emoji":"string","percentage":0,
    "description":"string","bestFormat":"string",
    "exampleIdeas":["string"],"basedOn":"string" }],
  "contentGaps": ["string"],
  "ideas": [{ "title":"string","pillar":"string","trendScore":0,
    "trendDirection":"rising|falling|stable","hookSuggestion":"string",
    "triggerWord":"string","urgency":"post this week|post this month|evergreen",
    "whyNow":"string" }],
  "calendar": [{ "dayNumber":1,"date":"YYYY-MM-DD","dayName":"Mon",
    "postType":"Reel|Carousel|Stories|Talking Head","pillar":"string",
    "title":"string","hook":"string",
    "optimisedFor":"Reach|Saves|Comments|DMs",
    "triggerWord":"string","postingTime":"19:00 CET","trendSignal":"string" }],
  "priorityActions": [{ "day":"Day 1","action":"string",
    "impact":"string","urgency":"do first|this week|this month" }],
  "trendPulse": [{ "keyword":"string","interest":0,
    "direction":"rising|falling|stable","breakout":false,
    "relatedQueries":["string"],"contentOpportunity":"string" }],
  "hooks": [{ "text":"string","type":"curiosity|story|hot-take|hinglish",
    "basedOn":"string","trendRelevant":false }],
  "triggerWords": [{ "word":"string","offer":"string",
    "expectedComments":"string","basedOn":"string","captionTemplate":"string" }],
  "bioFix": { "current":"string","issues":["string"],"recommended":"string" },
  "hashtagClusters": {
    "toolTutorials":["string"],
    "educationStudent":["string"],
    "opinionIndia":["string"]
  },
  "competitors": {
    "fromStrategy":["string"],
    "trendingInNiche":["string"]
  }
}`
}

export function parseGroqJson<T>(raw: string): T {
  const clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  return JSON.parse(clean) as T
}

export function buildTomorrowDate(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

export function validateScanResult(data: unknown): data is ScanResult {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  return (
    Array.isArray(d.posts) &&
    Array.isArray(d.ideas) &&
    Array.isArray(d.calendar) &&
    typeof d.accountHealth === 'object'
  )
}
