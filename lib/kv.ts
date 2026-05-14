import { Redis } from '@upstash/redis'

export const KV_KEYS = {
  scan: 'uxabhi:scan:latest',
  trends: 'uxabhi:trends',
  scripts: 'uxabhi:scripts',
} as const

export const KV_TTL = {
  scan: 60 * 60 * 6,    // 6 hours
  trends: 60 * 60 * 6,  // 6 hours
} as const

export const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
