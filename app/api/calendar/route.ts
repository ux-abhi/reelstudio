import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { dayNumber, edits } = await req.json() as {
    dayNumber: number
    edits: {
      title?: string
      hook?: string
      postType?: string
      triggerWord?: string
      postingTime?: string
    }
  }

  if (!dayNumber || !edits) {
    return NextResponse.json({ error: 'dayNumber and edits required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Find the user's latest non-expired scan
  const { data: scan } = await supabase
    .from('scans')
    .select('id')
    .eq('user_id', user.id)
    .gt('expires_at', new Date().toISOString())
    .order('scanned_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!scan) return NextResponse.json({ error: 'No active scan found' }, { status: 404 })

  const patch: Record<string, unknown> = {}
  if (edits.title     !== undefined) patch.title        = edits.title
  if (edits.hook      !== undefined) patch.hook         = edits.hook
  if (edits.postType  !== undefined) patch.post_type    = edits.postType
  if (edits.triggerWord !== undefined) patch.trigger_word = edits.triggerWord || null
  if (edits.postingTime !== undefined) patch.posting_time = edits.postingTime

  const { error } = await supabase
    .from('content_calendar')
    .update(patch)
    .eq('scan_id', scan.id)
    .eq('user_id', user.id)
    .eq('day_number', dayNumber)

  if (error) {
    console.error('[Calendar PATCH]', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
