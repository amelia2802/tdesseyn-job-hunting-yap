# Frontend Specification — Podcast Tips Extractor

**Project:** Personal knowledge base for Twitter/X Spaces & LinkedIn Live tips  
**Stack:** React 18 · Vite · Tailwind CSS · TanStack Query  
**Hosting:** Vercel free tier  

---

## 1. Technology Stack

| Tool | Purpose | Why |
|------|---------|-----|
| **Vite** | Build tool | Instant dev server, fast builds |
| **React 18** | UI framework | Component model, large ecosystem |
| **Tailwind CSS** | Styling | No custom CSS files needed |
| **TanStack Query v5** | Server state | Handles loading, caching, polling |
| **React Router v6** | Navigation | URL-based routing and filter params |
| **Axios** | HTTP client | Simpler than raw fetch |
| **Lucide React** | Icons | Free, lightweight, tree-shakable |
| **date-fns** | Date formatting | e.g. "Jan 15, 2024" |

Zero paid tools. Deploys to Vercel free tier alongside the backend.

---

## 2. Folder Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.jsx
│   ├── App.jsx                   # Router setup + QueryClientProvider
│   ├── api/
│   │   ├── client.js             # Axios instance
│   │   └── episodes.js           # API call functions
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   └── EpisodePage.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── submit/
│   │   │   ├── SubmitForm.jsx
│   │   │   ├── ManualPasteDrawer.jsx   # Slide-in for LinkedIn manual paste
│   │   │   └── ProcessingStatus.jsx
│   │   ├── episodes/
│   │   │   ├── EpisodeCard.jsx
│   │   │   ├── EpisodeGrid.jsx
│   │   │   └── EpisodeDetail.jsx
│   │   ├── tips/
│   │   │   ├── TipList.jsx
│   │   │   └── TipItem.jsx
│   │   ├── filters/
│   │   │   ├── FilterBar.jsx
│   │   │   ├── TagCloud.jsx
│   │   │   └── SearchBar.jsx
│   │   └── ui/
│   │       ├── Badge.jsx
│   │       ├── Spinner.jsx
│   │       ├── EmptyState.jsx
│   │       └── StatusBanner.jsx
│   ├── hooks/
│   │   ├── useEpisodes.js
│   │   ├── useEpisode.js         # Includes polling logic
│   │   ├── useSubmit.js
│   │   └── useTags.js
│   └── utils/
│       ├── categoryColors.js
│       └── platformHelpers.js    # Icons, labels for Twitter/LinkedIn
├── .env.example
├── tailwind.config.js
└── vite.config.js
```

---

## 3. Pages

### 3.1 Home Page (`/`)

**Desktop layout (1024px+):**
```
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR: App name                          [+ Add Episode]  │
├───────────────┬─────────────────────────────────────────────┤
│               │  [Search bar]          [Sort: Newest ▼]    │
│  SIDEBAR      │                                             │
│               │  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  Submit URL   │  │ Card     │ │ Card     │ │ Card     │   │
│  ──────────   │  │          │ │          │ │          │   │
│  Tags         │  └──────────┘ └──────────┘ └──────────┘   │
│  Platform     │                                             │
│  Host type    │  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│               │  │ Card     │ │ Card     │ │ Card     │   │
└───────────────┴─────────────────────────────────────────────┘
```

**Mobile layout (< 768px):**
- Single column
- Sidebar hidden, replaced by a bottom sheet / drawer
- Filter button in the navbar opens the drawer
- Submit form accessible via floating "+" button

---

### 3.2 Episode Detail Page (`/episodes/:id`)

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to all episodes                                 │
│                                                         │
│  [Twitter icon] Jan 15, 2024         [Guest: Jane Doe] │
│                                                         │
│  Negotiating your first offer                           │
│                                                         │
│  #salary  #negotiation  #mindset                        │
│                                                         │
│  ┌─ Summary ──────────────────────────────────────────┐ │
│  │ Jane shares her three-step framework for           │ │
│  │ negotiating offers, covering research, anchoring,  │ │
│  │ and handling counteroffers...                      │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Tips  (8)                                              │
│                                                         │
│  1  Always get the offer in writing before ...  [neg]  │
│  2  Research Levels.fyi before any call         [job]  │
│  3  Your first number anchors the range         [neg]  │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Submit Form — The Critical UX Flow

This is the most important component. The entire product lives or dies on how smooth this feels.

### 4.1 Form States

**State 1 — Idle:**
```
┌─────────────────────────────────────────────┐
│  🔗 Paste a Twitter Space or LinkedIn URL    │
│  ─────────────────────────────────────────  │
│  [                                       ]  │
│                          [Extract Tips →]   │
└─────────────────────────────────────────────┘
```

**State 2 — URL entered (optional fields expand):**
When the user types/pastes a URL, detect the platform and show the platform badge. Optional fields slide down:
```
[twitter.com/i/spaces/abc123      ] ← Twitter icon appears
                                    
Episode date: [Jan 15 2024     ▼]  ← defaults to today
Guest name:   [Jane Doe          ]  ← placeholder "Solo episode"
☐ Paste transcript manually         ← checkbox for LinkedIn fallback
                        [Extract Tips →]
```

**State 3 — LinkedIn URL detected:**
LinkedIn is unreliable. When a LinkedIn URL is detected, proactively warn:
```
⚠️  LinkedIn downloads often fail. Check "paste manually"
    if extraction doesn't work, or paste captions from the
    LinkedIn Live page.
```
Automatically pre-check the "paste manually" checkbox.

**State 4 — Manual paste mode (checkbox ticked):**
Large textarea expands:
```
Paste the transcript or captions below:
┌──────────────────────────────────────┐
│                                      │
│  (paste text here)                   │
│                                      │
│                                      │
└──────────────────────────────────────┘
                        [Extract Tips →]
```

**State 5 — Processing:**
Button disabled. Show a status banner with live stages:
```
┌─ Extracting tips... ───────────────────────────────────┐
│  ● Downloading audio    ✓                              │
│  ○ Transcribing...      (Gemini is processing)         │
│  ○ Extracting tips                                     │
│  ○ Done                                                │
│                                    Approx. 1-3 min     │
└────────────────────────────────────────────────────────┘
```

This status is simulated on the frontend (we don't get real stage updates from the backend). Show each stage for ~15 seconds before moving to the next. The polling result overrides everything when it returns.

**State 6 — Needs manual paste (backend returned `needs_manual`):**
```
⚠️  LinkedIn couldn't be downloaded automatically.
    Please paste the transcript below to continue.
    [textarea appears]              [Extract from text →]
```
The episode already exists in the DB — resubmit to the same endpoint with `manual_transcript` filled.

**State 7 — Success:**
```
✓  Done! 8 tips extracted from "Negotiating your first offer"
   [View episode →]
```
New card animates into the grid at the top.

**State 8 — Error:**
```
✗  Something went wrong: yt-dlp couldn't download this Space.
   The recording may have been deleted or was a private space.
   [Try manual paste instead]   [Dismiss]
```

---

## 5. Polling Logic (Key Technical Detail)

The backend processes asynchronously. The frontend must poll until done.

```js
// src/hooks/useEpisode.js
import { useQuery } from '@tanstack/react-query'
import { fetchEpisode } from '../api/episodes'

export function useEpisode(id, options = {}) {
  return useQuery({
    queryKey: ['episode', id],
    queryFn: () => fetchEpisode(id),
    // Poll every 4 seconds while status is pending/processing
    refetchInterval: (data) => {
      const status = data?.status
      if (status === 'done' || status === 'failed' || status === 'needs_manual') {
        return false  // Stop polling
      }
      return 4000  // Poll every 4 seconds
    },
    enabled: !!id,
    ...options,
  })
}
```

```js
// src/hooks/useSubmit.js
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitEpisodeUrl } from '../api/episodes'

export function useSubmit() {
  const queryClient = useQueryClient()
  const [processingEpisodeId, setProcessingEpisodeId] = useState(null)
  
  const mutation = useMutation({
    mutationFn: submitEpisodeUrl,
    onSuccess: (data) => {
      setProcessingEpisodeId(data.episode_id)
    },
    onError: () => {
      setProcessingEpisodeId(null)
    }
  })
  
  const onEpisodeDone = () => {
    setProcessingEpisodeId(null)
    // Refresh the episodes list so the new card appears
    queryClient.invalidateQueries({ queryKey: ['episodes'] })
  }
  
  return { mutation, processingEpisodeId, onEpisodeDone }
}
```

In `SubmitForm.jsx`, when `processingEpisodeId` is set, render `<ProcessingStatus episodeId={processingEpisodeId} onDone={onEpisodeDone} />`. That component calls `useEpisode(episodeId)` with polling, and when `status === 'done'` it calls `onDone()`.

---

## 6. Episode Card Design

```jsx
// src/components/episodes/EpisodeCard.jsx
// Tailwind classes listed — no extra CSS needed

function EpisodeCard({ episode }) {
  return (
    <Link to={`/episodes/${episode.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-5
                 hover:shadow-md hover:border-gray-300 transition-all duration-200
                 cursor-pointer group">
      
      {/* Top row: platform + date + badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <PlatformIcon platform={episode.platform} />
          <span>{formatDate(episode.episode_date)}</span>
        </div>
        <HostBadge hostOnly={episode.host_only} guestName={episode.guest_name} />
      </div>
      
      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2
                     group-hover:text-blue-600 transition-colors line-clamp-2">
        {episode.title}
      </h3>
      
      {/* Guest name or tip count */}
      <p className="text-sm text-gray-500 mb-3">
        {episode.guest_name
          ? `${episode.guest_name} · ${episode.tip_count} tips`
          : `${episode.tip_count} tips`}
      </p>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {episode.tags.slice(0, 4).map(tag => (
          <span key={tag}
            className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  )
}
```

**Platform icons mapping:**
```js
// src/utils/platformHelpers.js
import { Twitter, Linkedin } from 'lucide-react'

export const platformConfig = {
  twitter:  { icon: Twitter,  label: 'Twitter Space', color: 'text-sky-500' },
  linkedin: { icon: Linkedin, label: 'LinkedIn Live',  color: 'text-blue-600' },
  manual:   { icon: FileText, label: 'Manual',         color: 'text-gray-400' },
}
```

**Host/Guest badge:**
```jsx
function HostBadge({ hostOnly, guestName }) {
  if (hostOnly) {
    return <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">Solo</span>
  }
  return <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">Guest</span>
}
```

---

## 7. Tip List Design

```jsx
// src/components/tips/TipItem.jsx

function TipItem({ tip, index }) {
  const [copied, setCopied] = useState(false)
  
  const copyTip = () => {
    navigator.clipboard.writeText(tip.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const { bg, text, label } = categoryColors[tip.category] || categoryColors.other
  
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 group
                    hover:bg-gray-50 rounded-lg px-3 -mx-3 transition-colors">
      
      {/* Number */}
      <span className="text-sm font-mono text-gray-400 mt-0.5 w-5 shrink-0">
        {index + 1}
      </span>
      
      {/* Tip text */}
      <p className="flex-1 text-gray-800 text-sm leading-relaxed">
        {tip.content}
      </p>
      
      {/* Right side: category badge + copy button */}
      <div className="flex items-start gap-2 shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded-full ${bg} ${text}`}>
          {label}
        </span>
        <button
          onClick={copyTip}
          className="opacity-0 group-hover:opacity-100 transition-opacity
                     text-gray-400 hover:text-gray-600 p-1 rounded"
          title="Copy tip">
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  )
}
```

---

## 8. Filters and URL Params

All active filters are reflected in the URL (`/?tag=salary&platform=twitter&type=guest`), making them bookmarkable.

```js
// src/hooks/useEpisodes.js
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { fetchEpisodes } from '../api/episodes'

export function useEpisodes() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  const filters = {
    tag:      searchParams.get('tag'),
    platform: searchParams.get('platform'),
    type:     searchParams.get('type'),     // 'solo' | 'guest'
    search:   searchParams.get('search'),
    sort:     searchParams.get('sort') || 'newest',
    page:     Number(searchParams.get('page')) || 1,
  }
  
  const query = useQuery({
    queryKey: ['episodes', filters],
    queryFn: () => fetchEpisodes(filters),
    staleTime: 30_000,
  })
  
  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')   // Reset page when filter changes
    setSearchParams(next)
  }
  
  return { ...query, filters, setFilter }
}
```

```jsx
// TagCloud usage
function TagCloud({ tags }) {
  const { filters, setFilter } = useEpisodes()
  
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <button
          key={tag.name}
          onClick={() => setFilter('tag', filters.tag === tag.name ? null : tag.name)}
          className={`text-sm px-3 py-1 rounded-full border transition-colors
            ${filters.tag === tag.name
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}>
          {tag.name}
          <span className="ml-1 text-xs opacity-60">{tag.episode_count}</span>
        </button>
      ))}
    </div>
  )
}
```

---

## 9. Category Colors Map

```js
// src/utils/categoryColors.js
export const categoryColors = {
  job_hunting:  { bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Job hunting'  },
  networking:   { bg: 'bg-violet-50', text: 'text-violet-700', label: 'Networking'   },
  upskilling:   { bg: 'bg-emerald-50',text: 'text-emerald-700',label: 'Upskilling'   },
  negotiation:  { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Negotiation'  },
  management:   { bg: 'bg-rose-50',   text: 'text-rose-700',   label: 'Management'   },
  tech_trends:  { bg: 'bg-cyan-50',   text: 'text-cyan-700',   label: 'Tech trends'  },
  mindset:      { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Mindset'      },
  other:        { bg: 'bg-gray-100',  text: 'text-gray-600',   label: 'Other'        },
}
```

---

## 10. API Layer

```js
// src/api/client.js
import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10_000,   // Fast requests only — polling handles the wait
})

// Global error handler
client.interceptors.response.use(
  r => r,
  err => {
    const msg = err.response?.data?.error || err.message || 'Something went wrong'
    return Promise.reject(new Error(msg))
  }
)

export default client
```

```js
// src/api/episodes.js
import client from './client'

export const fetchEpisodes  = (params) => client.get('/episodes', { params }).then(r => r.data)
export const fetchEpisode   = (id) => client.get(`/episodes/${id}`).then(r => r.data)
export const submitUrl      = (data) => client.post('/process', data).then(r => r.data)
export const fetchTags      = () => client.get('/tags').then(r => r.data)
export const deleteEpisode  = (id) => client.delete(`/episodes/${id}`).then(r => r.data)
export const patchEpisode   = (id, data) => client.patch(`/episodes/${id}`, data).then(r => r.data)
```

---

## 11. Environment Variables

```bash
# .env.local (development)
VITE_API_URL=http://localhost:8000/api

# Vercel dashboard → Settings → Environment Variables (production)
VITE_API_URL=https://your-backend.vercel.app/api
```

---

## 12. `package.json` Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "@tanstack/react-query": "^5.56.2",
    "axios": "^1.7.7",
    "lucide-react": "^0.447.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.8",
    "tailwindcss": "^3.4.13",
    "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20"
  }
}
```

---

## 13. Development Setup

```bash
# Create project
npm create vite@latest frontend -- --template react
cd frontend

# Install all deps
npm install react-router-dom @tanstack/react-query axios lucide-react date-fns
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# tailwind.config.js — add content paths:
# content: ["./index.html", "./src/**/*.{js,jsx}"]

# src/index.css — add at top:
# @tailwind base;
# @tailwind components;
# @tailwind utilities;

# Create .env.local
echo "VITE_API_URL=http://localhost:8000/api" > .env.local

# Start dev server
npm run dev
# → http://localhost:5173
```

---

## 14. Deployment to Vercel

```bash
# Option A: Vercel CLI
npm install -g vercel
cd frontend
vercel        # Follow prompts, add VITE_API_URL env variable

# Option B: GitHub import (easier)
# 1. Push to GitHub
# 2. vercel.com → New Project → Import your repo
# 3. Framework preset: Vite
# 4. Add environment variable: VITE_API_URL
# 5. Deploy
```

Both the frontend and backend can deploy to the **same** Vercel project if you structure it as a monorepo:
```
my-podcast-tips/
├── frontend/     ← Vite app
├── api/          ← Python serverless functions  ← Vercel reads this automatically
├── lib/          ← Shared Python modules
└── vercel.json
```

---

## 15. Build Order (7-Day Plan)

| Day | Goal |
|-----|------|
| Day 1 | Scaffold Vite + Tailwind. Build static layout: navbar, sidebar, empty grid. No API calls. |
| Day 2 | Build `SubmitForm` with all 8 states (static, no API yet). Use fake data to check transitions. |
| Day 3 | Connect `SubmitForm` to real API. Add polling with `useEpisode`. See first real episode appear. |
| Day 4 | Build `EpisodeCard` grid and `EpisodePage` with real tip data. |
| Day 5 | Add `TagCloud`, `FilterBar`, and URL query params. Filters should update the card grid. |
| Day 6 | Build the LinkedIn `ManualPasteDrawer` and `needs_manual` recovery flow. |
| Day 7 | Polish: mobile responsive layout, empty states, error messages. Deploy to Vercel. |

**Pro tip:** On Day 1, create a `mockData.js` file with a few fake episodes and tips. Use this everywhere until Day 3 when you wire up real API calls. This way you can style everything without needing the backend ready.
