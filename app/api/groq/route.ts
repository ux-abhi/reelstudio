import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { GROQ_MODEL } from '@/lib/groq'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { prompt, systemPrompt, maxTokens = 1000 } = await req.json()

    const messages: Groq.Chat.ChatCompletionMessageParam[] = []
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    messages.push({ role: 'user', content: prompt })

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      max_tokens: maxTokens,
    })

    const text = completion.choices[0]?.message?.content ?? ''
    return NextResponse.json({ text })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Groq call failed'
    console.error('Groq error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
