import { Redis } from '@upstash/redis'

export const KV_KEYS = {
  scan:           'uxabhi:scan:latest',
  trends:         'uxabhi:trends',
  scripts:        'uxabhi:scripts',
  apifyProfile:   'uxabhi:apify:profile',
  apifyPosts:     'uxabhi:apify:posts',
  actionsChecked: 'uxabhi:actions:checked',
  competitorList: 'uxabhi:competitors:tracked',
  apifyCompetitor: (handle: string) => `uxabhi:apify:competitor:${handle.toLowerCase()}`,
} as const

export const KV_TTL = {
  scan:       60 * 60 * 24,  // 24h
  trends:     60 * 60 * 6,   // 6h
  apify:      60 * 60 * 24,  // 24h
  competitor: 60 * 60 * 24,  // 24h
} as const

export const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})
