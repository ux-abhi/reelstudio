export function buildScriptPrompt(
  userInput: string,
  format: string,
  tone: string,
  trendingKeywords: string,
  recentPostSummary: string
): string {
  return `You are writing an Instagram script for @uxabhi_ — Abhishek Jha.

PROFILE:
- UX designer + HCI master's student in Germany
- Builds real tools with AI (Chrome extensions, Framer sites, vibe coding)
- Indian designer in Europe — speaks Hindi/Hinglish naturally
- Tone: ${tone} — like texting a design friend, never presenting to a crowd
- Format: ${format}

CONTEXT FROM LIVE DATA:
- Currently trending in your niche: ${trendingKeywords}
- Your recent posts (don't repeat): ${recentPostSummary}

VIRAL FORMULA (use this):
Screen recording or result shown first → practical shortcut revealed →
comment trigger or save CTA at end

RAW IDEA FROM ABHISHEK:
${userInput}

Write the complete script. Structure:
[HOOK] — scroll-stopping first line. No "Hey guys". No slow intro.
[BODY] — punchy, natural pacing. Every sentence earns its place.
[CTA] — comment trigger ("Comment 'X' and I'll DM you") OR save prompt.

Rules:
- Hook must work in 2 seconds
- Sound like Abhishek, not a brand
- For Hinglish: mix naturally, don't force it
- Return script only. No explanation. No labels outside [HOOK][BODY][CTA].`
}

export function buildHooksOnlyPrompt(
  userInput: string,
  trendingKeywords: string
): string {
  return `You are writing Instagram hooks for @uxabhi_ — Abhishek Jha.
UX designer, HCI master's Germany, Indian designer, AI tools builder.
Tone: casual, direct, Hinglish where natural.

Currently trending: ${trendingKeywords}

Topic: ${userInput}

Write exactly 3 hooks. One per type:
1. [CURIOSITY] — creates an open loop, makes them watch to find out
2. [RELATABLE] — calls out a pain they've felt
3. [HOT-TAKE] — a controversial or counter-intuitive claim

Rules:
- Each hook must work in 2 seconds of reading
- No "Hey guys", no slow intro, no greetings
- Sound like Abhishek texting a friend
- Return ONLY the 3 hooks with type labels. No explanation.`
}

export function buildCaptionPrompt(
  userInput: string,
  format: string,
  trendingKeywords: string,
  triggerWords: string
): string {
  return `Write an Instagram caption for @uxabhi_ — Abhishek Jha.
UX designer, HCI master's Germany, Indian designer, AI tools builder.
Format: ${format}
Trending keywords to weave in: ${trendingKeywords}
Available trigger words: ${triggerWords}

Topic/idea: ${userInput}

Write a caption that:
- Opens with 1-2 punchy sentences (no greeting, straight to value)
- Includes a comment trigger if relevant (e.g. "Comment 'TOOLS' and I'll DM you...")
- Ends with "SAVE this" or a genuine question that prompts comments
- Uses 7-10 hashtags from these clusters:
  Tool tutorials: #figmatips #figmadesign #framerwebsite #uxtools #designtools
  Education: #uxstudent #uxportfolio #learnuxdesign #designtips #uxcommunity
  Opinion/India: #indiandesigner #designineurope #uxcareer #designrant #freelancedesigner

Return ONLY the caption. No explanation.`
}
