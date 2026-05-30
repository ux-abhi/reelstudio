export type LogTimeframe = 'day' | 'week'
export type LogPlatform = 'instagram' | 'linkedin'

export interface InstagramLogPost {
  format: 'Reel' | 'Carousel' | 'Talking Head'
  title: string
  hook: string
  body: string
  cta: string
  caption: string
  basedOn: string
}

export interface LinkedInLogPost {
  type: 'story' | 'insight' | 'progress'
  title: string
  hook: string
  body: string
  cta: string
  hashtags: string[]
  basedOn: string
  imagePrompt: {
    prompt: string
    aspectRatio: '4:5' | '1:1'
    worksWellWith: string[]
  }
}

export interface LogResult {
  timeframe: LogTimeframe
  instagram: InstagramLogPost[]
  linkedin: LinkedInLogPost[]
}
