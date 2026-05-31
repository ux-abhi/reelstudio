// ─── System prompts ───────────────────────────────────────────────────────────
// These go in the `system` role of every content-generation Groq call.
// They define the writer's identity, expertise, and hard rules — things that
// don't change per-request. User prompts handle the specific task.

export const INSTAGRAM_SYSTEM = `Expert Instagram content writer. Speciality: scroll-stopping hooks, high-retention scripts, CTAs that drive saves and comments.

RULES (enforced):
- Hook lands in <3 seconds. Use: curiosity gap, pattern interrupt, specific result ("saved 4 hours"), or named pain. Never starts with "I".
- Every sentence earns its place. No filler, no padding.
- CTAs are specific: "Comment 'X' and I'll DM you [exact thing]" — never "let me know below"
- Claims must have specifics. "Saves time" → "saved 4 hours/week". Never vague.
- BANNED words/phrases: "hey guys", "welcome back", "so today", "game changer", "mind-blowing", "this is huge", "nobody talks about this"
- Drive saves (reference content) or comments (trigger words) — never just likes
- Write IN the creator's voice. Match their niche vocabulary and energy.`

export const LINKEDIN_SYSTEM = `Expert LinkedIn content writer. Speciality: posts that earn comments, saves, and DMs from professionals.

RULES (enforced):
- First line never starts with "I". Lead with the claim, story opener, or question.
- Line break every 2-3 sentences. No walls of text.
- No URLs in post body — "(link in first comment)" only.
- Max 5 hashtags, at the very end.
- End with a specific debatable question, not "What do you think?"
- BANNED: "synergy", "leverage", "circle back", "move the needle", "excited to share", "thought leader", "game changer"
- No vague inspiration — every claim backed by a specific story or detail.
- Tone: smart colleague having coffee, not a press release.`


// ─── Instagram prompt builders ────────────────────────────────────────────────

export interface InstagramScriptContext {
  idea: string
  format: string
  tone: string
  language: string
  who: string              // "@handle — niche" or just "niche"
  bio?: string
  brandContext?: string    // from master doc
  trendingKeywords?: string
  recentPostTopics?: string
  topHooks?: string[]      // user's best-performing hook lines from scan
  triggerWords?: string
  hashtags?: string
}

export function buildInstagramScriptPrompt(ctx: InstagramScriptContext): string {
  const {
    idea, format, tone, language, who, bio, brandContext,
    trendingKeywords, recentPostTopics, topHooks, triggerWords, hashtags
  } = ctx

  // Cap context to control token budget
  const parts: string[] = [
    `Creator: ${who}`,
    bio ? `Bio: ${bio.slice(0, 120)}` : '',
    brandContext ? `Brand: ${brandContext.slice(0, 150)}` : '',
    `Format: ${format} | Tone: ${tone} | Language: ${language}`,
    trendingKeywords ? `Trending: ${trendingKeywords}` : '',
    recentPostTopics ? `Don't repeat: ${recentPostTopics}` : '',
    topHooks?.length ? `Past hooks that worked: ${topHooks.slice(0, 2).map(h => `"${h}"`).join(', ')}` : '',
    triggerWords ? `Trigger words: ${triggerWords}` : '',
    hashtags ? `Hashtags (pick 7-10): ${hashtags}` : '',
  ].filter(Boolean)

  return `${parts.join('\n')}

IDEA: ${idea}

Write the script:
[HOOK] scroll-stopping, <3 seconds, no greeting
[BODY] tight, every sentence earns its place
[CTA] specific trigger word or SAVE prompt

Return only the three labelled sections.`
}


export function buildInstagramHooksPrompt(ctx: Pick<InstagramScriptContext, 'idea' | 'who' | 'brandContext' | 'trendingKeywords' | 'topHooks' | 'tone'>): string {
  const { idea, who, brandContext, trendingKeywords, topHooks, tone } = ctx
  return `Creator: ${who} | Tone: ${tone}
${brandContext ? `Brand: ${brandContext.slice(0, 120)}\n` : ''}${trendingKeywords ? `Trending: ${trendingKeywords}\n` : ''}${topHooks?.length ? `Past hooks: ${topHooks.slice(0, 2).map(h => `"${h}"`).join(', ')}\n` : ''}
Topic: ${idea}

Write 5 hooks, one per type. None start with "I". Each specific, lands in <3s.
[CURIOSITY GAP] claim without explanation, forces watch
[PATTERN INTERRUPT] unexpected or counterintuitive opener
[RELATABLE PAIN] names a precise frustration ("3 hours", not "a long time")
[HOT TAKE] confident controversial claim
[RESULT FIRST] specific outcome, implies you'll reveal how

Return only the 5 labelled hooks.`
}


export function buildInstagramCaptionPrompt(ctx: Pick<InstagramScriptContext, 'idea' | 'format' | 'who' | 'brandContext' | 'trendingKeywords' | 'triggerWords' | 'hashtags' | 'language'>): string {
  const { idea, format, who, brandContext, trendingKeywords, triggerWords, hashtags, language } = ctx
  const hashtagLine = hashtags
    ? `HASHTAG BANK (pick 7–10 most relevant, place at the very end):\n${hashtags}`
    : 'Use 7–10 relevant hashtags for this niche, placed at the very end.'

  return `Creator: ${who}
${brandContext ? `Brand context: ${brandContext}` : ''}
Format: ${format}
Language: ${language}
${trendingKeywords ? `Trending: ${trendingKeywords}` : ''}
${triggerWords ? `Trigger words to consider: ${triggerWords}` : ''}

TOPIC: ${idea}

Write the Instagram caption. Structure:

LINE 1–2 (before "see more"): This is everything. Must hook with the most compelling claim, stat, or question. No greeting. No "check this out". Just the value.

BODY: Value-dense. Short sentences. No filler. Build context and deliver the insight.

CTA: If trigger word is relevant — "Comment '[WORD]' and I'll [specific thing]". Otherwise a genuine question that invites response. Always end with "SAVE this" if the content has reference value.

HASHTAGS: ${hashtagLine}

Return ONLY the caption. No labels. No explanation.`
}


export function buildInstagramSectionRegenPrompt(
  section: 'hook' | 'body' | 'cta',
  currentText: string,
  idea: string,
  format: string,
  tone: string,
  language: string,
  who: string,
  brandContext?: string
): string {
  const instructions: Record<string, string> = {
    hook: `Rewrite ONLY the hook. It must be stronger — more scroll-stopping, more specific, better curiosity gap or pattern interrupt. The concept must land in under 3 seconds. Does not start with "I".`,
    body: `Rewrite ONLY the body. Tighter pacing. Every sentence earns its place. Better rhythm. More specific. Remove any vague claims or filler.`,
    cta: `Rewrite ONLY the CTA. More specific and action-driving. If there's a trigger word, use: "Comment '[WORD]' and I'll [specific deliverable]". End with a SAVE prompt if the content is reference-worthy.`,
  }

  return `Creator: ${who}
${brandContext ? `Brand context: ${brandContext}` : ''}
Format: ${format}, Tone: ${tone}, Language: ${language}
Topic: ${idea}

Current ${section.toUpperCase()}: "${currentText}"

${instructions[section]}

Return ONLY the rewritten ${section} text. No labels. No explanation.`
}


export function buildInstagramVariantsPrompt(
  idea: string,
  format: string,
  tone: string,
  who: string,
  brandContext?: string,
  trendingKeywords?: string
): string {
  return `Creator: ${who}
${brandContext ? `Brand context: ${brandContext}` : ''}
Format: ${format}, Tone: ${tone}
${trendingKeywords ? `Trending: ${trendingKeywords}` : ''}

Topic: ${idea}

Write exactly 3 Instagram hooks. Each must be a different type:
1. [CURIOSITY GAP] — omits information to create compulsive watch-to-find-out
2. [PATTERN INTERRUPT] — opens with a claim or image direction that breaks expected content
3. [RESULT FIRST] — leads with the specific outcome and implies you'll show how

Each hook is one punchy line — no greeting, no label in the output.
Number them 1. 2. 3.
Return only the 3 numbered hooks. No explanation.`
}


// ─── LinkedIn prompt builders ─────────────────────────────────────────────────

export interface LinkedInPostContext {
  rawInput: string           // what happened — the raw life/work event
  timeframe: 'day' | 'week'
  postType: 'story' | 'insight' | 'progress'
  who: string                // "@handle — niche" or just niche
  brandContext?: string
  contentPillars?: string[]
  tone?: string
}

const LINKEDIN_POST_TYPE_GUIDE: Record<string, string> = {
  story: `STORY POST — narrative structure.
Open with the moment (not background). Move through conflict or tension. Land on the insight or lesson. End with a question that makes professionals think.
Format: 5–7 short paragraphs. Conversational. Human. Specific details over generalities.`,

  insight: `INSIGHT POST — distilled professional wisdom.
One clear, specific, slightly-counterintuitive insight as the hook. Build context in 1–2 paragraphs. Support with your experience or a specific example. Give the actionable takeaway. Question CTA.
Format: 4–6 short paragraphs. Confident. Direct. Every line adds to the argument.`,

  progress: `PROGRESS POST — milestone, build log, or honest reflection.
Open with the specific thing that happened (number, milestone, decision made). Tell what led to it and what you learnt. Be honest — the struggle makes it real. End with what you're building toward and a question about others' experience.
Format: 4–6 short paragraphs. Honest. Specific. Not performative.`,
}

export function buildLinkedInPostPrompt(ctx: LinkedInPostContext): string {
  const { rawInput, timeframe, postType, who, brandContext, contentPillars, tone } = ctx
  const pillarsLine = contentPillars?.length ? `Content pillars: ${contentPillars.join(', ')}` : ''
  const toneGuide   = tone ? `Voice: ${tone} — human, direct, professional but not stiff` : 'Voice: confident and human — like a smart colleague, not a press release'
  const typeGuide   = LINKEDIN_POST_TYPE_GUIDE[postType] ?? LINKEDIN_POST_TYPE_GUIDE.insight
  const timeframeNote = timeframe === 'week'
    ? 'This covers a full week of events — extract the most post-worthy single insight or moment.'
    : 'This is from a single day — focus on the one thing that had the most learning or impact.'

  return `Creator: ${who}
${brandContext ? `Brand context: ${brandContext}` : ''}
${pillarsLine}
${toneGuide}

WHAT HAPPENED (raw input from the creator):
${rawInput}

TIMEFRAME: ${timeframe === 'week' ? 'This week' : 'Today'} — ${timeframeNote}

POST TYPE: ${postType.toUpperCase()}
${typeGuide}

FORMATTING RULES FOR LINKEDIN:
— Line break after every 2–3 sentences (never a wall of text)
— First line must work as a standalone statement — it's the only thing visible before "see more"
— Do NOT start the first line with "I"
— Do NOT include any URLs in the post body (note them as "(link in first comment)" if needed)
— End with a specific, debatable question — not "What do you think?"
— 3–5 hashtags at the very end only

TASK: Write a complete LinkedIn post based on what happened.
Return ONLY the post. No explanation. No meta-commentary.`
}


export function buildLinkedInImagePrompt(
  postContent: string,
  postType: 'story' | 'insight' | 'progress',
  who: string,
  niche?: string
): string {
  const typeStyle: Record<string, string> = {
    story:    'cinematic and human — a person in a real environment, mid-action or mid-thought, not posed',
    insight:  'conceptual and minimal — an abstract visual that represents the idea, clean composition, almost editorial',
    progress: 'workspace and process — screen, desk, tools, or environment that suggests creative or analytical work in progress',
  }

  return `You are generating an image prompt for a LinkedIn post visual.
The image will be created in DALL-E 3, Midjourney v6, or Ideogram.

POST SUMMARY:
${postContent.slice(0, 600)}

CREATOR: ${who}${niche ? ` — niche: ${niche}` : ''}
POST TYPE: ${postType}
VISUAL DIRECTION: ${typeStyle[postType] ?? typeStyle.insight}

Generate a detailed image prompt that:
1. Describes a SPECIFIC, IMAGINABLE scene (not "an inspiring image of success")
2. Includes: subject, environment, lighting, colour tone, mood, composition angle
3. Relates CONCEPTUALLY to the post — not literally illustrating it word for word
4. Feels editorial and professional — not stock photo, not fake-lifestyle
5. Works as a 4:5 (portrait) LinkedIn post image
6. Does NOT describe any text overlaid on the image
7. Ends with aspect ratio and style tags: "--ar 4:5 --style raw" for Midjourney or "photorealistic, editorial, soft natural light" for DALL-E

Return ONLY the image prompt. No explanation. No meta-commentary.`
}


// ─── Life Log → Instagram prompt ─────────────────────────────────────────────

export interface LifeLogInstagramContext {
  rawInput: string
  timeframe: 'day' | 'week'
  who: string
  brandContext?: string
  niche?: string
  trendingKeywords?: string
}

export function buildLifeLogInstagramPrompt(ctx: LifeLogInstagramContext): string {
  const { rawInput, timeframe, who, brandContext, niche, trendingKeywords } = ctx
  const timeNote = timeframe === 'week'
    ? 'This covers a full week — extract the 1 most scroll-worthy moment or insight from it.'
    : 'This is from today — find the one thing worth turning into content.'

  return `Creator: ${who}${niche ? ` | Niche: ${niche}` : ''}
${brandContext ? `Brand: ${brandContext.slice(0, 120)}\n` : ''}${trendingKeywords ? `Trending: ${trendingKeywords}\n` : ''}
WHAT HAPPENED (raw, real life):
${rawInput}

${timeNote}

Generate ${timeframe === 'week' ? '3' : '1'} Instagram post concept(s) based on this. For each, pick the best format (Reel/Carousel/Talking Head).

Return ONLY this JSON array (no markdown):
[
  {
    "format": "Reel | Carousel | Talking Head",
    "title": "specific post title",
    "hook": "scroll-stopping first line — no greeting, no 'I', lands in <3s",
    "body": "2-4 sentence script outline or carousel slide plan",
    "cta": "specific comment trigger or save prompt",
    "caption": "first 2 lines of caption (before see more)",
    "basedOn": "which part of the input this came from (1 sentence)"
  }
]`
}

// ─── Groq call helper ─────────────────────────────────────────────────────────
// Convenience wrapper: pass this to /api/groq as { prompt, systemPrompt, maxTokens }

export function instagramGroqPayload(prompt: string, maxTokens = 1500) {
  return { prompt, systemPrompt: INSTAGRAM_SYSTEM, maxTokens }
}

export function linkedInGroqPayload(prompt: string, maxTokens = 1200) {
  return { prompt, systemPrompt: LINKEDIN_SYSTEM, maxTokens }
}


// ─── Shot list prompt ─────────────────────────────────────────────────────────

export interface ShotItem {
  n: number
  type: string
  frame: string
  vibe: string
  sec: string
}

export function buildShotListPrompt(script: string, format: string, idea: string, who: string): string {
  return `You are a video director creating a practical shot list for a social media ${format}.

CREATOR: ${who}
TOPIC: ${idea}

SCRIPT:
${script}

Generate a concise, practical shot list (6–8 shots max) for filming this. Every shot must be specific to THIS content — no generic filler.

Return ONLY this JSON array (no markdown, no explanation):
[
  {
    "n": 1,
    "type": "Talking head | B-roll | Close-up | POV | Text overlay | Transition | Wide shot",
    "frame": "exactly what is in frame — specific, visual, 15 words max",
    "vibe": "one reference: a creator handle (@aliabdaal), visual style, or genre",
    "sec": "e.g. 3–5s"
  }
]`
}
