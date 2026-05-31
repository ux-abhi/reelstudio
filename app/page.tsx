import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LandingPage } from '@/components/landing/LandingPage'

export const metadata = {
  title: 'Draftr — Real Life. Real Drafts.',
  description: 'Turn your real work into Instagram scripts and LinkedIn posts. Built on your actual account data, not generic AI templates.',
}

export default async function RootPage() {
  const user = await getUser()
  if (user) redirect('/dashboard')
  return <LandingPage />
}
