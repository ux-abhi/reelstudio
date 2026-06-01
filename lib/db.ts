import { createClient } from '@/lib/supabase/server'
import type { ScanResult, SavedScript, CompetitorAnalysis } from '@/types/scan'
import type { TrendResult } from '@/lib/trends'

const HOUR = 3600

// ─── Scan: read ───────────────────────────────────────

export async function getScanResult(userId: string): Promise<ScanResult | null> {
  const supabase = await createClient()

  const { data: scan } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', userId)
    .order('scanned_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!scan) return null

  const [
    { data: profile },
    { data: health },
    { data: bioFix },
    { data: hashtagClusters },
    { data: posts },
    { data: pillars },
    { data: ideas },
    { data: calendar },
    { data: actions },
    { data: trends },
    { data: hooks },
    { data: triggerWords },
  ] = await Promise.all([
    supabase.from('instagram_profiles').select('*').eq('scan_id', scan.id).maybeSingle(),
    supabase.from('account_health').select('*').eq('scan_id', scan.id).maybeSingle(),
    supabase.from('bio_fixes').select('*').eq('scan_id', scan.id).maybeSingle(),
    supabase.from('hashtag_clusters').select('*').eq('scan_id', scan.id).maybeSingle(),
    supabase.from('analyzed_posts').select('*').eq('scan_id', scan.id).order('likes', { ascending: false }),
    supabase.from('content_pillars').select('*').eq('scan_id', scan.id),
    supabase.from('content_ideas').select('*').eq('scan_id', scan.id).order('trend_score', { ascending: false }),
    supabase.from('content_calendar').select('*').eq('scan_id', scan.id).order('day_number'),
    supabase.from('priority_actions').select('*').eq('scan_id', scan.id),
    supabase.from('trend_pulse').select('*').eq('scan_id', scan.id).order('interest', { ascending: false }),
    supabase.from('content_hooks').select('*').eq('scan_id', scan.id),
    supabase.from('trigger_words').select('*').eq('scan_id', scan.id),
  ])

  return {
    scannedAt: scan.scanned_at,
    handle: scan.handle,
    profileInput: scan.profile_input ?? undefined,
    instagramProfile: profile ? {
      handle: profile.handle,
      name: profile.name,
      bio: profile.bio,
      followers: profile.followers,
      following: profile.following,
      postCount: profile.post_count,
      isVerified: profile.is_verified,
      profilePicUrl: profile.profile_pic_url ?? undefined,
      category: profile.category ?? undefined,
      website: profile.website_url ?? undefined,
    } : undefined,
    accountHealth: {
      engagementRate: health?.engagement_rate ?? '0',
      engagementVerdict: health?.engagement_verdict ?? '',
      postingCadence: health?.posting_cadence ?? '',
      cadenceVerdict: health?.cadence_verdict ?? undefined,
      topPerformingFormat: health?.top_performing_format ?? '',
      weakestFormat: health?.weakest_format ?? '',
      bioScore: health?.bio_score ?? 0,
      bioIssues: health?.bio_issues ?? [],
      hookStrengthOverall: health?.hook_strength_overall as 'strong' | 'medium' | 'weak' | undefined,
      visualIdentityScore: health?.visual_identity_score ?? undefined,
    },
    posts: (posts ?? []).map(p => ({
      id: p.instagram_id,
      date: p.date,
      topic: p.topic,
      caption: p.caption ?? undefined,
      likes: p.likes,
      comments: p.comments,
      hashtags: p.hashtags,
      tier: p.tier as 1 | 2 | 3,
      format: p.format,
      pillarTag: p.pillar_tag,
      pillarColorKey: p.pillar_color_key ?? undefined,
      hookStrength: p.hook_strength as 'strong' | 'medium' | 'weak',
      whatWorked: p.what_worked,
      whatDidnt: p.what_didnt ?? undefined,
      permalink: p.permalink ?? undefined,
    })),
    pillars: (pillars ?? []).map(p => ({
      name: p.name,
      emoji: p.emoji,
      percentage: p.percentage,
      description: p.description,
      bestFormat: p.best_format,
      exampleIdeas: p.example_ideas,
      basedOn: p.based_on,
      colorKey: p.color_key as 'toolbox' | 'decoded' | 'take' | 'builder' | 'hci' | undefined,
    })),
    contentGaps: scan.content_gaps ?? [],
    ideas: (ideas ?? []).map(i => ({
      id: i.id,
      title: i.title,
      pillar: i.pillar,
      pillarColorKey: i.pillar_color_key ?? undefined,
      trendScore: i.trend_score,
      trendDirection: i.trend_direction as 'rising' | 'falling' | 'stable',
      trendKeyword: i.trend_keyword ?? undefined,
      hookSuggestion: i.hook_suggestion,
      triggerWord: i.trigger_word ?? undefined,
      urgency: i.urgency as 'post this week' | 'post this month' | 'evergreen',
      whyNow: i.why_now,
    })),
    calendar: (calendar ?? []).map(c => ({
      dayNumber: c.day_number,
      date: c.date,
      dayName: c.day_name,
      postType: c.post_type as 'Reel' | 'Carousel' | 'Stories' | 'Talking Head',
      pillar: c.pillar,
      pillarColorKey: c.pillar_color_key ?? undefined,
      title: c.title,
      hook: c.hook,
      optimisedFor: c.optimised_for as 'Reach' | 'Saves' | 'Comments' | 'DMs',
      triggerWord: c.trigger_word ?? undefined,
      postingTime: c.posting_time,
      trendSignal: c.trend_signal ?? undefined,
    })),
    priorityActions: (actions ?? []).map(a => ({
      id: a.id,
      day: a.day,
      action: a.action,
      impact: a.impact,
      urgency: a.urgency as 'do first' | 'this week' | 'this month',
      completed: a.completed,
    })),
    trendPulse: (trends ?? []).map(t => ({
      keyword: t.keyword,
      interest: t.interest,
      direction: t.direction as 'rising' | 'falling' | 'stable',
      breakout: t.breakout,
      relatedQueries: t.related_queries,
      contentOpportunity: t.content_opportunity,
    })),
    hooks: (hooks ?? []).map(h => ({
      id: h.id,
      text: h.text,
      type: h.type as 'curiosity' | 'story' | 'hot-take' | 'hinglish',
      basedOn: h.based_on,
      trendRelevant: h.trend_relevant,
    })),
    triggerWords: (triggerWords ?? []).map(t => ({
      word: t.word,
      offer: t.offer,
      expectedComments: t.expected_comments,
      basedOn: t.based_on,
      captionTemplate: t.caption_template,
    })),
    bioFix: {
      current: bioFix?.current ?? '',
      issues: bioFix?.issues ?? [],
      recommended: bioFix?.recommended ?? '',
    },
    hashtagClusters: {
      primary: hashtagClusters?.primary_tags ?? [],
      secondary: hashtagClusters?.secondary_tags ?? [],
      niche: hashtagClusters?.niche_tags ?? [],
    },
    competitorSuggestions: scan.competitor_suggestions ?? [],
  }
}

// ─── Scan: write ──────────────────────────────────────

export async function setScanResult(userId: string, result: ScanResult): Promise<void> {
  const supabase = await createClient()
  const expiresAt = new Date(Date.now() + 24 * HOUR * 1000).toISOString()

  // Delete previous scan (cascade removes all child rows)
  await supabase.from('scans').delete().eq('user_id', userId)

  const { data: scan, error } = await supabase
    .from('scans')
    .insert({
      user_id: userId,
      handle: result.handle,
      scanned_at: result.scannedAt,
      expires_at: expiresAt,
      content_gaps: result.contentGaps ?? [],
      competitor_suggestions: result.competitorSuggestions ?? [],
      profile_input: result.profileInput ?? null,
    })
    .select('id')
    .single()

  if (error || !scan) throw error ?? new Error('Failed to create scan')

  const sid = scan.id

  await Promise.all([
    result.instagramProfile && supabase.from('instagram_profiles').insert({
      scan_id: sid, user_id: userId,
      handle: result.instagramProfile.handle,
      name: result.instagramProfile.name,
      bio: result.instagramProfile.bio,
      followers: result.instagramProfile.followers,
      following: result.instagramProfile.following,
      post_count: result.instagramProfile.postCount,
      is_verified: result.instagramProfile.isVerified,
      profile_pic_url: result.instagramProfile.profilePicUrl ?? null,
      category: result.instagramProfile.category ?? null,
      website_url: result.instagramProfile.website ?? null,
    }),

    result.accountHealth && supabase.from('account_health').insert({
      scan_id: sid, user_id: userId,
      engagement_rate: String(result.accountHealth.engagementRate),
      engagement_verdict: result.accountHealth.engagementVerdict,
      posting_cadence: result.accountHealth.postingCadence,
      cadence_verdict: result.accountHealth.cadenceVerdict ?? null,
      top_performing_format: result.accountHealth.topPerformingFormat,
      weakest_format: result.accountHealth.weakestFormat,
      bio_score: result.accountHealth.bioScore,
      bio_issues: result.accountHealth.bioIssues ?? [],
      hook_strength_overall: result.accountHealth.hookStrengthOverall ?? null,
      visual_identity_score: result.accountHealth.visualIdentityScore ?? null,
    }),

    result.bioFix && supabase.from('bio_fixes').insert({
      scan_id: sid, user_id: userId,
      current: result.bioFix.current,
      issues: result.bioFix.issues,
      recommended: result.bioFix.recommended,
    }),

    result.hashtagClusters && supabase.from('hashtag_clusters').insert({
      scan_id: sid, user_id: userId,
      primary_tags: result.hashtagClusters.primary ?? [],
      secondary_tags: result.hashtagClusters.secondary ?? [],
      niche_tags: result.hashtagClusters.niche ?? [],
    }),

    result.posts?.length && supabase.from('analyzed_posts').insert(
      result.posts.map(p => ({
        scan_id: sid, user_id: userId,
        instagram_id: p.id,
        date: p.date,
        topic: p.topic,
        caption: p.caption ?? null,
        likes: p.likes,
        comments: p.comments,
        hashtags: p.hashtags ?? [],
        tier: p.tier,
        format: p.format,
        pillar_tag: p.pillarTag,
        pillar_color_key: p.pillarColorKey ?? null,
        hook_strength: p.hookStrength,
        what_worked: p.whatWorked,
        what_didnt: p.whatDidnt ?? null,
        permalink: p.permalink ?? null,
      }))
    ),

    result.pillars?.length && supabase.from('content_pillars').insert(
      result.pillars.map(p => ({
        scan_id: sid, user_id: userId,
        name: p.name,
        emoji: p.emoji,
        percentage: p.percentage,
        description: p.description,
        best_format: p.bestFormat,
        example_ideas: p.exampleIdeas ?? [],
        based_on: p.basedOn,
        color_key: p.colorKey ?? null,
      }))
    ),

    result.ideas?.length && supabase.from('content_ideas').insert(
      result.ideas.map(i => ({
        scan_id: sid, user_id: userId,
        title: i.title,
        pillar: i.pillar,
        pillar_color_key: i.pillarColorKey ?? null,
        trend_score: i.trendScore,
        trend_direction: i.trendDirection,
        trend_keyword: i.trendKeyword ?? null,
        hook_suggestion: i.hookSuggestion,
        trigger_word: i.triggerWord ?? null,
        urgency: i.urgency,
        why_now: i.whyNow,
      }))
    ),

    result.calendar?.length && supabase.from('content_calendar').insert(
      result.calendar.map(c => ({
        scan_id: sid, user_id: userId,
        day_number: c.dayNumber,
        date: c.date,
        day_name: c.dayName,
        post_type: c.postType,
        pillar: c.pillar,
        pillar_color_key: c.pillarColorKey ?? null,
        title: c.title,
        hook: c.hook,
        optimised_for: c.optimisedFor,
        trigger_word: c.triggerWord ?? null,
        posting_time: c.postingTime,
        trend_signal: c.trendSignal ?? null,
      }))
    ),

    result.priorityActions?.length && supabase.from('priority_actions').insert(
      result.priorityActions.map(a => ({
        scan_id: sid, user_id: userId,
        day: a.day,
        action: a.action,
        impact: a.impact,
        urgency: a.urgency,
        completed: a.completed ?? false,
      }))
    ),

    result.trendPulse?.length && supabase.from('trend_pulse').insert(
      result.trendPulse.map(t => ({
        scan_id: sid, user_id: userId,
        keyword: t.keyword,
        interest: t.interest,
        direction: t.direction,
        breakout: t.breakout,
        related_queries: t.relatedQueries ?? [],
        content_opportunity: t.contentOpportunity,
      }))
    ),

    result.hooks?.length && supabase.from('content_hooks').insert(
      result.hooks.map(h => ({
        scan_id: sid, user_id: userId,
        text: h.text,
        type: h.type,
        based_on: h.basedOn,
        trend_relevant: h.trendRelevant,
      }))
    ),

    result.triggerWords?.length && supabase.from('trigger_words').insert(
      result.triggerWords.map(t => ({
        scan_id: sid, user_id: userId,
        word: t.word,
        offer: t.offer,
        expected_comments: t.expectedComments,
        based_on: t.basedOn,
        caption_template: t.captionTemplate,
      }))
    ),
  ].filter(Boolean))
}

// ─── Saved scripts ────────────────────────────────────

export async function getScripts(userId: string): Promise<SavedScript[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('saved_scripts')
    .select('*')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })
  if (!data) return []
  return data.map(row => ({
    id: row.id,
    savedAt: row.saved_at,
    format: row.format,
    tone: row.tone,
    pillar: row.pillar ?? '',
    input: row.input,
    output: row.output,
    hookLine: row.hook_line,
  }))
}

export async function addScript(
  userId: string,
  script: Omit<SavedScript, 'id' | 'savedAt'>
): Promise<SavedScript> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('saved_scripts')
    .insert({
      user_id: userId,
      format: script.format,
      tone: script.tone,
      pillar: script.pillar ?? '',
      input: script.input,
      output: script.output,
      hook_line: script.hookLine,
    })
    .select()
    .single()
  if (error) throw error
  return {
    id: data.id,
    savedAt: data.saved_at,
    format: data.format,
    tone: data.tone,
    pillar: data.pillar ?? '',
    input: data.input,
    output: data.output,
    hookLine: data.hook_line,
  }
}

export async function deleteScript(userId: string, id: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('saved_scripts').delete().eq('user_id', userId).eq('id', id)
}

export async function updateScript(
  userId: string,
  id: string,
  updates: { output?: string; hookLine?: string }
): Promise<void> {
  const supabase = await createClient()
  const patch: Record<string, string> = {}
  if (updates.output   !== undefined) patch.output    = updates.output
  if (updates.hookLine !== undefined) patch.hook_line = updates.hookLine
  if (Object.keys(patch).length === 0) return
  await supabase.from('saved_scripts').update(patch).eq('user_id', userId).eq('id', id)
}

// ─── Trends cache ─────────────────────────────────────

export async function getTrendsCache(): Promise<TrendResult[] | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('trends_cache')
    .select('data')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data?.data as TrendResult[]) ?? null
}

export async function setTrendsCache(trends: TrendResult[]): Promise<void> {
  const supabase = await createClient()
  const expiresAt = new Date(Date.now() + 6 * HOUR * 1000).toISOString()
  await supabase.from('trends_cache').delete().lt('expires_at', new Date().toISOString())
  await supabase.from('trends_cache').insert({
    data: trends as unknown as Record<string, unknown>[],
    expires_at: expiresAt,
  })
}

// ─── Apify cache ──────────────────────────────────────

export async function getApifyCache<T>(key: string): Promise<T | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('apify_cache')
    .select('data')
    .eq('cache_key', key)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()
  return (data?.data as T) ?? null
}

export async function setApifyCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const supabase = await createClient()
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString()
  await supabase.from('apify_cache').upsert(
    { cache_key: key, data: value as Record<string, unknown>, expires_at: expiresAt },
    { onConflict: 'cache_key' }
  )
}

// ─── User context (master document) ──────────────────

export interface MasterDocSummary {
  niche: string
  tone: string
  keyTopics: string[]
  uniqueAngles: string[]
  targetAudience: string
  contentGoals: string[]
}

export interface UserContext {
  masterDocName?: string
  masterDocText?: string
  masterDocSummary?: MasterDocSummary
}

export async function getUserContext(userId: string): Promise<UserContext | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_context')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (!data) return null
  return {
    masterDocName: data.master_doc_name ?? undefined,
    masterDocText: data.master_doc_text ?? undefined,
    masterDocSummary: (data.master_doc_summary as MasterDocSummary) ?? undefined,
  }
}

export async function upsertUserContext(userId: string, ctx: UserContext): Promise<void> {
  const supabase = await createClient()
  await supabase.from('user_context').upsert({
    user_id: userId,
    master_doc_name: ctx.masterDocName ?? null,
    master_doc_text: ctx.masterDocText ?? null,
    master_doc_summary: ctx.masterDocSummary ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
}

// ─── Competitors ──────────────────────────────────────

export async function getCompetitors(userId: string): Promise<CompetitorAnalysis[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('competitors')
    .select('data')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data?.map(r => r.data as CompetitorAnalysis)) ?? []
}

export async function upsertCompetitor(userId: string, competitor: CompetitorAnalysis): Promise<void> {
  const supabase = await createClient()
  await supabase.from('competitors').upsert(
    {
      user_id: userId,
      handle: competitor.handle,
      data: competitor as unknown as Record<string, unknown>,
    },
    { onConflict: 'user_id,handle' }
  )
}

export async function deleteCompetitor(userId: string, handle: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('competitors').delete().eq('user_id', userId).eq('handle', handle)
}
