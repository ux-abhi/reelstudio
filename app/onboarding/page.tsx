'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useScan } from '@/components/scan/ScanContext'
import { ScanProgress } from '@/components/scan/ScanProgress'
import { ManualPost, ProfileInput } from '@/types/scan'

const REAL_POSTS: ManualPost[] = [
  { title: 'Figma plugin Figr Identity — auto design systems in 30 seconds', likes: 2100, comments: 15, date: 'Jun 2024', format: 'Screen recording' },
  { title: 'Comment MAGIC — animated component library', likes: 1300, comments: 1900, date: 'Jun 2024', format: 'Screen recording' },
  { title: 'Life Update — HCI Masters, moving to Germany', likes: 52, comments: 26, date: 'Dec 2025', format: 'Talking Head' },
  { title: 'UX Series 05: Collaboration', likes: 53, comments: 3, date: 'Jan 2026', format: 'Talking Head' },
  { title: 'Penguin motivation reel', likes: 41, comments: 11, date: 'Jan 2026', format: 'Reel' },
  { title: 'UX Series episode', likes: 40, comments: 3, date: 'Jan 2026', format: 'Talking Head' },
  { title: 'UX Series episode 2', likes: 45, comments: 4, date: 'Jan 2026', format: 'Talking Head' },
  { title: 'Vibe coding with Google AI Studio', likes: 22, comments: 0, date: 'Feb 2026', format: 'Screen recording' },
  { title: 'Design meme — searching for a bug for 8 hours', likes: 35, comments: 2, date: 'Feb 2026', format: 'Reel' },
  { title: 'Using Google AI Studio for 3 months', likes: 44, comments: 2, date: 'Feb 2026', format: 'Screen recording' },
  { title: 'Copy any website styles to Framer using plugin', likes: 57, comments: 2, date: 'Feb 2026', format: 'Screen recording' },
  { title: '2026 Portfolio live! AI twist, built with Framer', likes: 43, comments: 8, date: 'Mar 2026', format: 'Screen recording' },
  { title: 'Productivity hacks to avoid procrastination', likes: 39, comments: 0, date: 'Apr 2026', format: 'Talking Head' },
  { title: 'Hindi rant: AI invading the designer\'s Instagram feed', likes: 90, comments: 19, date: 'Apr 2026', format: 'Talking Head' },
  { title: 'Built a Chrome extension to learn German — at 2am', likes: 81, comments: 34, date: 'Apr 2026', format: 'Talking Head' },
]

const FORMATS = ['Reel', 'Carousel', 'Talking Head', 'Screen recording', 'Stories']

export default function OnboardingPage() {
  const router = useRouter()
  const { runScan, isScanning } = useScan()
  const [step, setStep] = useState(1)

  const [handle, setHandle] = useState('uxabhi_')
  const [name, setName] = useState('Abhishek Jha')
  const [followers, setFollowers] = useState(1242)
  const [goal, setGoal] = useState(10000)
  const [niche, setNiche] = useState(
    'UX designer + HCI master\'s student in Germany. Figma, Framer, AI tools for designers, freelancing, Indian designer in Europe.'
  )
  const [posts, setPosts] = useState<ManualPost[]>(REAL_POSTS)
  const [bio, setBio] = useState(
    '#UX Designer sharing my #life frames | M.Sc HCI | Figuring out.. a new life 🇩🇪 🇮🇳'
  )

  function addPost() {
    setPosts(p => [...p, { title: '', likes: 0, comments: 0, date: '', format: 'Reel' }])
  }

  function updatePost(i: number, field: keyof ManualPost, value: string | number) {
    setPosts(p => p.map((post, idx) => idx === i ? { ...post, [field]: value } : post))
  }

  function removePost(i: number) {
    setPosts(p => p.filter((_, idx) => idx !== i))
  }

  async function handleSubmit() {
    const profile: ProfileInput = {
      handle,
      name,
      followers,
      goal,
      bio,
      posts,
    }
    await runScan(profile)
    router.push('/dashboard')
  }

  const canProceed = step === 1
    ? handle && name && followers > 0
    : step === 2
    ? niche.trim().length > 0
    : step === 3
    ? posts.length > 0
    : bio.trim().length > 0

  return (
    <>
      <ScanProgress />
      <div className="max-w-xl mx-auto py-12 px-4 page-enter">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.92)' }}>
            Set up your studio
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Step {step} of 4
          </p>

          {/* Progress bar */}
          <div className="bar-track mt-4">
            <div
              className="bar-fill bar-accent"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1 — Basic info */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <StepHeader
              title="Basic info"
              desc="Tell us about your account"
            />
            <Field label="Instagram handle">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>@</span>
                <input
                  className="input pl-7"
                  value={handle}
                  onChange={e => setHandle(e.target.value.replace('@', ''))}
                  placeholder="uxabhi_"
                />
              </div>
            </Field>
            <Field label="Your name">
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Abhishek Jha" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Current followers">
                <input
                  className="input"
                  type="number"
                  value={followers}
                  onChange={e => setFollowers(Number(e.target.value))}
                  placeholder="1242"
                />
              </Field>
              <Field label="30-day goal">
                <input
                  className="input"
                  type="number"
                  value={goal}
                  onChange={e => setGoal(Number(e.target.value))}
                  placeholder="10000"
                />
              </Field>
            </div>
          </div>
        )}

        {/* Step 2 — Niche */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <StepHeader
              title="Your niche"
              desc="What do you post about? Who do you help?"
            />
            <textarea
              className="input"
              rows={5}
              value={niche}
              onChange={e => setNiche(e.target.value)}
              placeholder="UX designer + HCI master's student..."
            />
          </div>
        )}

        {/* Step 3 — Posts */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <StepHeader
              title="Your posts"
              desc="Add your last 5–10 posts. More data = better dashboard. Pre-filled with your real posts."
            />
            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
              {posts.map((post, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3 flex flex-col gap-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <input
                      className="input text-sm py-1.5 flex-1"
                      value={post.title}
                      onChange={e => updatePost(i, 'title', e.target.value)}
                      placeholder="Post title or description"
                    />
                    <button
                      onClick={() => removePost(i)}
                      className="text-xs px-2 py-1.5 rounded-lg flex-shrink-0"
                      style={{ color: '#FF453A', background: 'rgba(255,69,58,0.10)' }}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <input className="input text-xs py-1" type="number" value={post.likes} onChange={e => updatePost(i, 'likes', Number(e.target.value))} placeholder="Likes" />
                    <input className="input text-xs py-1" type="number" value={post.comments} onChange={e => updatePost(i, 'comments', Number(e.target.value))} placeholder="Comments" />
                    <input className="input text-xs py-1" value={post.date} onChange={e => updatePost(i, 'date', e.target.value)} placeholder="Date" />
                    <select
                      className="input text-xs py-1"
                      value={post.format}
                      onChange={e => updatePost(i, 'format', e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                      {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addPost}
              className="text-sm font-medium py-2 rounded-full transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.60)',
                border: '0.5px solid rgba(255,255,255,0.10)',
              }}
            >
              + Add post
            </button>
          </div>
        )}

        {/* Step 4 — Bio */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <StepHeader
              title="Your current bio"
              desc="Paste your Instagram bio exactly as it is. Groq will analyse it and suggest improvements."
            />
            <textarea
              className="input"
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="#UX Designer sharing my #life frames..."
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.70)',
                border: '0.5px solid rgba(255,255,255,0.12)',
              }}
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed}
              className="flex-1 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: canProceed ? '#6e6aff' : 'rgba(110,106,255,0.30)',
                color: '#fff',
              }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isScanning || !canProceed}
              className="flex-1 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: isScanning ? 'rgba(110,106,255,0.30)' : '#6e6aff',
                color: '#fff',
              }}
            >
              {isScanning ? 'Running scan...' : 'Run My Scan'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

function StepHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-xl font-semibold mb-1" style={{ letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.92)' }}>
        {title}
      </h2>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>{desc}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)', letterSpacing: '0.02em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
