# Phase 1: Backend + AI Core - Research

**Researched:** 2026-02-20
**Domain:** Express.js backend proxy + OpenAI structured outputs (GPT-4o)
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AI-01 | User can paste or type meeting text into a field | Frontend textarea + form submission; React state management patterns covered in Code Examples |
| AI-02 | System generates structured meeting summary via GPT-4o after submission | OpenAI `chat.completions.parse()` with `zodResponseFormat`; Zod schema defines summary shape; backend route receives text and returns JSON |
| AI-03 | System extracts action items with description, assignee, and priority | Nested Zod schema with array of action item objects; enum for priority; optional fields for assignee; covered in Code Examples |

> **Security constraint (from STATE.md):** The OpenAI API key must NEVER be exposed in the browser. All API calls go through the Express backend. VITE_* env vars are publicly visible — the key must only exist server-side in `.env` read by Node.js.

</phase_requirements>

---

## Summary

Phase 1 requires standing up an Express.js backend alongside the existing Vite + React 19 frontend. The backend acts as a secure proxy: it receives raw meeting text from the React frontend, calls the OpenAI API with the key stored only server-side, and returns a structured JSON response containing a summary and action items. The frontend never touches the OpenAI API directly.

The recommended approach is a **same-repo backend** in a `server/` directory, with TypeScript powered by `tsx --watch` for development (replacing the older nodemon + ts-node pattern). Vite's built-in `server.proxy` configuration forwards `/api` requests to the Express server during development, eliminating CORS issues without any extra middleware. For production, Express serves both the API and the built React static files.

OpenAI's **Structured Outputs** feature with `zodResponseFormat` (openai-node SDK) is the correct tool for AI-02 and AI-03. It guarantees the model returns valid JSON matching the Zod schema — no brittle regex parsing, no `JSON.parse()` on free-form text. **Critical caveat:** `zodResponseFormat` requires Zod v3. If using Zod v4, the `openai/helpers/zod` helper breaks; use Zod's native `z.toJSONSchema()` to build the schema manually instead.

**Primary recommendation:** Use `tsx --watch` for the backend dev server, Vite proxy for dev CORS, `openai-node` v6.x with Zod v3 + `zodResponseFormat` for structured extraction, and a single `.env` file at the repo root read only by the Express server.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `express` | 5.2.1 | HTTP server / API proxy | Minimal, well-typed, de-facto Node.js standard; v5 is now stable |
| `openai` | 6.22.0 | OpenAI API client | Official SDK; `chat.completions.parse()` + `zodResponseFormat` for structured outputs |
| `zod` | 3.24.2 | Schema definition + validation | Required by `zodResponseFormat`; Zod v4 breaks the helper (see Pitfalls) |
| `dotenv` | 16.x | Load `.env` into `process.env` | Standard pattern for server-side env vars in Node.js |
| `tsx` | 4.21.0 | TypeScript runner + watch mode | Replaces nodemon + ts-node; no config file needed; works with ESM on Node 20+ |
| `cors` | 2.8.6 | CORS headers for Express | Only needed if NOT using Vite proxy (e.g., production with separate origins) |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `concurrently` | 9.x | Run Vite + Express in parallel | Single `npm run dev` launches both servers |
| `@types/express` | 5.0.6 | TypeScript types for Express | Dev dependency |
| `@types/cors` | 2.8.19 | TypeScript types for cors | Dev dependency, only if cors package is used |
| `@types/node` | 24.x | TypeScript types for Node.js | Dev dependency; already in project |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `express` v5 | Fastify, Hono | Express is fine for an internal proxy; Hono is better for edge/Cloudflare Workers but adds unfamiliar patterns |
| `tsx` | `ts-node` + `nodemon` | ts-node has ESM compatibility issues with Node 20+; tsx is simpler and faster |
| Zod `zodResponseFormat` | Manual `response_format` JSON schema | `zodResponseFormat` is more ergonomic with Zod v3; manual approach required for Zod v4 |
| Vite proxy | `cors` npm package on Express | Vite proxy is zero-config for dev and avoids CORS entirely; `cors` only needed if frontend and backend are on separate ports in production |

**Installation:**
```bash
# Backend deps (add to project root or server/ package.json)
npm install express openai zod dotenv cors
npm install -D tsx @types/express @types/cors @types/node concurrently
```

---

## Architecture Patterns

### Recommended Project Structure

```
/                          # existing Vite React project root
├── src/                   # existing React frontend
│   ├── App.tsx
│   └── main.tsx
├── server/                # NEW: Express backend
│   ├── index.ts           # Express app entry point
│   ├── routes/
│   │   └── meetings.ts    # POST /api/meetings/process route
│   └── lib/
│       └── openai.ts      # OpenAI client singleton + schema definitions
├── .env                   # NEVER commit - OPENAI_API_KEY here
├── .env.example           # Commit this - documents required vars
├── vite.config.ts         # Add proxy: { '/api': 'http://localhost:3001' }
├── package.json           # Add server dev/start scripts
└── tsconfig.json          # May need path adjustments for server/
```

### Pattern 1: Vite Dev Proxy (eliminates CORS in development)

**What:** Vite forwards all requests to `/api/*` from the frontend to the Express server running on a different port.
**When to use:** During development, always. Avoids CORS configuration on the Express server for local dev.

```typescript
// Source: https://context7.com/vitejs/vite/llms.txt
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

### Pattern 2: Express Backend with TypeScript (tsx)

**What:** Express server written in TypeScript, run with `tsx --watch` for instant restarts.
**When to use:** Always — avoids nodemon/ts-node ESM incompatibility issues on Node 20+.

```typescript
// Source: WebSearch verified - tsx is the 2025 standard for TS Node servers
// server/index.ts
import express from 'express'
import cors from 'cors'
import { meetingsRouter } from './routes/meetings.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json({ limit: '1mb' }))
// cors only needed if running frontend/backend on different origins in production
app.use(cors({ origin: 'http://localhost:5173' }))

app.use('/api/meetings', meetingsRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

```json
// package.json scripts additions
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "vite",
    "dev:server": "tsx --watch server/index.ts",
    "build": "tsc -b && vite build"
  }
}
```

### Pattern 3: OpenAI Structured Outputs with Zod v3

**What:** Define the exact JSON shape using Zod, pass it via `zodResponseFormat`, get type-safe parsed output.
**When to use:** Any time you need the model to return structured data — summaries, action items, etc.

```typescript
// Source: https://context7.com/openai/openai-node/llms.txt
// server/lib/openai.ts
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // server-side only
})

export const ActionItemSchema = z.object({
  description: z.string(),
  assignee: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
})

export const MeetingResponseSchema = z.object({
  summary: z.string(),
  action_items: z.array(ActionItemSchema),
})

export type MeetingResponse = z.infer<typeof MeetingResponseSchema>

export async function processMeetingText(text: string): Promise<MeetingResponse> {
  const completion = await openai.chat.completions.parse({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are a meeting assistant. Extract a concise summary and all action items from the meeting notes. For each action item, identify the person responsible (assignee) and priority level (low/medium/high) if mentioned.',
      },
      { role: 'user', content: text },
    ],
    response_format: zodResponseFormat(MeetingResponseSchema, 'meeting_response'),
  })

  const message = completion.choices[0]?.message
  if (!message?.parsed) {
    throw new Error('OpenAI returned no parsed response')
  }
  return message.parsed
}
```

### Pattern 4: React Frontend — Submit Meeting Text

**What:** Simple controlled textarea with form submission, fetch to `/api/meetings/process`.
**When to use:** Always for AI-01. No additional libraries needed.

```typescript
// src/components/MeetingForm.tsx
import { useState } from 'react'
import type { MeetingResponse } from '../types/meeting'

export function MeetingForm() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<MeetingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/meetings/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste meeting notes here..."
        rows={10}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Process Meeting'}
      </button>
      {error && <p role="alert">{error}</p>}
      {result && <MeetingResults data={result} />}
    </form>
  )
}
```

### Anti-Patterns to Avoid

- **VITE_OPENAI_API_KEY in .env:** Any `VITE_*` variable is bundled into the frontend JavaScript and visible to all users in the browser. Never put the OpenAI key there.
- **Calling OpenAI from the browser directly:** Even with a proxy approach, never import the openai package in `src/` files.
- **JSON.parse on free-form GPT output:** Without structured outputs, model responses vary in format and will break parsing. Always use `zodResponseFormat` or equivalent.
- **Using Zod v4 with `zodResponseFormat`:** The `openai/helpers/zod` helper uses `zod-to-json-schema` internally which does not support Zod v4. Stick to Zod v3.24.x or manually construct the schema with `z.toJSONSchema()` if on v4.
- **Hardcoding the OpenAI API key in source:** Always use `process.env.OPENAI_API_KEY`; add `.env` to `.gitignore`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Structured JSON from GPT | Regex parsing or manual JSON.parse | `zodResponseFormat` + `chat.completions.parse()` | Model output is non-deterministic; structured outputs enforce schema at the API level |
| TypeScript watch/restart | Custom file watcher + child_process | `tsx --watch` | Handles ESM, TypeScript, sourcemaps, restarts — one command |
| Dev CORS proxy | Manual CORS middleware configuration | Vite `server.proxy` | Zero config; Vite already proxies `/api` requests; cors package still needed for production |
| Request body validation | Manual type guards | Zod `schema.parse(req.body)` | Runtime validation catches malformed requests before they reach OpenAI |
| Environment variable loading | Manual `fs.readFileSync('.env')` | `dotenv` | Standard; handles quoting, escaping, multiple environments |

**Key insight:** The entire value of `zodResponseFormat` is that OpenAI's API enforces the schema server-side, meaning the model cannot return malformed JSON. Manual parsing introduces fragility that defeats the purpose.

---

## Common Pitfalls

### Pitfall 1: Zod v4 + zodResponseFormat incompatibility

**What goes wrong:** Calling `zodResponseFormat` with a Zod v4 schema throws errors like `Invalid schema for response_format` or silently produces wrong JSON schemas.
**Why it happens:** `openai/helpers/zod` uses `zod-to-json-schema` internally, which targets Zod v3. Zod v4 changed internal APIs.
**How to avoid:** Pin `zod` to `^3.24.2` in package.json. If upgrading to Zod v4 later, use the manual approach:
```typescript
response_format: {
  type: 'json_schema',
  json_schema: {
    name: 'meeting_response',
    strict: true,
    schema: z.toJSONSchema(MeetingResponseSchema, { target: 'draft-7' }),
  },
}
```
**Warning signs:** TypeScript errors in `zodResponseFormat` arguments; runtime API errors mentioning `additionalProperties`.

### Pitfall 2: OpenAI API key exposed via VITE_* env var

**What goes wrong:** Developer puts `VITE_OPENAI_API_KEY=sk-...` in `.env`, imports it in a React component. The key is visible to anyone who views the page source or network traffic.
**Why it happens:** Vite replaces all `import.meta.env.VITE_*` references at build time by embedding the value in the JS bundle.
**How to avoid:** Only use `OPENAI_API_KEY` (no `VITE_` prefix) in `.env`. Only `process.env.OPENAI_API_KEY` in `server/` files. The Vite server never has access to non-`VITE_*` vars.
**Warning signs:** `import.meta.env.VITE_OPENAI_API_KEY` appearing anywhere in `src/`.

### Pitfall 3: OpenAI structured outputs schema constraints violated

**What goes wrong:** Schema validation error from OpenAI API: `additionalProperties must be false`, or `$ref not supported`, or `default values not supported`.
**Why it happens:** OpenAI's structured outputs only support a subset of JSON Schema. Unsupported: `$ref`, recursive schemas, `anyOf` in strict mode, default values, `additionalProperties: true`.
**How to avoid:** Use only flat or nested objects with required fields. When using `zodResponseFormat`, Zod v3 handles the conversion correctly. Avoid `.default()` on Zod fields.
**Warning signs:** API error `400` with message about schema constraints.

### Pitfall 4: tsconfig not covering server/ directory

**What goes wrong:** TypeScript errors in `server/` are not caught by `npm run build` because `tsconfig.app.json` only includes `src/`.
**Why it happens:** Vite scaffolds `tsconfig.app.json` with `include: ["src"]`.
**How to avoid:** Either create `server/tsconfig.json` extending the root, or add `"include": ["src", "server"]` to root `tsconfig.json`. Run `tsc --noEmit` as a lint step for the server.
**Warning signs:** Server TypeScript errors only surface at runtime, not during build.

### Pitfall 5: Prompt quality — real meeting text varies wildly

**What goes wrong:** The model misses action items, assigns wrong priorities, or fails to identify assignees in informal meeting notes.
**Why it happens:** Meeting text is informal, ambiguous, and lacks structure. Prompts tuned on examples may not generalize.
**How to avoid:** Reserve iteration time after initial implementation. Test with at least 3 real meeting transcripts before declaring Phase 1 done. Iterate on the system prompt. This is documented as a known concern in STATE.md.
**Warning signs:** Action items missing obvious tasks; assignees empty when names are clearly in the text.

---

## Code Examples

Verified patterns from official sources:

### Complete Express Route: POST /api/meetings/process

```typescript
// Source: Express docs + OpenAI Node SDK docs
// server/routes/meetings.ts
import { Router } from 'express'
import { processMeetingText } from '../lib/openai.js'
import { z } from 'zod'

export const meetingsRouter = Router()

const RequestSchema = z.object({
  text: z.string().min(10, 'Meeting text too short').max(50000, 'Meeting text too long'),
})

meetingsRouter.post('/process', async (req, res) => {
  try {
    const { text } = RequestSchema.parse(req.body)
    const result = await processMeetingText(text)
    res.json(result)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: err.errors })
    }
    console.error('Meeting processing error:', err)
    res.status(500).json({ error: 'Failed to process meeting' })
  }
})
```

### Shared Types (frontend + backend)

```typescript
// src/types/meeting.ts  (shared with frontend)
export interface ActionItem {
  description: string
  assignee?: string
  priority: 'low' | 'medium' | 'high'
}

export interface MeetingResponse {
  summary: string
  action_items: ActionItem[]
}
```

### Environment Variables Setup

```bash
# .env (never commit)
OPENAI_API_KEY=sk-proj-...
PORT=3001

# .env.example (commit this)
OPENAI_API_KEY=your-openai-api-key-here
PORT=3001
```

```typescript
// server/index.ts - load dotenv before anything else
import 'dotenv/config'  // or: import dotenv from 'dotenv'; dotenv.config()
import express from 'express'
// ...
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `nodemon` + `ts-node` | `tsx --watch` | 2023-2024 | tsx handles ESM natively; single dependency; no config file |
| Manual `JSON.parse` on GPT output | `chat.completions.parse()` + `zodResponseFormat` | Aug 2024 (gpt-4o-2024-08-06) | Schema enforced by API; no parsing errors |
| `body-parser` npm package | `express.json()` built-in | Express 4.16+ | Built-in middleware; no separate package needed |
| Zod-only for Structured Outputs | Zod v3 + `zodResponseFormat` OR Zod v4 + `z.toJSONSchema()` | 2025 | Zod v4 requires manual schema construction; v3 still works with helper |

**Deprecated/outdated:**
- `ts-node`: Struggles with ESM on Node 20+; `tsx` is the replacement
- `body-parser` (standalone): Superseded by `express.json()` built-in since Express 4.16
- GPT-4o model without date suffix: Use `gpt-4o` (routes to latest capable version) or pin to `gpt-4o-2024-08-06` for stable structured outputs support

---

## Open Questions

1. **TypeScript project configuration for monorepo-like structure**
   - What we know: The project uses `tsconfig.app.json` for frontend only; `server/` is not currently in scope
   - What's unclear: Whether to add `server/tsconfig.json` referencing root, or extend `tsconfig.json` with project references
   - Recommendation: Create `server/tsconfig.json` with `"extends": "../tsconfig.json"` and add it to root `tsconfig.json` `references`; this keeps builds separate and fast

2. **Production serving strategy**
   - What we know: This is an MVP; no deployment target specified
   - What's unclear: Whether the Express server should serve the built React static files in production, or if they'll be deployed separately
   - Recommendation: For MVP simplicity, have Express serve `dist/` static files in production (`express.static('dist')`); can be split later

3. **OpenAI model to pin**
   - What we know: Decision from STATE.md is GPT-4o; structured outputs requires `gpt-4o-2024-08-06` or newer
   - What's unclear: Whether to use `gpt-4o` (latest) or pin to a dated snapshot
   - Recommendation: Use `gpt-4o` (latest routing) for development; document that the model must support structured outputs (i.e., not `gpt-3.5-turbo`)

---

## Sources

### Primary (HIGH confidence)

- `/openai/openai-node` (Context7) — `chat.completions.parse()`, `zodResponseFormat`, streaming patterns, SDK API
- `/vitejs/vite` (Context7) — `server.proxy` configuration, Vite 7 dev server options
- `/expressjs/express` (Context7) — middleware setup, route handlers, `express.json()`
- `/colinhacks/zod` (Context7) — object schemas, enums, optional fields, `z.infer`
- https://github.com/openai/openai-node/issues/1540 — Zod v4 support status for `zodResponseFormat` (resolved: use manual `z.toJSONSchema()` with v4)

### Secondary (MEDIUM confidence)

- WebSearch: "Express TypeScript 2025 tsx nodemon" — `tsx --watch` confirmed as current standard across multiple 2025 guides
- WebSearch: "OpenAI structured outputs JSON schema limitations" — `additionalProperties`, `$ref`, `default` constraints confirmed in multiple developer reports
- WebSearch: "Express TypeScript Vite React monorepo concurrent dev 2025" — `concurrently` + Vite proxy pattern confirmed as standard approach

### Tertiary (LOW confidence)

- npm show versions: `openai@6.22.0`, `express@5.2.1`, `zod@3.24.2`, `tsx@4.21.0`, `cors@2.8.6` — captured 2026-02-20; versions correct at research time but may change

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified via npm registry; libraries verified via Context7
- Architecture: HIGH — Vite proxy pattern verified via Context7; Express + tsx pattern verified via multiple 2025 sources
- OpenAI structured outputs: HIGH — verified via Context7 SDK docs + official GitHub issues
- Pitfalls: HIGH — Zod v4 issue verified via GitHub issue (resolved); API key exposure is well-documented; schema constraints verified via community reports
- Prompt quality concern: MEDIUM — inherently qualitative; flagged in STATE.md as known blocker

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (30 days — stack is stable; OpenAI SDK updates quickly but patterns are stable)
