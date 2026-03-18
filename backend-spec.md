# Backend Specification — Podcast Tips Extractor (Node.js)

**Project:** Personal knowledge base for Twitter/X Spaces & LinkedIn Live tips  
**Stack:** Node.js · Express · Vercel Serverless · Supabase · Gemini API  
**Language:** JavaScript (same language as your frontend!)  
**Budget:** Zero-cost (student) — all free tiers only  

---

## 1. Why Node.js Works Perfectly Here

- You already know JavaScript — no new language to learn
- Vercel was built for Node.js first — best support, best docs
- The Gemini SDK has a first-class JavaScript/Node package
- `yt-dlp` is a command-line tool — Node.js calls it the same way Python does
- Supabase's best SDK is JavaScript

The only change from the Python spec is the language. The architecture, database schema, endpoints, and prompts are all identical.

---

## 2. Technology Stack

| Layer | Tool | Free Tier |
|-------|------|-----------|
| Runtime | **Node.js 20** | Built into Vercel |
| Framework | **Express.js** | Open source |
| Database | **Supabase** (PostgreSQL) | 500MB free forever |
| AI | **Gemini 1.5 Flash** (Google AI SDK) | 1,500 req/day free |
| Audio download | **yt-dlp** (CLI tool) | Open source |
| Hosting | **Vercel** | 100k function calls/month free |

---

## 3. Folder Structure

```
backend/
├── api/                          # Each file = one Vercel serverless function
│   ├── process.js                # POST /api/process
│   ├── worker.js                 # POST /api/worker (heavy processing)
│   ├── episodes/
│   │   ├── index.js              # GET /api/episodes (list + filter)
│   │   └── [id].js               # GET /api/episodes/:id  |  DELETE
│   └── tags/
│       └── index.js              # GET /api/tags
├── lib/                          # Shared modules (not Vercel endpoints)
│   ├── supabase.js               # Supabase client setup
│   ├── urlParser.js              # Detect platform from URL
│   ├── downloader.js             # yt-dlp wrapper
│   ├── geminiClient.js           # All Gemini API calls
│   └── prompts.js                # LLM prompt templates
├── vercel.json                   # Vercel config + routing
├── package.json
└── .env.example
```

---

## 4. Database Schema (Supabase)

Same as before. Go to your Supabase project → SQL Editor → run this:

```sql
CREATE TABLE episodes (
  id            BIGSERIAL PRIMARY KEY,
  url           TEXT UNIQUE NOT NULL,
  platform      TEXT CHECK (platform IN ('twitter', 'linkedin', 'manual')),
  title         TEXT,
  episode_date  DATE,
  host_only     BOOLEAN DEFAULT true,
  guest_name    TEXT,
  summary       TEXT,
  status        TEXT DEFAULT 'pending'
                CHECK (status IN ('pending','processing','done','failed','needs_manual')),
  error_msg     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tips (
  id           BIGSERIAL PRIMARY KEY,
  episode_id   BIGINT REFERENCES episodes(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  category     TEXT CHECK (category IN (
                 'job_hunting','networking','upskilling',
                 'negotiation','management','tech_trends','mindset','other'
               )),
  order_index  INTEGER
);

CREATE TABLE tags (
  id    BIGSERIAL PRIMARY KEY,
  name  TEXT UNIQUE NOT NULL
);

CREATE TABLE episode_tags (
  episode_id BIGINT REFERENCES episodes(id) ON DELETE CASCADE,
  tag_id     BIGINT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (episode_id, tag_id)
);

CREATE INDEX idx_episodes_platform  ON episodes(platform);
CREATE INDEX idx_episodes_host_only ON episodes(host_only);
CREATE INDEX idx_episodes_date      ON episodes(episode_date DESC);
```

---

## 5. Package Setup

```bash
mkdir podcast-tips-backend && cd podcast-tips-backend
npm init -y
npm install @google/generative-ai @supabase/supabase-js express cors dotenv
npm install -D nodemon
```

```json
// package.json (add these)
{
  "scripts": {
    "dev": "nodemon api/process.js",
    "start": "node server.js"
  }
}
```

---

## 6. Supabase Client (`lib/supabase.js`)

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default supabase
```

---

## 7. URL Parser (`lib/urlParser.js`)

```js
export function detectPlatform(url) {
  const lower = url.toLowerCase()

  if (lower.includes('twitter.com/i/spaces') || lower.includes('x.com/i/spaces')) {
    return 'twitter'
  }
  if (lower.includes('linkedin.com')) {
    return 'linkedin'
  }
  return 'manual'
}
```

---

## 8. Audio Downloader (`lib/downloader.js`)

Node.js uses `child_process` to run yt-dlp (a command-line tool), the same way Python uses `subprocess`.

```js
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import os from 'os'
import fs from 'fs'

const execAsync = promisify(exec)

export async function downloadAudio(url) {
  // Create a temp directory for the download
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'podcast-'))
  const outputTemplate = path.join(tmpDir, 'audio.%(ext)s')

  try {
    // Run yt-dlp as a shell command — same tool, just called from JS
    await execAsync([
      'yt-dlp',
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', '32K',    // Low quality = smaller file = faster upload
      '--max-filesize', '24M',     // Gemini inline limit is ~20MB
      '-o', `"${outputTemplate}"`,
      `"${url}"`
    ].join(' '), {
      timeout: 120_000   // 2 minute timeout for download
    })

    const mp3Path = path.join(tmpDir, 'audio.mp3')

    if (!fs.existsSync(mp3Path)) {
      throw new Error('Audio file not found after download')
    }

    return { filePath: mp3Path, tmpDir }

  } catch (err) {
    // Clean up on failure
    fs.rmSync(tmpDir, { recursive: true, force: true })

    if (err.message.includes('linkedin')) {
      throw new Error('LINKEDIN_AUTH_REQUIRED')
    }
    throw new Error(`Download failed: ${err.message}`)
  }
}

export function cleanupTempDir(tmpDir) {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}
```

---

## 9. Gemini Client (`lib/geminiClient.js`)

This is the heart of the app. Gemini accepts audio files natively — no Whisper needed.

```js
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import { AUDIO_PROMPT, TEXT_PROMPT } from './prompts.js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

// ─── Process an audio file ───────────────────────────────────────────────────

export async function processAudioFile(audioPath) {
  console.log('Uploading audio to Gemini...')

  // Read the file as base64 — Gemini accepts it inline for files under 20MB
  const audioData = fs.readFileSync(audioPath)
  const base64Audio = audioData.toString('base64')

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'audio/mp3',
        data: base64Audio
      }
    },
    AUDIO_PROMPT
  ])

  const responseText = result.response.text()
  return parseJSON(responseText)
}

// ─── Process plain text (manual paste or fallback) ───────────────────────────

export async function processTextTranscript(transcript) {
  // Split if too long — safe limit for Gemini Flash
  if (transcript.length > 50_000) {
    return processChunkedTranscript(transcript)
  }

  const result = await model.generateContent(
    TEXT_PROMPT.replace('{transcript}', transcript)
  )

  return parseJSON(result.response.text())
}

// ─── Handle very long transcripts ────────────────────────────────────────────

async function processChunkedTranscript(transcript) {
  const CHUNK_SIZE = 40_000
  const OVERLAP    = 2_000
  const chunks = []

  for (let i = 0; i < transcript.length; i += CHUNK_SIZE - OVERLAP) {
    chunks.push(transcript.slice(i, i + CHUNK_SIZE))
  }

  const allTips = []
  let metadata = null

  for (let i = 0; i < chunks.length; i++) {
    // Gemini free tier: 15 req/min — wait 4s between chunks
    if (i > 0) await sleep(4000)

    const result = await processTextTranscript(chunks[i])
    allTips.push(...(result.tips || []))
    if (!metadata) metadata = result.metadata
  }

  // Remove exact duplicate tips
  const seen = new Set()
  const uniqueTips = allTips.filter(tip => {
    if (seen.has(tip.content)) return false
    seen.add(tip.content)
    return true
  })

  return { tips: uniqueTips, metadata }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseJSON(text) {
  // Strip markdown code fences if Gemini wraps in ```json ... ```
  let clean = text.trim()
  if (clean.startsWith('```')) {
    clean = clean.split('```')[1]
    if (clean.startsWith('json')) clean = clean.slice(4)
  }
  clean = clean.trim().replace(/```$/, '').trim()

  try {
    return JSON.parse(clean)
  } catch {
    // Last resort: find JSON object inside the text
    const match = clean.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error(`Could not parse Gemini response as JSON: ${clean.slice(0, 200)}`)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

---

## 10. Prompts (`lib/prompts.js`)

```js
export const AUDIO_PROMPT = `
Listen to this podcast/audio broadcast carefully.

Extract ALL actionable tips shared by the host and any guests.

For each tip:
- Write it as a clear, standalone, actionable sentence (1-2 sentences)
- A listener should be able to act on it without hearing the original
- Avoid vague tips — be specific

Also extract episode metadata.

Return ONLY valid JSON with no explanation, no markdown fences:
{
  "metadata": {
    "title": "Short descriptive title (max 12 words)",
    "guest_name": "Full name of guest, or null if solo",
    "host_only": true or false,
    "summary": "2-3 sentence summary of the episode",
    "tags": ["tag1", "tag2", "tag3"]
  },
  "tips": [
    {
      "content": "The actionable tip text",
      "category": "job_hunting | networking | upskilling | negotiation | management | tech_trends | mindset | other"
    }
  ]
}

Tags should be 3-6 short lowercase words (e.g. "resume", "linkedin", "salary").
`

export const TEXT_PROMPT = `
Read this podcast transcript carefully.

Extract ALL actionable tips shared. Each tip must be:
- Concrete and actionable (not vague advice)
- Standalone (makes sense without surrounding context)
- 1-2 sentences maximum

Also extract episode metadata.

Return ONLY valid JSON with no explanation, no markdown fences:
{
  "metadata": {
    "title": "Short descriptive title (max 12 words)",
    "guest_name": "Full name of guest, or null if solo",
    "host_only": true or false,
    "summary": "2-3 sentence summary",
    "tags": ["tag1", "tag2", "tag3"]
  },
  "tips": [
    {
      "content": "Actionable tip text",
      "category": "job_hunting | networking | upskilling | negotiation | management | tech_trends | mindset | other"
    }
  ]
}

TRANSCRIPT:
{transcript}
`
```

---

## 11. Main Endpoints

### POST `/api/process.js` — Receive URL, save to DB, start worker

```js
import supabase from '../lib/supabase.js'
import { detectPlatform } from '../lib/urlParser.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { url, episode_date, guest_name, host_only, manual_transcript } = req.body

  if (!url && !manual_transcript) {
    return res.status(400).json({ error: 'url or manual_transcript is required' })
  }

  // Check for duplicate URL
  if (url) {
    const { data: existing } = await supabase
      .from('episodes')
      .select('id, status')
      .eq('url', url)
      .single()

    if (existing) {
      return res.status(200).json({
        episode_id: existing.id,
        status: existing.status,
        message: 'Episode already exists'
      })
    }
  }

  const platform = url ? detectPlatform(url) : 'manual'

  // Insert episode as pending
  const { data: episode, error } = await supabase
    .from('episodes')
    .insert({
      url: url || `manual-${Date.now()}`,
      platform,
      episode_date: episode_date || new Date().toISOString().split('T')[0],
      guest_name: guest_name || null,
      host_only: host_only ?? true,
      status: 'pending'
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  // Trigger the worker — call our own /api/worker endpoint asynchronously
  // We use fetch with no await so it runs in the background
  const workerUrl = `${process.env.VERCEL_URL}/api/worker`
  fetch(workerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      episode_id: episode.id,
      url,
      manual_transcript: manual_transcript || ''
    })
  }).catch(err => console.error('Worker trigger failed:', err))
  // Note: fire-and-forget — we don't await this

  return res.status(201).json({
    episode_id: episode.id,
    status: 'pending',
    message: 'Processing started. Poll /api/episodes/' + episode.id + ' for updates.'
  })
}
```

---

### POST `/api/worker.js` — Heavy processing (runs up to 5 min)

```js
// vercel.json sets maxDuration: 300 for this function

import supabase from '../lib/supabase.js'
import { detectPlatform } from '../lib/urlParser.js'
import { downloadAudio, cleanupTempDir } from '../lib/downloader.js'
import { processAudioFile, processTextTranscript } from '../lib/geminiClient.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { episode_id, url, manual_transcript } = req.body
  let tmpDir = null

  const updateStatus = (status, extra = {}) =>
    supabase.from('episodes').update({ status, ...extra }).eq('id', episode_id)

  try {
    await updateStatus('processing')

    let result = null

    if (manual_transcript) {
      // User pasted transcript — skip download entirely
      result = await processTextTranscript(manual_transcript)

    } else {
      const platform = detectPlatform(url)

      try {
        const { filePath, tmpDir: dir } = await downloadAudio(url)
        tmpDir = dir
        result = await processAudioFile(filePath)

      } catch (downloadErr) {
        if (downloadErr.message === 'LINKEDIN_AUTH_REQUIRED') {
          await updateStatus('needs_manual', {
            error_msg: 'LinkedIn requires manual transcript paste'
          })
          return res.json({ status: 'needs_manual' })
        }
        throw downloadErr
      }
    }

    // ── Save metadata ───────────────────────────────────────────────────────
    const meta = result.metadata || {}
    await supabase.from('episodes').update({
      title:      meta.title      || 'Untitled Episode',
      guest_name: meta.guest_name || null,
      host_only:  meta.host_only  ?? true,
      summary:    meta.summary    || '',
      status:     'done'
    }).eq('id', episode_id)

    // ── Save tips ───────────────────────────────────────────────────────────
    const tips = (result.tips || []).map((tip, i) => ({
      episode_id,
      content:     tip.content,
      category:    tip.category || 'other',
      order_index: i + 1
    }))

    if (tips.length > 0) {
      await supabase.from('tips').insert(tips)
    }

    // ── Save tags ───────────────────────────────────────────────────────────
    for (const tagName of (meta.tags || [])) {
      const name = tagName.toLowerCase().trim()

      // Upsert the tag (insert if not exists, return existing if it does)
      const { data: tag } = await supabase
        .from('tags')
        .upsert({ name }, { onConflict: 'name' })
        .select()
        .single()

      // Link tag to this episode
      await supabase
        .from('episode_tags')
        .upsert({ episode_id, tag_id: tag.id })
    }

    return res.json({ status: 'done', episode_id, tip_count: tips.length })

  } catch (err) {
    console.error('Worker error:', err)
    await updateStatus('failed', { error_msg: err.message?.slice(0, 500) })
    return res.status(500).json({ error: err.message })

  } finally {
    // Always clean up temp files
    cleanupTempDir(tmpDir)
  }
}
```

---

### GET `/api/episodes/index.js` — List with filters

```js
import supabase from '../../lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const {
    tag, platform, type, search,
    sort = 'newest',
    page = 1,
    limit = 20
  } = req.query

  // Base query — join tips count and tags
  let query = supabase
    .from('episodes')
    .select(`
      id, title, episode_date, platform,
      host_only, guest_name, status,
      tips(count),
      episode_tags(tags(name))
    `, { count: 'exact' })

  // Apply filters
  if (platform) query = query.eq('platform', platform)
  if (type === 'solo')  query = query.eq('host_only', true)
  if (type === 'guest') query = query.eq('host_only', false)
  if (search) query = query.ilike('title', `%${search}%`)

  // Sorting
  const ascending = sort === 'oldest'
  query = query.order('episode_date', { ascending })

  // Pagination
  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  const { data, error, count } = await query

  if (error) return res.status(500).json({ error: error.message })

  // Shape the response — flatten the nested joins
  const items = (data || []).map(ep => ({
    id:           ep.id,
    title:        ep.title,
    episode_date: ep.episode_date,
    platform:     ep.platform,
    host_only:    ep.host_only,
    guest_name:   ep.guest_name,
    status:       ep.status,
    tip_count:    ep.tips?.[0]?.count ?? 0,
    tags:         ep.episode_tags?.map(et => et.tags?.name).filter(Boolean) ?? []
  }))

  // Filter by tag (done in memory since Supabase join filtering is complex)
  const filtered = tag
    ? items.filter(ep => ep.tags.includes(tag))
    : items

  return res.json({ total: count, page: Number(page), items: filtered })
}
```

---

### GET/DELETE `/api/episodes/[id].js`

```js
import supabase from '../../lib/supabase.js'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('episodes')
      .select(`
        *,
        tips(id, content, category, order_index),
        episode_tags(tags(name))
      `)
      .eq('id', id)
      .single()

    if (error) return res.status(404).json({ error: 'Episode not found' })

    return res.json({
      ...data,
      tips: (data.tips || []).sort((a, b) => a.order_index - b.order_index),
      tags: (data.episode_tags || []).map(et => et.tags?.name).filter(Boolean)
    })
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('episodes').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ deleted: true })
  }

  return res.status(405).end()
}
```

---

## 12. Vercel Config (`vercel.json`)

```json
{
  "functions": {
    "api/worker.js": {
      "maxDuration": 300
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

---

## 13. Environment Variables (`.env`)

```bash
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your_anon_key_here

# Gemini
GEMINI_API_KEY=your_gemini_api_key

# Set automatically by Vercel in production — no action needed
VERCEL_URL=your-project.vercel.app
```

Add these in the Vercel dashboard under **Settings → Environment Variables** for production.

---

## 14. Installing yt-dlp on Vercel

yt-dlp is a Python CLI tool. Vercel's Node.js runtime doesn't include it by default. Two options:

**Option A — Vercel's `installCommand` (simplest):**
```json
// vercel.json
{
  "installCommand": "npm install && pip install yt-dlp"
}
```
Vercel builds include Python, so pip works.

**Option B — Use the yt-dlp npm wrapper:**
```bash
npm install yt-dlp-wrap
```
```js
// lib/downloader.js (alternative using the npm wrapper)
import YTDlpWrap from 'yt-dlp-wrap'

const ytDlp = new YTDlpWrap()

export async function downloadAudio(url) {
  const outputPath = `/tmp/audio-${Date.now()}.mp3`
  
  await ytDlp.execPromise([
    url,
    '--extract-audio',
    '--audio-format', 'mp3',
    '--audio-quality', '32K',
    '-o', outputPath
  ])

  return { filePath: outputPath, tmpDir: null }
}
```
The npm wrapper bundles yt-dlp so you don't need pip at all. Recommended for beginners.

---

## 15. Development Setup (Step by Step)

```bash
# 1. Create project
mkdir podcast-tips-backend && cd podcast-tips-backend
npm init -y

# 2. Install dependencies
npm install @google/generative-ai @supabase/supabase-js express cors dotenv yt-dlp-wrap
npm install -D nodemon

# 3. Add "type": "module" to package.json for ES module imports
#    (or rename files to .mjs, or use require() instead of import)

# 4. Copy .env.example to .env and fill in your keys
cp .env.example .env

# 5. Run Supabase SQL migrations in the Supabase dashboard

# 6. Test a single function locally
node -e "
  import('./lib/geminiClient.js').then(m =>
    m.processTextTranscript('Tip: Always follow up after interviews.')
      .then(console.log)
  )
"

# 7. Install Vercel CLI and run locally
npm install -g vercel
vercel dev
# → http://localhost:3000
```

---

## 16. Build Order (7-Day Plan)

| Day | Goal |
|-----|------|
| Day 1 | Set up Supabase (run SQL). Deploy a `GET /api/episodes` that returns an empty array. Confirm Vercel works. |
| Day 2 | Build `POST /api/process` — saves a manual-paste episode to Supabase. No AI yet. Test with Postman or curl. |
| Day 3 | Wire up `lib/geminiClient.js` with the text prompt. Test manual transcript → tips in the DB. |
| Day 4 | Build `GET /api/episodes/:id` and `GET /api/episodes`. Connect to frontend. |
| Day 5 | Add audio download via yt-dlp-wrap. Test with a real Twitter Space URL. |
| Day 6 | Add LinkedIn graceful fallback. Add tag saving. Add filter params to the list endpoint. |
| Day 7 | End-to-end test everything. Deploy fully to Vercel. Share the URL. |

**The golden rule:** If something breaks on Day 5, you still have a fully working app from Day 4. Never break the working version to build the next feature — branch in git first.
