import Groq from 'groq-sdk'

export const GROQ_MODEL = 'llama-3.3-70b-versatile'

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
    messages,
    max_tokens: maxTokens,
  })

  return completion.choices[0]?.message?.content ?? ''
}
