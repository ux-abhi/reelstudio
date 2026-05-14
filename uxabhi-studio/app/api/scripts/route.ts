import { NextRequest, NextResponse } from 'next/server'
import { kv, KV_KEYS } from '@/lib/kv'
import { SavedScript } from '@/types/scan'

const MAX_SCRIPTS = 100

export async function GET() {
  const scripts = await kv.get<SavedScript[]>(KV_KEYS.scripts) ?? []
  return NextResponse.json(scripts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const scripts = await kv.get<SavedScript[]>(KV_KEYS.scripts) ?? []

  const newScript: SavedScript = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    savedAt: new Date().toISOString(),
    format: body.format ?? '',
    tone: body.tone ?? '',
    pillar: body.pillar ?? '',
    input: body.input ?? '',
    output: body.output ?? '',
    hookLine: body.hookLine ?? '',
  }

  const updated = [newScript, ...scripts].slice(0, MAX_SCRIPTS)
  await kv.set(KV_KEYS.scripts, updated)
  return NextResponse.json(newScript)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const scripts = await kv.get<SavedScript[]>(KV_KEYS.scripts) ?? []
  const updated = scripts.filter(s => s.id !== id)
  await kv.set(KV_KEYS.scripts, updated)
  return NextResponse.json({ ok: true })
}
