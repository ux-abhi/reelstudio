import Groq from 'groq-sdk'

// llama-3.3-70b-versatile was deprecated by Groq and shut down on 2026-08-16.
// Replacement per Groq's migration guidance: openai/gpt-oss-120b (131k context).
// Override with GROQ_MODEL in the environment without touching code.
export const GROQ_MODEL = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b'

// gpt-oss is a reasoning model: reasoning tokens are billed against max_tokens.
// Keep effort low so the existing max_tokens budgets still fit the actual answer.
export const GROQ_REASONING: { reasoning_effort: 'low' } = { reasoning_effort: 'low' }

function getClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY })
}

export async function groqComplete(
  prompt: string,
  systemPrompt?: string,
  maxTokens = 1000
): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = []
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  messages.push({ role: 'user', content: prompt })

  const completion = await getClient().chat.completions.create({
    model: GROQ_MODEL,
    ...GROQ_REASONING,
    messages,
    max_tokens: maxTokens,
  })

  return completion.choices[0]?.message?.content ?? ''
}
