# Stack Research

**Domain:** AI Meeting Notes & Action Tracker
**Researched:** 2026-02-20
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React 19 | ^19.2.0 | UI framework | Already in project; new Actions API reduces async state boilerplate |
| TypeScript | ~5.9.3 | Type safety | Already in project; critical for AI response type safety |
| Vite 7 | ^7.2.4 | Dev server + bundler | Already in project; use server middleware for API proxy |
| Express | ^5.x | Backend API server | Needed to safely call OpenAI (API key cannot be in browser bundle); minimal, well-known |
| openai | ^4.96.x | OpenAI SDK | Official SDK; supports GPT-4o structured outputs (JSON mode), streaming |
| better-sqlite3 | ^11.x | Local persistence | Synchronous SQLite for Node.js; zero config, fast, no server process |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand | ^5.x | Client state management | When action items need to be shared across multiple components |
| zod | ^3.x | AI output validation | Parse and validate JSON from OpenAI — prevents crashes from malformed responses |
| concurrently | ^9.x | Dev: run Vite + Express together | `npm run dev` starts both servers in one terminal |
| cors | ^2.x | Express CORS middleware | Allow Vite dev server (port 5173) to call Express backend (port 3001) |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| dotenv | Load .env for Express backend | API keys live in .env, never in Vite's VITE_* env vars |
| tsx | Run TypeScript Express server | No compile step in dev; use `tsx watch src/server/index.ts` |
| @types/better-sqlite3 | TypeScript types for SQLite | Install as devDependency |
| @types/express | TypeScript types for Express | Install as devDependency |

## Installation

```bash
# Backend & AI
npm install express openai better-sqlite3 zod cors dotenv

# State management
npm install zustand

# Dev dependencies
npm install -D tsx concurrently @types/express @types/better-sqlite3
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Express | Hono | If targeting edge/Cloudflare Workers deployment |
| Express | Fastify | If you need higher throughput (overkill for internal MVP) |
| better-sqlite3 | lowdb (JSON file) | If you want zero native bindings; simpler but no SQL queries |
| better-sqlite3 | Drizzle + SQLite | If you want typed ORM; adds complexity, good for v2+ |
| zustand | React Context + useReducer | Perfectly fine for MVP; switch to zustand if 3+ components share state |
| Vite proxy | Separate origin for API | Simpler for dev; in production both can be served from same Express |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| VITE_OPENAI_API_KEY | Vite embeds VITE_* vars in browser bundle — API key exposed to anyone who views source | Backend proxy: call `/api/process` from frontend, backend calls OpenAI |
| localStorage for meeting data | 5MB limit breaks with long transcriptions; synchronous blocks UI | better-sqlite3 via backend API |
| Axios | Unnecessary when native fetch is sufficient for this use case | fetch (built-in) |
| Redux Toolkit | Massive overhead for this app's state complexity | zustand or React Context |
| OpenAI text-davinci-003 | Deprecated | gpt-4o or gpt-4o-mini |

## Stack Patterns by Variant

**For MVP (this project):**
- Single Express server serves both API and static build
- Vite proxies `/api/*` → `localhost:3001` in development
- SQLite file lives at `./data/meetings.db`
- No auth, no multi-user concerns

**If adding multi-user later:**
- Replace better-sqlite3 with PostgreSQL + Drizzle ORM
- Add authentication (Lucia or NextAuth)
- Deploy to Render/Fly.io

**If going full serverless:**
- Use Hono instead of Express
- Replace better-sqlite3 with Turso (SQLite edge)
- Deploy to Cloudflare Workers

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| better-sqlite3@11.x | Node.js 18+ | Requires native bindings; runs `node-gyp` on install |
| openai@4.x | Node.js 18+ | Fully compatible with TypeScript strict mode |
| React 19 | Zustand 5.x | Zustand 5 uses `useSyncExternalStore` — full React 19 compat |

## Sources

- openai npm package docs — structured outputs / JSON mode API
- Vite official docs — server.proxy configuration for backend dev proxy
- better-sqlite3 GitHub — Node.js 18+ compatibility confirmed

---
*Stack research for: AI Meeting Notes & Action Tracker*
*Researched: 2026-02-20*
