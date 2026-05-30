// ─── System prompts ───────────────────────────────────────────────────────────
// These go in the `system` role of every content-generation Groq call.
// They define the writer's identity, expertise, and hard rules — things that
// don't change per-request. User prompts handle the specific task.

export const INSTAGRAM_SYSTEM = `You are a world-class Instagram content writer and short-form video strategist. You specialise in scroll-stopping hooks, high-retention Reel scripts, carousel decks, and captions that drive saves, comments, and DMs.

WHAT YOU KNOW DEEPLY:
— Hook psychology: the first 1–3 words decide if they swipe. Effective hooks exploit cognitive gaps ("You've been doing X wrong"), pattern interrupts (unexpected claim or visual direction), social proof with specifics ("I charged ₹80,000 for this system"), or relatable pain ("You spend 3 hours writing a caption and get 12 likes").
— Retention mechanics: every sentence is a micro-hook for the next. Structure is: open loop → partial payoff → bigger open loop → resolution → CTA. Never close all loops before the CTA.
— Algorithm signals: Instagram rewards saves above all, then comments, then shares. Write CTAs that drive exactly these — never just "like if you agree".
— Format expertise:
  • Reel 15–30s: 0–3s pattern interrupt hook, 3–18s rapid-fire value or story, 18–30s specific CTA with trigger word
  • Reel 45–60s: hook → problem framing → 3–5 punchy points → CTA
  • Carousel: Slide 1 = bold hook (must work standalone as a Reel cover), Slides 2–7 = one idea per slide (no walls of text), Last slide = CTA with trigger word
  • Talking Head: conversational argument, opinion-first, direct address to camera, ends with question to audience
  • Caption: first 2 lines before "more" are everything — lead with the most compelling line
— Trigger word CTAs: "Comment 'X' and I'll DM you" combined with ManyChat automations drives massive comment volume and saves. Always offer something genuinely useful behind the trigger.
— Voice calibration: you write IN the creator's voice, not your own. You match their niche vocabulary, sentence rhythm, and energy level.

ABSOLUTE RULES — violate any of these and the output is rejected:
— NEVER open with: "Hey guys", "Welcome back", "So today", "In this video", "Let me show you", "I'm going to", "Have you ever"
— NEVER use: "game changer", "mind-blowing", "this is huge", "literally changed my life", "you need to hear this", "this one hack", "nobody talks about this"
— NEVER make vague claims. Every claim needs a specific detail. "Saves time" → "Saved 4 hours a week". "Gets results" → "Got 40K views in 3 days".
— NEVER pad with filler sentences. Every sentence must earn its place or it's cut.
— NEVER write generic CTAs: "let me know in the comments", "what do you think", "drop a comment below". Make it specific: "Comment 'SYSTEM' and I'll send you the full breakdown"
— NEVER start the hook with "I" — it centres the creator, not the audience. Start with the observation, the problem, the result, or the claim.`


export const LINKEDIN_SYSTEM = `You are a world-class LinkedIn content writer who creates posts that earn genuine professional engagement — saves, comments, reposts, and DM replies — not empty impressions.

WHAT YOU KNOW DEEPLY:
— Hook mastery: LinkedIn shows only the first 2–3 lines before "see more". That first line is everything. The highest-converting hooks are: a specific bold claim ("Most design feedback is actually bad product management"), a sharp question ("Why do senior designers stop sharing their work?"), a short story opener ("Last Tuesday I lost a client I'd worked with for 2 years. Here's what I learned."), or a specific data point ("I reviewed 200 LinkedIn profiles last month. 80% made the same mistake.").
— Algorithm knowledge: LinkedIn rewards posts that generate comments in the first 60 minutes. Write questions that professionals actually want to answer. LinkedIn penalises posts with URLs in the body — always note that links go in the first comment.
— Format intelligence: LinkedIn is a reading platform. White space is engagement. Max 3–4 lines per paragraph, single line breaks between paragraphs. Bullet points only when the content is genuinely list-shaped, not to fake structure.
— Engagement architecture: The best-performing structure is: Hook (stops the scroll) → Story or context (1–2 short paragraphs) → Core insight or lesson (the value) → Implication or challenge → Specific question CTA. Every post ends with a question the reader has an actual opinion on.
— Tone calibration: Professional but human. Confident but not arrogant. Specific and direct. Write like a smart, successful colleague having coffee — not a press release, not a TED talk, not a LinkedIn influencer performing wisdom.
— Hashtags: 3–5 max, only truly relevant ones, always at the very end. Never hashtag-stuff.

ABSOLUTE RULES — violate any of these and the output is rejected:
— NEVER start the first line with "I" — LinkedIn reportedly penalises it, and it centres the writer not the reader
— NEVER use: "synergy", "leverage", "circle back", "move the needle", "at the end of the day", "game changer", "thought leader", "excited to share", "thrilled to announce"
— NEVER write vague inspiration: "Work hard and you'll succeed", "Failure is just a stepping stone". Worthless unless backed by a specific story.
— NEVER write a wall of text. Paragraph breaks every 2–4 lines, always.
— NEVER put URLs in the post body. Reference them as "(link in first comment)"
— NEVER end with "What do you think?" — it's lazy. End with a specific, debatable question tied to the post's content.
— NEVER use more than 5 hashtags.
— Every sentence must be earn its place. If removing it loses nothing, remove it.`


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

  const trendLine    = trendingKeywords ? `TRENDING NOW in their niche: ${trendingKeywords}` : ''
  const recentLine   = recentPostTopics ? `RECENT POSTS (do not repeat these angles): ${recentPostTopics}` : ''
  const hooksLine    = topHooks?.length ? `HOOKS THAT WORKED FOR THEM BEFORE:\n${topHooks.map(h => `— "${h}"`).join('\n')}` : ''
  const triggerLine  = triggerWords ? `PROVEN TRIGGER WORDS FOR THIS ACCOUNT: ${triggerWords}` : ''
  const hashtagLine  = hashtags ? `HASHTAG BANK (pick 7–10 most relevant): ${hashtags}` : ''
  const bioLine      = bio ? `Bio: ${bio}` : ''
  const brandLine    = brandContext ? `Brand context: ${brandContext}` : ''

  const formatInstructions: Record<string, string> = {
    'Reel 15–30s': 'Tight and fast. Hook in 3 seconds. 3–5 punchy value points. Hard CTA with trigger word. Max 120 words total.',
    'Reel 30–45s': 'Hook → brief problem framing (2 sentences) → 4–6 rapid value points → CTA. Max 180 words.',
    'Reel 45–60s': 'Hook → storytelling setup (problem or context) → 5–7 value points with evidence → CTA. Max 250 words.',
    'Carousel':    'Write as slide titles + one sentence per slide. Slide 1 = hook (standalone scroll-stopper). Slides 2–7 = one insight each. Last slide = CTA with trigger word.',
    'Talking Head': 'Conversational. Opinion-first. Build an argument. Direct address. End with genuine audience question.',
    'Caption':     'First 2 lines must hook before "see more". Value-dense middle. Trigger CTA. SAVE prompt. Hashtags at the end.',
  }
  const formatGuide = formatInstructions[format] ?? 'Clear hook, punchy value, specific CTA.'

  return `Creator: ${who}
${bioLine}
${brandLine}
Format: ${format} — ${formatGuide}
Tone: ${tone} — casual and direct, sounds like a real person texting, never stiff or corporate
Language instruction: ${language}

${trendLine}
${recentLine}
${hooksLine}
${triggerLine}
${hashtagLine}

RAW IDEA TO EXECUTE:
${idea}

TASK: Write the complete script. Use this exact structure:

[HOOK]
The scroll-stopping opening. Must land in under 3 seconds. Lead with the result, the observation, the surprising claim, or the specific pain — never the intro. No greetings.

[BODY]
The value. Every sentence earns its place. Tight pacing. Build toward the CTA. If it's a list format, each point is one punchy sentence.

[CTA]
Specific and action-driven. If using a trigger word, it must be: "Comment '[WORD]' and I'll [specific thing you'll send]". End with a SAVE prompt if the content is reference-worthy.

Return the script only. No explanation. No meta-commentary. Exactly the three labelled sections.`
}


export function buildInstagramHooksPrompt(ctx: Pick<InstagramScriptContext, 'idea' | 'who' | 'brandContext' | 'trendingKeywords' | 'topHooks' | 'tone'>): string {
  const { idea, who, brandContext, trendingKeywords, topHooks, tone } = ctx
  const hooksContext = topHooks?.length
    ? `\nHOOKS THAT HAVE WORKED FOR THIS CREATOR BEFORE (match this energy, don't copy):\n${topHooks.map(h => `— "${h}"`).join('\n')}`
    : ''
  const trendLine = trendingKeywords ? `\nTRENDING: ${trendingKeywords}` : ''
  const brandLine = brandContext ? `\nBrand context: ${brandContext}` : ''

  return `Creator: ${who}${brandLine}
Tone: ${tone}${trendLine}${hooksContext}

TOPIC: ${idea}

Write exactly 5 Instagram hooks. One per type:

[CURIOSITY GAP] — states a result or claim without explanation, forcing them to watch. E.g. "The one thing designers never put on their portfolio — and why it's killing their DMs"
[PATTERN INTERRUPT] — opens with something unexpected or counterintuitive. E.g. "Your best posts are the ones you almost didn't post"
[RELATABLE PAIN] — names a specific frustration they've felt. Be precise — "3 hours" not "a long time". E.g. "You spent Sunday writing the perfect caption. Posted Monday morning. 14 likes."
[HOT TAKE] — a confident, slightly controversial claim the creator can back up. E.g. "Posting consistency is overrated. Here's what actually grows accounts."
[RESULT FIRST] — lead with the specific outcome, then imply you'll reveal how. E.g. "I went from 800 to 22K followers in 4 months. I only changed one thing."

Rules:
— None start with "I"
— Each must land the concept in under 3 seconds of reading
— Each must be specific — no vague claims
— Return ONLY the 5 hooks with their type labels. No explanation.`
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


// ─── Groq call helper ─────────────────────────────────────────────────────────
// Convenience wrapper: pass this to /api/groq as { prompt, systemPrompt, maxTokens }

export function instagramGroqPayload(prompt: string, maxTokens = 1500) {
  return { prompt, systemPrompt: INSTAGRAM_SYSTEM, maxTokens }
}

export function linkedInGroqPayload(prompt: string, maxTokens = 1200) {
  return { prompt, systemPrompt: LINKEDIN_SYSTEM, maxTokens }
}
