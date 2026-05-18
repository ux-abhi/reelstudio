import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getUser } from '@/lib/supabase/server'
import { getUserContext, upsertUserContext, MasterDocSummary } from '@/lib/db'
import { GROQ_MODEL } from '@/lib/groq'
import { parseGroqJson } from '@/lib/scan'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ctx = await getUserContext(user.id)
  return NextResponse.json(ctx ?? {})
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { text, name } = await req.json() as { text: string; name: string }
    if (!text?.trim()) return NextResponse.json({ error: 'No document text provided' }, { status: 400 })

    const truncated = text.slice(0, 12000)

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{
        role: 'user',
        content: `Analyse this Instagram creator's brand/strategy document and extract key profile information.

DOCUMENT:
${truncated}

Extract and return ONLY this JSON (no markdown, no explanation):
{
  "niche": "specific niche description in 1 sentence",
  "tone": "voice/tone description in 1 sentence (e.g. casual, educational, sarcastic)",
  "keyTopics": ["topic 1", "topic 2", "topic 3", "topic 4", "topic 5"],
  "uniqueAngles": ["unique angle or perspective 1", "unique angle 2", "unique angle 3"],
  "targetAudience": "who the content is for in 1 sentence",
  "contentGoals": ["goal 1", "goal 2", "goal 3"]
}`,
      }],
      max_tokens: 800,
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const summary = parseGroqJson<MasterDocSummary>(raw)

    await upsertUserContext(user.id, {
      masterDocName: name,
      masterDocText: text,
      masterDocSummary: summary,
    })

    return NextResponse.json({ summary, name })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Analysis failed'
    console.error('User context error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await upsertUserContext(user.id, { masterDocName: undefined, masterDocText: undefined, masterDocSummary: undefined })
  return NextResponse.json({ ok: true })
}
