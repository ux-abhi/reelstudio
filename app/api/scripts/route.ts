import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { getScripts, addScript, deleteScript, updateScript } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const scripts = await getScripts(user.id)
  return NextResponse.json(scripts)
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const script = await addScript(user.id, {
    format: body.format ?? '',
    tone: body.tone ?? '',
    pillar: body.pillar ?? '',
    input: body.input ?? '',
    output: body.output ?? '',
    hookLine: body.hookLine ?? '',
  })
  return NextResponse.json(script)
}

export async function PATCH(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, output, hookLine } = await req.json()
  await updateScript(user.id, id, { output, hookLine })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await deleteScript(user.id, id)
  return NextResponse.json({ ok: true })
}
