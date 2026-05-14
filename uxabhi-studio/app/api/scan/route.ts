import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { kv, KV_KEYS, KV_TTL } from '@/lib/kv'
import { buildMasterScanPrompt } from '@/lib/prompts/masterScan'
import { buildScanSchema, parseGroqJson, buildTomorrowDate, validateScanResult } from '@/lib/scan'
import { ScanResult } from '@/types/scan'
import { GROQ_MODEL } from '@/lib/groq'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { profileInput, forceRefresh = false } = await req.json()

    if (!forceRefresh) {
      const cached = await kv.get<ScanResult>(KV_KEYS.scan)
      if (cached) {
        return NextResponse.json(cached)
      }
    }

    // Fetch trends — fall back to empty array if unavailable
    let trendsData: unknown[] = []
    try {
      const trendsRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/trends`
      )
      trendsData = await trendsRes.json()
    } catch {
      console.error('Trends fetch failed, continuing with empty trends')
    }

    const tomorrowDate = buildTomorrowDate()
    const schema = buildScanSchema()
    const prompt = buildMasterScanPrompt(
      JSON.stringify(profileInput),
      JSON.stringify(trendsData),
      tomorrowDate,
      schema
    )

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 8000,
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const scanResult = parseGroqJson<ScanResult>(raw)

    if (!validateScanResult(scanResult)) {
      throw new Error('Invalid scan result structure from Groq')
    }

    scanResult.scannedAt = new Date().toISOString()
    scanResult.profileInput = profileInput

    await kv.set(KV_KEYS.scan, scanResult, { ex: KV_TTL.scan })

    return NextResponse.json(scanResult)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Scan failed'
    console.error('Scan error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
