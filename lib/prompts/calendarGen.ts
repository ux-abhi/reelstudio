export function buildCalendarRegenPrompt(
  scanSummary: string,
  trendsData: string,
  tomorrowDate: string
): string {
  return `Regenerate a 30-day Instagram posting calendar for @uxabhi_ — Abhishek Jha.

ACCOUNT SUMMARY:
${scanSummary}

LIVE GOOGLE TRENDS DATA:
${trendsData}

Calendar starts: ${tomorrowDate}

Generate exactly 30 calendar days. Each day must have:
- dayNumber (1-30)
- date (YYYY-MM-DD format starting from ${tomorrowDate})
- dayName (Mon/Tue/Wed/Thu/Fri/Sat/Sun)
- postType (Reel | Carousel | Stories | Talking Head)
- pillar (one of the 5 content pillars)
- title (specific, not generic)
- hook (opening line, scroll-stopping)
- optimisedFor (Reach | Saves | Comments | DMs)
- triggerWord (optional, e.g. FRAMER / TOOLS / PORTFOLIO)
- postingTime (e.g. "19:00 CET")
- trendSignal (optional, e.g. "figma +28% this week")

Week themes:
- Week 1 (Days 1-7): Foundation — algorithm reset, high engagement formats
- Week 2 (Days 8-14): Momentum — first collab, double down on winners
- Week 3 (Days 15-21): Authority — expertise content, startup audience
- Week 4 (Days 22-30): Virality — max shareables, comment triggers

Return ONLY valid JSON array. No markdown. No explanation.`
}
