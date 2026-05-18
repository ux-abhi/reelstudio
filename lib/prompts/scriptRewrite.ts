export function buildScriptPrompt(
  userInput: string,
  format: string,
  tone: string,
  trendingKeywords: string,
  recentPostSummary: string,
  userHandle = '',
  userNiche = 'content creator',
  userBio = ''
): string {
  const who = userHandle ? `@${userHandle} — ${userNiche}` : userNiche
  const bioLine = userBio ? `\n- Bio: ${userBio}` : ''
  return `You are writing an Instagram script for: ${who}${bioLine}

PROFILE:
- Tone: ${tone} — casual and direct, like texting a friend, never corporate or stiff
- Format: ${format}

CONTEXT FROM LIVE DATA:
- Currently trending in their niche: ${trendingKeywords}
- Their recent posts (don't repeat): ${recentPostSummary}

VIRAL FORMULA (use this):
Result or hook shown first → practical value revealed → comment trigger or save CTA at end

RAW IDEA:
${userInput}

Write the complete script. Structure:
[HOOK] — scroll-stopping first line. No "Hey guys". No slow intro.
[BODY] — punchy, natural pacing. Every sentence earns its place.
[CTA] — comment trigger ("Comment 'X' and I'll DM you") OR save prompt.

Rules:
- Hook must work in 2 seconds
- Sound authentic to this creator's voice and niche
- Return script only. No explanation. No labels outside [HOOK][BODY][CTA].`
}

export function buildHooksOnlyPrompt(
  userInput: string,
  trendingKeywords: string,
  userHandle = '',
  userNiche = 'content creator'
): string {
  const who = userHandle ? `@${userHandle} — ${userNiche}` : userNiche
  return `You are writing Instagram hooks for: ${who}

Currently trending: ${trendingKeywords}

Topic: ${userInput}

Write exactly 3 hooks. One per type:
1. [CURIOSITY] — creates an open loop, makes them watch to find out
2. [RELATABLE] — calls out a pain they've felt
3. [HOT-TAKE] — a controversial or counter-intuitive claim

Rules:
- Each hook must work in 2 seconds of reading
- No "Hey guys", no slow intro, no greetings
- Sound authentic and direct
- Return ONLY the 3 hooks with type labels. No explanation.`
}

export function buildCaptionPrompt(
  userInput: string,
  format: string,
  trendingKeywords: string,
  triggerWords: string,
  userHandle = '',
  userNiche = 'content creator',
  hashtagSuggestions = ''
): string {
  const who = userHandle ? `@${userHandle} — ${userNiche}` : userNiche
  const hashtagLine = hashtagSuggestions
    ? `Use these hashtags (pick 7-10 relevant ones):\n${hashtagSuggestions}`
    : 'Use 7-10 relevant hashtags for this creator\'s niche'
  return `Write an Instagram caption for: ${who}
Format: ${format}
Trending keywords to weave in: ${trendingKeywords}
Available trigger words: ${triggerWords}

Topic/idea: ${userInput}

Write a caption that:
- Opens with 1-2 punchy sentences (no greeting, straight to value)
- Includes a comment trigger if relevant (e.g. "Comment 'TOOLS' and I'll DM you...")
- Ends with "SAVE this" or a genuine question that prompts comments
- ${hashtagLine}

Return ONLY the caption. No explanation.`
}
