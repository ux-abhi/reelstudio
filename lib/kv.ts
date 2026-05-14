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
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})
