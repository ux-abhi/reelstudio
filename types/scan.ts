/* ─── Core scan result ───────────────────────────── */

export interface ScanResult {
  scannedAt: string
  handle: string
  // Kept for backward compat — populated from Apify or manual input
  profileInput?: ProfileInput
  // Real Apify profile (present when APIFY_TOKEN is set)
  instagramProfile?: InstagramProfile
  accountHealth: AccountHealth
  posts: AnalyzedPost[]
  pillars: Pillar[]
  contentGaps: string[]
  ideas: Idea[]
  calendar: CalendarDay[]
  priorityActions: PriorityAction[]
  trendPulse: TrendKeyword[]
  hooks: Hook[]
  triggerWords: TriggerWord[]
  bioFix: BioFix
  hashtagClusters: HashtagClusters
  competitorSuggestions: string[]
}

/* ─── Profile types ──────────────────────────────── */

export interface InstagramProfile {
  handle: string
  name: string
  bio: string
  followers: number
  following: number
  postCount: number
  isVerified: boolean
  profilePicUrl?: string
  category?: string
  website?: string
}

/** Manual input (onboarding form / backward compat) */
export interface ProfileInput {
  handle: string
  name: string
  followers: number
  goal: number
  bio: string
  posts: ManualPost[]
}

export interface ManualPost {
  title: string
  likes: number
  comments: number
  date: string
  format?: string
}

/* ─── Account health ─────────────────────────────── */

export interface AccountHealth {
  engagementRate: string | number
  engagementVerdict: string
  postingCadence: string
  cadenceVerdict?: string
  topPerformingFormat: string
  weakestFormat: string
  bioScore: number
  bioIssues: string[]
  bioFix?: string
  hookStrengthOverall?: 'strong' | 'medium' | 'weak'
  visualIdentityScore?: number
}

/* ─── Posts ──────────────────────────────────────── */

export interface AnalyzedPost {
  id: string
  date: string
  topic: string
  caption?: string
  likes: number
  comments: number
  hashtags?: string[]
  tier: 1 | 2 | 3
  format: string
  pillarTag: string
  pillarColorKey?: string
  hookStrength: 'strong' | 'medium' | 'weak'
  whatWorked: string
  whatDidnt?: string
  permalink?: string
}

/** Alias for backward compat */
export type Post = AnalyzedPost

/* ─── Content strategy ───────────────────────────── */

export interface Pillar {
  name: string
  emoji: string
  percentage: number
  description: string
  bestFormat: string
  exampleIdeas: string[]
  basedOn: string
  colorKey?: 'toolbox' | 'decoded' | 'take' | 'builder' | 'hci'
}

export interface Idea {
  id?: string
  title: string
  pillar: string
  pillarColorKey?: string
  trendScore: number
  trendDirection: 'rising' | 'falling' | 'stable'
  trendKeyword?: string
  hookSuggestion: string
  triggerWord?: string
  urgency: 'post this week' | 'post this month' | 'evergreen'
  whyNow: string
}

export interface CalendarDay {
  dayNumber: number
  date: string
  dayName: string
  postType: 'Reel' | 'Carousel' | 'Stories' | 'Talking Head'
  pillar: string
  pillarColorKey?: string
  title: string
  hook: string
  optimisedFor: 'Reach' | 'Saves' | 'Comments' | 'DMs'
  triggerWord?: string
  postingTime: string
  trendSignal?: string
}

export interface PriorityAction {
  id?: string
  day: string
  action: string
  impact: string
  urgency: 'do first' | 'this week' | 'this month' | 'urgent' | 'soon' | 'later'
  completed?: boolean
}

/* ─── Trends ─────────────────────────────────────── */

export interface TrendKeyword {
  keyword: string
  interest: number
  direction: 'rising' | 'falling' | 'stable'
  breakout: boolean
  relatedQueries: string[]
  contentOpportunity: string
}

/* ─── Hooks & triggers ───────────────────────────── */

export interface Hook {
  id?: string
  text: string
  type: 'curiosity' | 'story' | 'hot-take' | 'hinglish'
  basedOn: string
  trendRelevant: boolean
}

export interface TriggerWord {
  word: string
  offer: string
  expectedComments: string
  basedOn: string
  captionTemplate: string
}

/* ─── Bio & hashtags ─────────────────────────────── */

export interface BioFix {
  current: string
  issues: string[]
  recommended: string
}

export interface HashtagClusters {
  primary: string[]
  secondary: string[]
  niche: string[]
}

/* ─── Competitors ────────────────────────────────── */

export interface CompetitorAnalysis {
  handle: string
  strategy: string
  avgEngagement?: string
  postingFrequency?: string
  hooksToSteal: string[]
  gapsTheyLeave: string[]
  threatLevel: 'high' | 'medium' | 'low'
  threatReason: string
  collabScore: string
  collabPitch: string
  whitespace: string
  scrapedAt?: string
}

/* ─── Saved scripts ──────────────────────────────── */

export interface SavedScript {
  id: string
  savedAt: string
  format: string
  tone: string
  pillar?: string
  input: string
  output: string
  hookLine: string
}
