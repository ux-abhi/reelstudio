@AGENTS.md


# @uxabhi_ Studio — Design System & Claude Code Guidance
**Version:** 3.0 | **May 2026**
**Framework:** Antigravity
**Aesthetic:** Clean SaaS Dashboard — Linear × Notion × Vercel style
**Reference:** Screenshots provided (Freea, Rounds, Kelp CRM, Inntegrate)

---

## VISUAL DIRECTION

### What this style IS

Looking at the four reference screenshots, the aesthetic is:

- **Clean, professional SaaS** — not decorative, not glassmorphic
- **Data-first** — information is the design. Chrome steps back.
- **Confident typography** — large page titles, small dense labels
- **Minimal colour** — white/light backgrounds OR deep dark, with ONE accent
- **Cards without drama** — subtle border, gentle radius, almost no shadow
- **3-panel or sidebar layouts** — structured, navigable, information-dense

### What this style is NOT

- Not glassmorphic / translucent blur (that was the previous Apple direction)
- Not gradient heavy
- Not decorative or expressive
- Not minimal to the point of emptiness — it's data-dense but organised

### The mode choice for @uxabhi_ Studio

**Dark mode** — like Inntegrate (Image 4). Reasons:
- Content creation tools feel more focused in dark mode
- Your audience (designers) expects dark-mode creative tools
- Contrast between content and chrome is cleaner
- Aligns with Linear, Vercel, Raycast, Fig — tools designers use daily

---

## COLOUR SYSTEM

### Base palette

```css
/* Backgrounds — layered depth */
--bg-app:        #0f0f12;    /* app shell, body */
--bg-sidebar:    #0f0f12;    /* sidebar same as app */
--bg-card:       #1a1a1f;    /* standard cards */
--bg-card-hover: #1f1f25;    /* card hover state */
--bg-elevated:   #242429;    /* modals, dropdowns */
--bg-input:      #16161b;    /* form inputs */
--bg-subtle:     #141418;    /* subtle section backgrounds */

/* Borders */
--border:        #2a2a32;    /* standard border */
--border-subtle: #1f1f26;    /* very faint, table rows */
--border-strong: #3a3a45;    /* emphasized borders */
--border-focus:  #5b5bd6;    /* focus rings */

/* Text */
--text-primary:   #ededef;   /* main content */
--text-secondary: #a0a0ab;   /* labels, metadata */
--text-tertiary:  #62626a;   /* placeholders, disabled */
--text-inverse:   #0f0f12;   /* text on accent backgrounds */

/* Accent — single, violet-blue (Linear-inspired) */
--accent:         #5b5bd6;
--accent-hover:   #6e6ade;
--accent-subtle:  rgba(91,91,214,0.12);
--accent-border:  rgba(91,91,214,0.30);

/* Semantic */
--green:          #30a46c;   /* success, tier 1, rising trends */
--green-subtle:   rgba(48,164,108,0.12);
--yellow:         #f5a623;   /* warning, tier 2 */
--yellow-subtle:  rgba(245,166,35,0.12);
--red:            #e5484d;   /* error, destructive, falling */
--red-subtle:     rgba(229,72,77,0.12);
--blue:           #0090ff;   /* info, links */
--blue-subtle:    rgba(0,144,255,0.10);

/* Pillar colours — one per content pillar */
--pillar-toolbox:  #5b5bd6;  /* violet — Toolbox */
--pillar-decoded:  #30a46c;  /* green  — Design Decoded */
--pillar-take:     #e5484d;  /* red    — Honest Take */
--pillar-builder:  #f5a623;  /* amber  — Builder's Log */
--pillar-hci:      #0090ff;  /* blue   — HCI Life */
```

### Colour usage rules

- Cards use `--bg-card` with `--border` border. Never use background colour to convey meaning on cards.
- Accent `--accent` appears ONLY on: primary buttons, active nav items, focus rings, links, progress fill.
- Semantic colours (green, yellow, red) appear ONLY on: status badges, trend indicators, tier labels.
- Pillar colours appear ONLY on: pillar tags, left-border accents on pillar-related cards.
- Never use gradients on text. Never use gradients as card backgrounds.

---

## TYPOGRAPHY

### Font

```css
font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
```

Geist is Vercel's typeface — available free, clean, designed for interfaces. If unavailable in Antigravity, fall back to Inter.

```
Import: https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap
```

### Scale

```
--text-2xs:  10px  / line-height 1.4 / tracking +0.03em  — micro labels
--text-xs:   11px  / line-height 1.4 / tracking +0.01em  — tags, timestamps
--text-sm:   12px  / line-height 1.5 / tracking 0        — secondary body
--text-base: 14px  / line-height 1.6 / tracking -0.01em  — primary body
--text-md:   15px  / line-height 1.5 / tracking -0.01em  — slightly emphasised
--text-lg:   18px  / line-height 1.4 / tracking -0.02em  — card titles
--text-xl:   22px  / line-height 1.3 / tracking -0.03em  — section titles
--text-2xl:  28px  / line-height 1.2 / tracking -0.04em  — page titles
--text-3xl:  36px  / line-height 1.1 / tracking -0.04em  — hero numbers
```

### Weight usage

```
300 — never use (too thin at small sizes)
400 — body text, table cells, descriptions
500 — emphasis within body, nav items, card subtitles
600 — card titles, section headers, button labels
700 — page titles only
```

### Heading patterns

**Page title pattern:**
```
[Page title]           28px / weight 700 / --text-primary
[Subtitle]             14px / weight 400 / --text-secondary, margin-top: 4px
```

**Section header pattern:**
```
[SECTION LABEL]        11px / weight 600 / --text-tertiary / ALL CAPS / tracking +0.06em
```

**Card title:**
```
[Card title]           14px / weight 600 / --text-primary
[Card subtitle]        12px / weight 400 / --text-secondary, margin-top: 2px
```

---

## SPACING

8pt grid system — same as the reference screenshots.

```
2px  — hairline gaps (icon optical alignment)
4px  — micro (badge padding vertical)
6px  — tight (icon-to-label gap)
8px  — small (tag padding, tight rows)
12px — component inner padding (compact)
16px — component inner padding (standard)
20px — component inner padding (spacious)
24px — gap between cards
28px — section inner padding
32px — page padding horizontal
40px — section spacing
56px — major section breaks
```

### Layout measurements

```
Sidebar width:          220px (fixed)
Top bar height:         52px
Page max-width:         1080px (centered in content area)
Card border-radius:     10px
Button border-radius:   7px
Tag/badge radius:       5px
Pill button radius:     999px
Input border-radius:    8px
Modal border-radius:    14px
```

---

## CORE COMPONENTS

### App Shell

```
┌─────────────────────────────────────────────────────┐
│ SIDEBAR (220px)     │ MAIN CONTENT                  │
│ fixed, full height  │ padding: 32px                 │
│                     │ max-width: 1080px              │
│ ── logo             │                               │
│ ── scan status      │ [page title]                  │
│ ── nav sections     │ [page subtitle]               │
│                     │ ─────────────                 │
│ ── profile (bottom) │ [page content]                │
└─────────────────────────────────────────────────────┘
```

### Sidebar

```css
.sidebar {
  width: 220px;
  height: 100vh;
  position: fixed;
  left: 0; top: 0;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Logo area */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px 16px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 8px;
}
.sidebar-logo-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Section label */
.sidebar-section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  padding: 12px 8px 4px;
}

/* Nav item */
.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 400;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 140ms ease;
  text-decoration: none;
  border: 1px solid transparent;
}
.nav-item:hover {
  background: var(--bg-card);
  color: var(--text-primary);
}
.nav-item.active {
  background: var(--accent-subtle);
  color: var(--text-primary);
  font-weight: 500;
  border-color: var(--accent-border);
}

/* Profile pill */
.sidebar-profile {
  margin-top: auto;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  cursor: pointer;
  transition: background 140ms ease;
}
.sidebar-profile:hover { background: var(--bg-card); }
```

### Cards

```css
/* Standard card */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  transition: border-color 140ms ease;
}
.card:hover {
  border-color: var(--border-strong);
}

/* Elevated card — featured/today content */
.card-elevated {
  background: var(--bg-card);
  border: 1px solid var(--accent-border);
  border-radius: 12px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}
/* Left accent stripe — like Image 4 style cards */
.card-elevated::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--accent);
  border-radius: 3px 0 0 3px;
}

/* Pillar-coloured card */
.card-pillar-toolbox { border-color: rgba(91,91,214,0.25); }
.card-pillar-toolbox::before { background: var(--pillar-toolbox); }
.card-pillar-decoded { border-color: rgba(48,164,108,0.25); }
.card-pillar-decoded::before { background: var(--pillar-decoded); }
/* etc. */

/* Stat card — like Image 4 metric blocks */
.card-stat {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 20px;
}
.card-stat .stat-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}
.card-stat .stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.04em;
  line-height: 1;
}
.card-stat .stat-delta {
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
}
.stat-delta.positive { color: var(--green); }
.stat-delta.negative { color: var(--red); }
```

### Buttons

```css
/* Primary */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--accent);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  border-radius: 7px;
  border: none;
  cursor: pointer;
  transition: background 140ms ease, transform 100ms ease;
  letter-spacing: -0.01em;
  white-space: nowrap;
}
.btn-primary:hover { background: var(--accent-hover); }
.btn-primary:active { transform: scale(0.98); }

/* Secondary */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  border-radius: 7px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 140ms ease;
}
.btn-secondary:hover {
  background: var(--bg-card);
  color: var(--text-primary);
  border-color: var(--border-strong);
}

/* Ghost / icon button */
.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px; height: 30px;
  background: transparent;
  color: var(--text-tertiary);
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 140ms ease;
  font-size: 14px;
}
.btn-ghost:hover {
  background: var(--bg-card);
  color: var(--text-primary);
}

/* Destructive */
.btn-destructive {
  background: var(--red-subtle);
  color: var(--red);
  border: 1px solid rgba(229,72,77,0.25);
}
.btn-destructive:hover {
  background: rgba(229,72,77,0.20);
}
```

### Tags and Badges

```css
/* Base tag */
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.01em;
  border: 1px solid transparent;
}

/* Pillar tags */
.tag-toolbox { background: rgba(91,91,214,0.12); color: #8b8bf5; border-color: rgba(91,91,214,0.20); }
.tag-decoded  { background: rgba(48,164,108,0.12); color: #4cc38a; border-color: rgba(48,164,108,0.20); }
.tag-take     { background: rgba(229,72,77,0.12); color: #f2676b; border-color: rgba(229,72,77,0.20); }
.tag-builder  { background: rgba(245,166,35,0.12); color: #f5a623; border-color: rgba(245,166,35,0.20); }
.tag-hci      { background: rgba(0,144,255,0.10); color: #52b5ff; border-color: rgba(0,144,255,0.20); }

/* Status/tier badges */
.badge-t1 { background: var(--green-subtle); color: var(--green); border-color: rgba(48,164,108,0.25); }
.badge-t2 { background: var(--yellow-subtle); color: var(--yellow); border-color: rgba(245,166,35,0.25); }
.badge-t3 { background: rgba(255,255,255,0.05); color: var(--text-tertiary); border-color: var(--border-subtle); }

/* Trend badges */
.badge-rising  { background: var(--green-subtle); color: var(--green); }
.badge-falling { background: var(--red-subtle); color: var(--red); }
.badge-stable  { background: rgba(255,255,255,0.05); color: var(--text-tertiary); }

/* Urgency */
.badge-urgent { background: var(--red-subtle); color: var(--red); border: 1px solid rgba(229,72,77,0.25); }
.badge-soon   { background: var(--yellow-subtle); color: var(--yellow); border: 1px solid rgba(245,166,35,0.25); }
.badge-later  { background: rgba(255,255,255,0.05); color: var(--text-tertiary); border: 1px solid var(--border-subtle); }
```

### Inputs and Form Controls

```css
.input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  padding: 8px 12px;
  outline: none;
  transition: border-color 140ms ease;
  -webkit-appearance: none;
}
.input:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(91,91,214,0.15);
}
.input::placeholder { color: var(--text-tertiary); }

textarea.input {
  resize: vertical;
  min-height: 100px;
  line-height: 1.7;
}

/* Segmented control — like Image 1 view switcher */
.segmented {
  display: inline-flex;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}
.segment {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 120ms ease;
  border: none;
  background: none;
}
.segment.active {
  background: var(--bg-elevated);
  color: var(--text-primary);
  box-shadow: 0 1px 3px rgba(0,0,0,0.30);
}

/* Filter chips — like Image 3 left panel */
.chip-filter {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 400;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 120ms ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}
.chip-filter:hover { background: var(--bg-card); color: var(--text-primary); }
.chip-filter.active {
  background: var(--bg-card);
  color: var(--text-primary);
  font-weight: 500;
}
/* Chip count badge */
.chip-count {
  margin-left: auto;
  font-size: 11px;
  color: var(--text-tertiary);
  background: var(--bg-elevated);
  padding: 1px 6px;
  border-radius: 4px;
}
```

### Tables

Closely matching Image 3 (Kelp CRM) and Image 4 (Inntegrate) table style.

```css
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.table thead tr {
  border-bottom: 1px solid var(--border);
}

.table th {
  text-align: left;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.table td {
  padding: 11px 12px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: middle;
}

.table td.primary {
  color: var(--text-primary);
  font-weight: 500;
}

.table tbody tr {
  transition: background 100ms ease;
}
.table tbody tr:hover td {
  background: var(--bg-subtle);
}
.table tbody tr:last-child td {
  border-bottom: none;
}
```

### Progress / Health bars

```css
.health-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}
.health-label {
  font-size: 12px;
  color: var(--text-secondary);
  width: 140px;
  flex-shrink: 0;
}
.health-track {
  flex: 1;
  height: 5px;
  background: var(--bg-elevated);
  border-radius: 999px;
  overflow: hidden;
}
.health-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 500ms cubic-bezier(0.4,0,0.2,1) 100ms;
}
.health-fill.good   { background: var(--green); }
.health-fill.medium { background: var(--yellow); }
.health-fill.low    { background: var(--red); }
.health-fill.accent { background: var(--accent); }
.health-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  width: 44px;
  text-align: right;
  flex-shrink: 0;
}
```

### Skeleton loaders

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.8; }
}
.skeleton {
  background: var(--bg-elevated);
  border-radius: 5px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
```

### Toast

```css
.toast {
  position: fixed;
  bottom: 20px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  box-shadow: 0 4px 16px rgba(0,0,0,0.40);
  transform: translateY(60px);
  opacity: 0;
  transition: transform 240ms cubic-bezier(0.34,1.56,0.64,1), opacity 200ms ease;
  z-index: 9999;
  pointer-events: none;
}
.toast.show {
  transform: translateY(0);
  opacity: 1;
}
```

### Scan Progress Screen

```css
.scan-screen {
  position: fixed;
  inset: 0;
  background: var(--bg-app);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.scan-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.03em;
}
.scan-subtitle {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-bottom: 40px;
}
.scan-steps {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 320px;
}
.scan-step {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--text-tertiary);
  transition: color 200ms ease;
}
.scan-step.done { color: var(--text-primary); }
.scan-step.active { color: var(--text-primary); }
.scan-step-dot {
  width: 20px; height: 20px;
  border-radius: 50%;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px;
  flex-shrink: 0;
  transition: all 200ms ease;
}
.scan-step.done .scan-step-dot {
  background: var(--green-subtle);
  border-color: var(--green);
  color: var(--green);
}
.scan-step.active .scan-step-dot {
  background: var(--accent-subtle);
  border-color: var(--accent);
}
```

---

## LAYOUT PATTERNS

### Grid system

```css
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
.grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }

/* Stat row — like Image 4 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
}
```

### Three-column layout (like Image 3 — Kelp CRM)

Use for Competitor Analyzer page:

```
┌──────────┬───────────────────┬──────────────────────┐
│ Left     │ Center            │ Right                │
│ (200px)  │ (flex: 1)         │ (280px)              │
│ Filter   │ List of items     │ Detail panel         │
│ list     │                   │                      │
└──────────┴───────────────────┴──────────────────────┘
```

### Script Studio — split panel

```
┌───────────────────────┬───────────────────────────┐
│ Input panel (50%)     │ Output panel (50%)        │
│                       │                           │
│ Format selector       │ [HOOK] section            │
│ Tone selector         │ ─────────────             │
│ Textarea              │ [BODY] section            │
│ Action buttons        │ ─────────────             │
│ Quick inject row      │ [CTA] section             │
│                       │ ─────────────             │
│                       │ Copy | Save               │
└───────────────────────┴───────────────────────────┘
```

---

## ANIMATION SYSTEM

### Principles

- Functional, not decorative. Motion communicates state change.
- Short durations. Nothing longer than 300ms for UI transitions.
- No bounce/spring on data updates — only on confirmations.

### Timing functions

```css
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);   /* default */
--ease-out:      cubic-bezier(0, 0, 0.2, 1);       /* entering elements */
--ease-in:       cubic-bezier(0.4, 0, 1, 1);       /* exiting elements */
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1); /* confirmations/toasts */
```

### Standard animations

```css
/* Page enter */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.page-enter { animation: fadeIn 200ms var(--ease-out) forwards; }

/* Card stagger */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.card-enter { animation: slideUp 200ms var(--ease-out) both; }
/* Use animation-delay: calc(index * 40ms) for stagger */

/* Skeleton shimmer */
@keyframes shimmer {
  from { background-position: -600px 0; }
  to   { background-position: 600px 0; }
}
```

### Duration rules

```
Colour / border change:   100–120ms
Button press:             100ms
Nav item hover:           120–140ms
Card hover:               140ms
Page transition:          180–220ms
Modal appear:             200ms
Toast:                    240ms (spring)
Bar fill on mount:        500ms
Scan step complete:       200ms
```

---

## PAGE-BY-PAGE VISUAL SPEC

### Dashboard / Home

Layout: full width, no sidebar panels
- Trend Pulse: horizontal scrollable chip row at top — `height: 36px`, chips with trend badge inline
- Today's post: `.card-elevated` full width — accent left stripe, large title, metadata row
- Stats row: 3 stat cards in a row — engagement rate, posting cadence, last posted
- Top 3 actions: list-style, checkbox left, action text right, urgency badge

### Script Studio

Split panel layout (50/50).
- Format chips: `.segmented` control — not individual chips
- Tone chips: row of `.chip-filter` style toggles
- Output: monospace-feel text, hook line in accent colour, section labels in `--text-tertiary`
- Save button: `.btn-primary` small, appears after output generated

### Save Board

Cards in `.grid-2`.
Each card: hook line prominent (14px, weight 600), metadata row (format tag + date), collapsed body.
Filter bar: above grid, uses `.chip-filter` style (horizontal row on this page).

### Ideas Bank

Cards in `.grid-3`.
Each card: pillar tag top-left, trend badge top-right, title, whyNow text, trigger chip, CTA button.
Sort bar: right-aligned `.segmented` control.

### Account Audit

Top: 2-column grid — health bars left, bio fix right.
Posts table: full width below, standard `.table`.
Hashtag panel: tag cloud with coloured chips.

### 30-Day Calendar

4 week sections. Each week: card wrapper with week label.
Each row: day + date (80px fixed width) | post type badge | pillar tag | title | trend signal | action button.
Clean horizontal rows, `border-bottom: 1px solid var(--border-subtle)` between rows.

### Competitor Analyzer

3-column layout (Image 3 reference):
Left panel (200px): niche tag filters, list of tracked competitors
Center: analysis output or "Add competitor" form
Right panel (260px): quick steal — top 5 hooks from selected competitor

### Account Audit, Pillars, Triggers, Actions

Standard 2-column grid cards or full-width card with internal sections.
Always: page title + subtitle + divider + content.

---

## GLOBALS CSS TEMPLATE

```css
/* globals.css */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-app:        #0f0f12;
  --bg-sidebar:    #0f0f12;
  --bg-card:       #1a1a1f;
  --bg-card-hover: #1f1f25;
  --bg-elevated:   #242429;
  --bg-input:      #16161b;
  --bg-subtle:     #141418;
  --border:        #2a2a32;
  --border-subtle: #1f1f26;
  --border-strong: #3a3a45;
  --border-focus:  #5b5bd6;
  --text-primary:   #ededef;
  --text-secondary: #a0a0ab;
  --text-tertiary:  #62626a;
  --accent:         #5b5bd6;
  --accent-hover:   #6e6ade;
  --accent-subtle:  rgba(91,91,214,0.12);
  --accent-border:  rgba(91,91,214,0.30);
  --green:          #30a46c;
  --green-subtle:   rgba(48,164,108,0.12);
  --yellow:         #f5a623;
  --yellow-subtle:  rgba(245,166,35,0.12);
  --red:            #e5484d;
  --red-subtle:     rgba(229,72,77,0.12);
  --blue:           #0090ff;
  --blue-subtle:    rgba(0,144,255,0.10);
  --pillar-toolbox: #5b5bd6;
  --pillar-decoded: #30a46c;
  --pillar-take:    #e5484d;
  --pillar-builder: #f5a623;
  --pillar-hci:     #0090ff;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  background: var(--bg-app);
  color: var(--text-primary);
  font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  min-height: 100vh;
}

/* Scrollbar */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }

/* Selection */
::selection { background: rgba(91,91,214,0.25); color: var(--text-primary); }

/* Focus */
:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Divider */
.divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 20px 0;
}
```

---

## TAILWIND CONFIG

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'app':        '#0f0f12',
        'card':       '#1a1a1f',
        'elevated':   '#242429',
        'input-bg':   '#16161b',
        'subtle':     '#141418',
        'border':     '#2a2a32',
        'border-s':   '#1f1f26',
        'border-str': '#3a3a45',
        'text-p':     '#ededef',
        'text-s':     '#a0a0ab',
        'text-t':     '#62626a',
        'accent':     '#5b5bd6',
        'accent-h':   '#6e6ade',
        'success':    '#30a46c',
        'warning':    '#f5a623',
        'danger':     '#e5484d',
        'info':       '#0090ff',
      },
      fontFamily: {
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
        mono: ['Geist Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'sm': '5px',
        'DEFAULT': '7px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
        '2xl': '14px',
        'pill': '999px',
      },
      animation: {
        'fade-in':   'fadeIn 200ms ease-out both',
        'slide-up':  'slideUp 200ms ease-out both',
        'shimmer':   'shimmer 1.5s ease-in-out infinite',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.85)' },
          '50%':      { opacity: '1',   transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
```

---

## ANTIGRAVITY-SPECIFIC NOTES

When building in Antigravity:

1. **Components map directly** — every component in this system is a standard HTML/CSS pattern. Antigravity's component primitives should wrap these styles without adding their own visual opinions.

2. **Override defaults aggressively** — Antigravity may have default border-radius, shadow, or colour values. Override all of them with this design system's values.

3. **No component library defaults** — do not use Antigravity's pre-built card, button, or badge styles. Use the CSS variables and classes defined here.

4. **CSS variables in :root** — add the full `:root` block from globals.css to Antigravity's global styles file.

5. **Font loading** — load Geist via the Google Fonts import OR via next/font if the framework supports it.

6. **Dark mode** — this app is dark mode only. Do not implement light mode or system-preference switching. Antigravity's `prefers-color-scheme` handling should be disabled or set to dark-only.

---

## DO NOT DO

- ❌ No glassmorphism / backdrop-filter blur (removed from this version)
- ❌ No gradient backgrounds on cards
- ❌ No gradient text
- ❌ No multiple accent colours — `--accent` (#5b5bd6) only for UI chrome
- ❌ No box-shadows as decoration — only for dropdowns/modals (functional depth)
- ❌ No rounded corners above `border-radius: 12px` on cards
- ❌ No Inter, Roboto, Poppins as primary font — use Geist
- ❌ No ALL CAPS except section labels and table headers
- ❌ No `font-weight: 800` or `900` anywhere
- ❌ No coloured backgrounds on cards (except pillar-coloured elevated cards)
- ❌ No emoji in navigation labels
- ❌ No animations longer than 300ms on UI transitions

---

## REFERENCE SCREENSHOTS BREAKDOWN

### Image 1 (Freea — Designer Task)
Take from this: kanban column headers with `+` add button, progress bars on task cards,
priority tag style (coloured dot + label), avatar stack component, search bar in toolbar

### Image 2 (Rounds — Hiring)
Take from this: breadcrumb navigation pattern, round card style with date/count metadata,
right sidebar notification panel, section header "Interview Overview" with `+` and `...` actions,
the overall information density balance

### Image 3 (Kelp CRM — Notification Center)
Take from this: **3-column layout** (icon sidebar + list + detail) — use for Competitor Analyzer,
left filter list with count badges, timeline/feed style in detail panel, clean icon-only left rail

### Image 4 (Inntegrate — Hotel Dashboard)
Take from this: **stat cards with delta**, top navigation with dark background,
"Good morning" style dashboard greeting, booking table with status badges,
overall dark dashboard aesthetic closest to what @uxabhi_ Studio should feel like

---

*Design System v3.0 — @uxabhi_ Studio — May 2026*
*Replace uxabhi_design_system.md (v1.0 Apple Liquid Glass) with this file.*
*This is now the single source of truth for all visual decisions.*