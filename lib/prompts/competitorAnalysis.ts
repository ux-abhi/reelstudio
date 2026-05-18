export function buildCompetitorPrompt(
  competitorHandle: string,
  competitorData: string,
  userContext: string,
  trendsData: string
): string {
  return `You are performing a competitive Instagram analysis.

IMPORTANT RULE: The two accounts below belong to DIFFERENT people. Never apply attributes, location, bio, niche, or tone from one account to the other. Analyse each account using ONLY its own data.

══════════════════════════════════════════════
SECTION A — MY ACCOUNT (the person I am analysing FOR)
${userContext}
[END SECTION A — do not apply any of the above to the competitor]
══════════════════════════════════════════════

══════════════════════════════════════════════
SECTION B — COMPETITOR ACCOUNT (the account being analysed)
Handle: @${competitorHandle}
${competitorData}
[END SECTION B — do not apply any of the above to my account]
══════════════════════════════════════════════

CURRENT TRENDS IN NICHE:
${trendsData}

Using ONLY the competitor's own data from Section B, return this exact JSON (no markdown, no explanation):
{
  "handle": "@${competitorHandle}",
  "strategy": "2-3 sentences on what the competitor posts and why it works — based on their data only",
  "hooksToSteal": [
    "hook 1 adapted to MY voice (Section A), inspired by competitor style",
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
  "threatReason": "specific reason based on competitor's actual content",
  "collabScore": "X/10",
  "collabPitch": "exact DM message ready to copy-paste",
  "whitespace": "the one specific angle the competitor never touches that I can own"
}`
}

export function buildCompetitorIdeasPrompt(
  handle: string,
  gapsTheyLeave: string[],
  hooksToSteal: string[],
  whitespace: string,
  userContext: string
): string {
  return `Based on a competitor analysis of @${handle}, generate 5 content ideas I can create in MY OWN voice.

MY PROFILE:
${userContext}

COMPETITOR GAPS (topics their audience wants but competitor doesn't cover):
${gapsTheyLeave.map((g, i) => `${i + 1}. ${g}`).join('\n')}

HOOKS I CAN ADAPT:
${hooksToSteal.slice(0, 3).map((h, i) => `${i + 1}. ${h}`).join('\n')}

WHITESPACE I CAN OWN:
${whitespace}

Generate 5 content ideas adapted to MY voice — not copies of the competitor.

Return ONLY this JSON array (no markdown):
[
  {
    "title": "specific content idea title",
    "hook": "opening hook line for this idea",
    "angle": "what makes this distinctly mine vs the competitor",
    "format": "Reel | Carousel | Caption"
  }
]`
}
