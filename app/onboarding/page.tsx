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
    "UX designer + HCI master's student in Germany. Figma, Framer, AI tools for designers, freelancing, Indian designer in Europe."
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
    const profile: ProfileInput = { handle, name, followers, goal, bio, posts }
    await runScan(profile)
    router.push('/dashboard')
  }

  const canProceed = step === 1
    ? !!(handle && name && followers > 0)
    : step === 2
    ? niche.trim().length > 0
    : step === 3
    ? posts.length > 0
    : bio.trim().length > 0

  const STEP_LABELS = ['Basic info', 'Your niche', 'Recent posts', 'Your bio']

  return (
    <>
      <ScanProgress />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 16px' }} className="page-enter">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: 4 }}>
            Set up your studio
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Step {step} of 4 — {STEP_LABELS[step - 1]}</p>

          {/* Progress bar */}
          <div style={{ height: 3, background: 'var(--border)', borderRadius: 99, marginTop: 16, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: 'var(--accent)',
                borderRadius: 99,
                width: `${(step / 4) * 100}%`,
                transition: 'width 300ms ease',
              }}
            />
          </div>
        </div>

        {/* Step 1 — Basic info */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <StepHeader title="Basic info" desc="Tell us about your account" />
            <Field label="Instagram handle">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-tertiary)' }}>@</span>
                <input className="input" style={{ paddingLeft: 26 }} value={handle} onChange={e => setHandle(e.target.value.replace('@', ''))} placeholder="uxabhi_" />
              </div>
            </Field>
            <Field label="Your name">
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Abhishek Jha" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Current followers">
                <input className="input" type="number" value={followers} onChange={e => setFollowers(Number(e.target.value))} placeholder="1242" />
              </Field>
              <Field label="30-day goal">
                <input className="input" type="number" value={goal} onChange={e => setGoal(Number(e.target.value))} placeholder="10000" />
              </Field>
            </div>
          </div>
        )}

        {/* Step 2 — Niche */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <StepHeader title="Your niche" desc="What do you post about? Who do you help?" />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <StepHeader title="Your recent posts" desc="Pre-filled with real posts. Edit or add more — better data = better recommendations." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
              {posts.map((post, i) => (
                <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="input"
                      style={{ fontSize: 13, flex: 1 }}
                      value={post.title}
                      onChange={e => updatePost(i, 'title', e.target.value)}
                      placeholder="Post title or description"
                    />
                    <button
                      onClick={() => removePost(i)}
                      className="btn-destructive"
                      style={{ fontSize: 12, flexShrink: 0, padding: '6px 10px' }}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.5fr', gap: 8 }}>
                    <input className="input" style={{ fontSize: 12 }} type="number" value={post.likes} onChange={e => updatePost(i, 'likes', Number(e.target.value))} placeholder="Likes" />
                    <input className="input" style={{ fontSize: 12 }} type="number" value={post.comments} onChange={e => updatePost(i, 'comments', Number(e.target.value))} placeholder="Comments" />
                    <input className="input" style={{ fontSize: 12 }} value={post.date} onChange={e => updatePost(i, 'date', e.target.value)} placeholder="Date" />
                    <select
                      className="input"
                      style={{ fontSize: 12, background: 'var(--bg-input)' }}
                      value={post.format}
                      onChange={e => updatePost(i, 'format', e.target.value)}
                    >
                      {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addPost} className="btn-secondary" style={{ fontSize: 13 }}>
              + Add post
            </button>
          </div>
        )}

        {/* Step 4 — Bio */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <StepHeader title="Your current bio" desc="Paste your Instagram bio exactly as it appears. Groq will analyse it and suggest improvements." />
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
        <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="btn-secondary"
              style={{ fontSize: 14 }}
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed}
              className="btn-primary"
              style={{ flex: 1, fontSize: 14, opacity: canProceed ? 1 : 0.4, cursor: canProceed ? 'pointer' : 'not-allowed' }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isScanning || !canProceed}
              className="btn-primary"
              style={{ flex: 1, fontSize: 14, opacity: (isScanning || !canProceed) ? 0.4 : 1, cursor: (isScanning || !canProceed) ? 'not-allowed' : 'pointer' }}
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
    <div style={{ marginBottom: 8 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
        {title}
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{desc}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}
