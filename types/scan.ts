export interface ScanResult {
  scannedAt: string
  profileInput: ProfileInput
  accountHealth: AccountHealth
  posts: Post[]
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
  competitors: CompetitorSuggestions
}

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

export interface AccountHealth {
  engagementRate: string
  engagementVerdict: string
  postingCadence: string
  topPerformingFormat: string
  weakestFormat: string
  bioScore: number
  bioIssues: string[]
  bioFix: string
}

export interface Post {
  id: string
  date: string
  topic: string
  likes: number
  comments: number
  tier: 1 | 2 | 3
  format: string
  pillarTag: string
  hookStrength: 'strong' | 'medium' | 'weak'
  whatWorked: string
}

export interface Pillar {
  name: string
  emoji: string
  percentage: number
  description: string
  bestFormat: string
  exampleIdeas: string[]
  basedOn: string
}

export interface Idea {
  title: string
  pillar: string
  trendScore: number
  trendDirection: 'rising' | 'falling' | 'stable'
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
  title: string
  hook: string
  optimisedFor: 'Reach' | 'Saves' | 'Comments' | 'DMs'
  triggerWord?: string
  postingTime: string
  trendSignal?: string
}

export interface PriorityAction {
  day: string
  action: string
  impact: string
  urgency: 'do first' | 'this week' | 'this month'
  completed?: boolean
}

export interface TrendKeyword {
  keyword: string
  interest: number
  direction: 'rising' | 'falling' | 'stable'
  breakout: boolean
  relatedQueries: string[]
  contentOpportunity: string
}

export interface Hook {
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

export interface BioFix {
  current: string
  issues: string[]
  recommended: string
}

export interface HashtagClusters {
  toolTutorials: string[]
  educationStudent: string[]
  opinionIndia: string[]
}

export interface CompetitorSuggestions {
  fromStrategy: string[]
  trendingInNiche: string[]
}

export interface SavedScript {
  id: string
  savedAt: string
  format: string
  tone: string
  pillar: string
  input: string
  output: string
  hookLine: string
}

export interface CompetitorAnalysis {
  handle: string
  strategy: string
  hooksToSteal: string[]
  gapsTheyLeave: string[]
  threatLevel: 'high' | 'medium' | 'low'
  threatReason: string
  collabScore: string
  collabPitch: string
  whitespace: string
}
