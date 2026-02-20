# Phase 2: Persistence - Research

**Researched:** 2026-02-20
**Domain:** SQLite persistence via better-sqlite3, Express route integration, React state hydration
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Storage:** SQLite database file stored in `/data` directory at project root, gitignored
- **Library:** `better-sqlite3` with raw SQL queries — no ORM
- **Data scope:** Save action items only — raw meeting text is NOT persisted
- **Meeting record:** Minimal record with AI-generated title and `created_at` timestamp
- **Meeting title:** AI-generated, returned by GPT-4o alongside the summary (implies Phase 1 schema needs a `title` field added)
- **Load behavior:** On startup/page refresh, show the most recently processed meeting and its action items
- **New meeting behavior:** Replace — new meeting's action items replace the current view
- **History:** Each processed meeting saved as separate DB record; no delete/clear in Phase 2
- **Phase 3 forward-compat:** Status column and appropriate indexes added now even though Phase 2 does not expose editing
- **Assignee:** Must be nullable (already is `string().nullable().optional()` in current codebase)

### Claude's Discretion

- Exact table structure and column names
- Whether to use two tables (meetings + action_items) or embedded JSON — choose based on Phase 3 queryability
- Index strategy for Phase 3 filtering patterns
- How the form/results layout looks on first load vs return visits
- Empty state UI design

### Deferred Ideas (OUT OF SCOPE)

- None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ITEM-04 | Action item data is persisted locally and survives page refresh | Two-table schema (meetings + action_items) + GET /api/meetings/latest route + React useEffect hydration on mount |
</phase_requirements>

## Summary

Phase 2 introduces SQLite persistence using `better-sqlite3`. The decision to use raw SQL (no ORM) with a synchronous API is a good fit for the existing Express 5 stack: no async/await overhead in route handlers, no schema migration framework to configure, and the entire setup is approximately 50 lines of code. The library is already in the project's conceptual stack; only installation is needed.

The core architectural choice (discretion area) is between one table (action_items with embedded meeting metadata) vs two tables (meetings + action_items with a foreign key). Two tables is the right call because Phase 3 requires filtering action items by status and browsing meeting history — both queries are considerably cleaner with normalized tables. The `status` column should be added to `action_items` now to avoid a Phase 3 migration.

The work splits into three areas: (1) a database initialization module `server/lib/db.ts` that creates tables and is imported by server startup; (2) a save path wired into the existing POST /api/meetings/process route, which also needs the OpenAI schema extended with a `title` field; (3) a new GET /api/meetings/latest route that returns the most recent meeting and its action items for the React frontend to hydrate on load. The React frontend needs a `useEffect` on mount that fetches `/api/meetings/latest` and pre-populates the result state.

**Primary recommendation:** Two-table normalized schema (meetings + action_items), `better-sqlite3` singleton module, GET /api/meetings/latest endpoint, React useEffect hydration.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| better-sqlite3 | ^11.x (latest) | Synchronous SQLite driver for Node.js | Synchronous API — no async complexity in Express handlers; fastest Node.js SQLite library; zero external DB server |
| @types/better-sqlite3 | ^7.x | TypeScript type definitions | Community-maintained; required since better-sqlite3 has no official TypeScript support |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | No ORM | Raw SQL preferred per locked decision; schema is simple (2 tables, ~8 columns total) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| better-sqlite3 | sqlite3 (async) | sqlite3 requires promise wrapping in every route handler; worse DX for Express sync patterns |
| better-sqlite3 | Prisma + SQLite | Prisma adds migration tooling and type-safe queries but is massive overhead for 2 tables |
| Two tables | Single table + JSON column | Single table is simpler to write, but Phase 3 status filtering requires a real column, not JSON parsing |

**Installation:**
```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

Note: `better-sqlite3` is a native addon — it compiles a `.node` binary during `npm install`. This is normal and expected. No additional flags needed for standard Linux environments.

## Architecture Patterns

### Recommended Project Structure

```
server/
├── lib/
│   ├── db.ts          # Database singleton + schema init (NEW)
│   └── openai.ts      # Existing — needs title field added to schema
├── routes/
│   └── meetings.ts    # Existing — save on process, add GET /latest
└── index.ts           # Existing — import db.ts to trigger table creation on boot
data/
└── meetings.db        # SQLite file (gitignored, created at runtime)
```

### Pattern 1: Database Singleton Module

**What:** A single `db.ts` module exports a `better-sqlite3` Database instance and runs `CREATE TABLE IF NOT EXISTS` on import. Importing this module anywhere guarantees the tables exist.

**When to use:** Always. Singleton prevents multiple connections to the same SQLite file.

**Example:**
```typescript
// Source: Context7 /wiselibs/better-sqlite3 + official README
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../../data')
const DB_PATH = path.join(DATA_DIR, 'meetings.db')

// Ensure /data directory exists before opening DB
fs.mkdirSync(DATA_DIR, { recursive: true })

export const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS meetings (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS action_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id  INTEGER NOT NULL,
    description TEXT NOT NULL,
    assignee    TEXT,
    priority    TEXT NOT NULL CHECK(priority IN ('low','medium','high')),
    status      TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo','in-progress','done')),
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (meeting_id) REFERENCES meetings(id)
  );

  CREATE INDEX IF NOT EXISTS idx_action_items_meeting_id
    ON action_items(meeting_id);
  CREATE INDEX IF NOT EXISTS idx_action_items_status
    ON action_items(status);
`)
```

### Pattern 2: Prepared Statement Reuse

**What:** Prepare statements once at module level, execute many times. `db.prepare()` compiles SQL once; reuse avoids repeated compilation.

**When to use:** Any statement executed more than once (inserts in a loop, repeated selects).

**Example:**
```typescript
// Source: Context7 /wiselibs/better-sqlite3
const insertMeeting = db.prepare(
  'INSERT INTO meetings (title, created_at) VALUES (@title, @created_at)'
)
const insertItem = db.prepare(
  `INSERT INTO action_items (meeting_id, description, assignee, priority)
   VALUES (@meeting_id, @description, @assignee, @priority)`
)

// run() returns { changes: number, lastInsertRowid: bigint }
const { lastInsertRowid } = insertMeeting.run({ title, created_at: new Date().toISOString() })
const meetingId = Number(lastInsertRowid)  // Always convert bigint to number
```

### Pattern 3: Transactional Batch Insert

**What:** `db.transaction()` wraps a function in a BEGIN/COMMIT block. If the function throws, the transaction rolls back automatically.

**When to use:** Inserting a meeting record and its action items — both must succeed or neither should be saved.

**Example:**
```typescript
// Source: Context7 /wiselibs/better-sqlite3 transaction docs
const saveMeetingTx = db.transaction((title: string, items: ActionItem[]) => {
  const { lastInsertRowid } = insertMeeting.run({
    title,
    created_at: new Date().toISOString(),
  })
  const meetingId = Number(lastInsertRowid)
  for (const item of items) {
    insertItem.run({
      meeting_id: meetingId,
      description: item.description,
      assignee: item.assignee ?? null,
      priority: item.priority,
    })
  }
  return meetingId
})
```

### Pattern 4: GET /api/meetings/latest Response Shape

**What:** Returns the most recently inserted meeting with its action items.

**When to use:** Frontend calls this on component mount to hydrate state.

```typescript
// Source: Context7 /wiselibs/better-sqlite3 prepared statement pattern
const getLatestMeeting = db.prepare(
  'SELECT * FROM meetings ORDER BY id DESC LIMIT 1'
)
const getItemsByMeeting = db.prepare(
  'SELECT * FROM action_items WHERE meeting_id = ? ORDER BY id ASC'
)

meetingsRouter.get('/latest', (_req, res) => {
  const meeting = getLatestMeeting.get() as DbMeeting | undefined
  if (!meeting) {
    res.json(null)   // Empty DB — frontend shows empty/welcome state
    return
  }
  const items = getItemsByMeeting.all(meeting.id)
  res.json({ meeting, action_items: items })
})
```

### Pattern 5: OpenAI Schema Update (title field)

**What:** Phase 2 requires an AI-generated meeting title. The existing `MeetingResponseSchema` in `server/lib/openai.ts` must be extended with a `title` field.

**When to use:** Required — locked decision from CONTEXT.md.

```typescript
// server/lib/openai.ts — extend existing MeetingResponseSchema
export const MeetingResponseSchema = z.object({
  title: z.string(),          // NEW: short AI-generated meeting title (5-10 words)
  summary: z.string(),
  action_items: z.array(ActionItemSchema),
})
```

The system prompt must also be updated to instruct GPT-4o to produce a concise title (5-10 words) that summarizes the meeting topic.

The frontend type in `src/types/meeting.ts` must also add `title` to `MeetingResponse`.

### Pattern 6: React Hydration on Mount

**What:** On app start, fetch `/api/meetings/latest` to restore last session's data.

**When to use:** Single `useEffect` with empty dependency array in `MeetingForm.tsx` or `App.tsx`.

```typescript
// Standard React useEffect hydration pattern
useEffect(() => {
  fetch('/api/meetings/latest')
    .then(res => res.ok ? res.json() : null)
    .then((data: LatestMeetingResponse | null) => {
      if (data) {
        setResult({
          title: data.meeting.title,
          summary: '',   // summary not stored; show empty or omit
          action_items: data.action_items,
        })
      }
    })
    .catch(() => {})  // Silent fail — empty state is acceptable
}, [])
```

Note: Because the summary is not persisted (raw meeting text is not stored), the hydrated result will not have a summary. The `MeetingResponse` type may need `summary` to be optional, or a separate display type should be used that does not require it.

### Anti-Patterns to Avoid

- **Storing `lastInsertRowid` as-is:** better-sqlite3 returns it as `bigint`. Always convert: `Number(lastInsertRowid)`.
- **Opening DB inside routes:** Never call `new Database(...)` per-request. One module-level singleton only.
- **Async DB calls:** better-sqlite3 is synchronous. Never use `await` or wrap in `Promise`.
- **Running `db.exec()` inside routes:** Schema creation belongs in module-level initialization only.
- **Not handling null from `getLatestMeeting.get()`:** An empty database returns `undefined`. Check before accessing fields.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Transaction atomicity | Manual BEGIN/COMMIT SQL strings | `db.transaction()` wrapper | Handles rollback on exception automatically; no forgotten ROLLBACK calls |
| BigInt coercion | Custom helper functions | `Number(lastInsertRowid)` inline | One-liner; standard pattern per better-sqlite3 docs |
| Schema migration | Custom version tables or migration scripts | `CREATE TABLE IF NOT EXISTS` | Phase 2 is the first schema creation; idempotent IF NOT EXISTS is sufficient for MVP |

**Key insight:** better-sqlite3's synchronous API eliminates entire classes of async error handling that would otherwise complicate Express route handlers.

## Common Pitfalls

### Pitfall 1: BigInt from lastInsertRowid
**What goes wrong:** TypeScript error or runtime mismatch when using `lastInsertRowid` as a number.
**Why it happens:** better-sqlite3 returns `lastInsertRowid` as `bigint`, not `number`. `===` does not coerce between them; SQL parameter binding may also reject bigint.
**How to avoid:** Always wrap: `const meetingId = Number(result.lastInsertRowid)`
**Warning signs:** TypeScript error "Type 'bigint' is not assignable to type 'number'"

### Pitfall 2: Missing /data Directory
**What goes wrong:** better-sqlite3 throws `SQLITE_CANTOPEN: unable to open database file` on server startup.
**Why it happens:** `new Database('../../data/meetings.db')` requires `data/` to exist first; it does not create parent directories.
**How to avoid:** Call `fs.mkdirSync(DATA_DIR, { recursive: true })` before `new Database(DB_PATH)` in `db.ts`.
**Warning signs:** Server crashes immediately on startup with SQLITE_CANTOPEN

### Pitfall 3: ESM `__dirname` Not Available
**What goes wrong:** `ReferenceError: __dirname is not defined in ES module scope` at server startup.
**Why it happens:** The project has `"type": "module"` in package.json. CommonJS globals (`__dirname`, `__filename`) are not defined in ESM.
**How to avoid:** Use the ESM equivalent at the top of `db.ts`:
```typescript
const __dirname = path.dirname(fileURLToPath(import.meta.url))
```
**Warning signs:** ReferenceError on any server file that uses `__dirname`

### Pitfall 4: DB Row Shape vs Frontend Type Mismatch
**What goes wrong:** DB rows include columns (`id`, `meeting_id`, `status`, `created_at`) that don't exist on the current `ActionItem` frontend interface — or vice versa.
**Why it happens:** `db.prepare().all()` returns `unknown[]` — better-sqlite3 does not enforce column types via generics at this time.
**How to avoid:** Define a `DbActionItem` interface matching DB columns. Explicitly map to the frontend `ActionItem` shape, or extend `ActionItem` to include `id` and `status` (which Phase 3 will need anyway).
**Warning signs:** Frontend receiving unexpected extra fields, or TypeScript errors when passing DB rows to typed component props

### Pitfall 5: Summary Not Available After Hydration
**What goes wrong:** The hydrated result from `/api/meetings/latest` has no `summary` field (not stored), but the frontend type requires it.
**Why it happens:** `MeetingResponse.summary` is currently required. After hydration, only `title` and `action_items` are available.
**How to avoid:** Either (a) make `summary` optional in `MeetingResponse`, or (b) introduce a `DisplayResult` union/type that works for both fresh processing and hydrated state.
**Warning signs:** TypeScript error when trying to set result state from hydration data; empty summary section rendering confusingly

### Pitfall 6: Native Build Failure on CI/Docker
**What goes wrong:** `npm install` fails with `gyp ERR!` node-pre-gyp errors.
**Why it happens:** better-sqlite3 compiles a native C++ module. Environments without build tools fail.
**How to avoid:** On this Linux dev machine, build tools are present. If Docker is added later, ensure the base image includes `python3`, `make`, `g++`.
**Warning signs:** `npm install` fails during better-sqlite3 install step

## Code Examples

Verified patterns from official sources:

### Complete db.ts Module

```typescript
// server/lib/db.ts
// Source: Context7 /wiselibs/better-sqlite3
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../../data')
const DB_PATH = path.join(DATA_DIR, 'meetings.db')

fs.mkdirSync(DATA_DIR, { recursive: true })

export const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS meetings (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS action_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id  INTEGER NOT NULL,
    description TEXT NOT NULL,
    assignee    TEXT,
    priority    TEXT NOT NULL CHECK(priority IN ('low','medium','high')),
    status      TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo','in-progress','done')),
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (meeting_id) REFERENCES meetings(id)
  );

  CREATE INDEX IF NOT EXISTS idx_action_items_meeting_id
    ON action_items(meeting_id);
  CREATE INDEX IF NOT EXISTS idx_action_items_status
    ON action_items(status);
`)
```

### Transactional Save Function

```typescript
// Part of server/routes/meetings.ts or server/lib/db.ts
// Source: Context7 /wiselibs/better-sqlite3 transaction pattern
import { db } from './db.js'

const insertMeeting = db.prepare(
  `INSERT INTO meetings (title, created_at) VALUES (@title, @created_at)`
)
const insertItem = db.prepare(
  `INSERT INTO action_items (meeting_id, description, assignee, priority)
   VALUES (@meeting_id, @description, @assignee, @priority)`
)

export const saveMeeting = db.transaction(
  (title: string, items: Array<{ description: string; assignee?: string | null; priority: string }>) => {
    const { lastInsertRowid } = insertMeeting.run({
      title,
      created_at: new Date().toISOString(),
    })
    const meetingId = Number(lastInsertRowid)
    for (const item of items) {
      insertItem.run({
        meeting_id: meetingId,
        description: item.description,
        assignee: item.assignee ?? null,
        priority: item.priority,
      })
    }
    return meetingId
  }
)
```

### GET /latest Route Handler

```typescript
// Source: Context7 /wiselibs/better-sqlite3 select patterns
const getLatestMeeting = db.prepare(
  `SELECT * FROM meetings ORDER BY id DESC LIMIT 1`
)
const getItemsByMeeting = db.prepare(
  `SELECT * FROM action_items WHERE meeting_id = ? ORDER BY id ASC`
)

meetingsRouter.get('/latest', (_req, res) => {
  const meeting = getLatestMeeting.get() as
    | { id: number; title: string; created_at: string }
    | undefined
  if (!meeting) {
    res.json(null)
    return
  }
  const items = getItemsByMeeting.all(meeting.id)
  res.json({ meeting, action_items: items })
})
```

### Updated OpenAI Schema (server/lib/openai.ts diff)

```typescript
// Add title to MeetingResponseSchema
export const MeetingResponseSchema = z.object({
  title: z.string(),       // NEW — short meeting title (5-10 words)
  summary: z.string(),
  action_items: z.array(ActionItemSchema),
})

// Update system prompt to include title instruction:
// "Also generate a short meeting title (5-10 words) capturing the main topic."
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `require('better-sqlite3')` | `import Database from 'better-sqlite3'` | ESM adoption | This project is pure ESM (`"type": "module"`) — must use ESM import |
| `__dirname` global | `path.dirname(fileURLToPath(import.meta.url))` | ESM standard | Required; no polyfill needed, just this one-liner |
| Untyped DB rows | `@types/better-sqlite3` + explicit casts | Community-maintained | Official TS types not bundled; `@types/` is the current standard |

**Deprecated/outdated:**
- `better_sqlite3.node` prebuilt binary downloads: better-sqlite3 v9+ builds from source by default on modern Node; no separate prebuilds step needed.

## Open Questions

1. **Should `summary` be persisted?**
   - What we know: CONTEXT.md says raw meeting text is not persisted. Summary was not explicitly addressed.
   - What is unclear: Summary is processed output (2-4 sentences), not raw input. Phase 3 may want to display it in a meeting history view.
   - Recommendation: Adding a `summary TEXT` column to `meetings` costs nothing and avoids a Phase 3 migration. The planner should decide whether to include it. If added, the hydration response can include it and the frontend can display it on reload.

2. **Frontend result type unification**
   - What we know: Current `MeetingResponse` (`{ summary, action_items }`) does not have a `title` field and `summary` is required. Both will need updating.
   - What is unclear: Whether to use a single `DisplayResult` type for both fresh-process and hydrated state, or a union type.
   - Recommendation: Introduce a `DisplayResult` type (`{ title: string; summary?: string; action_items: ActionItem[] }`) in `src/types/meeting.ts` that both response paths map into. Keeps display components stable for Phase 3.

3. **DB path resolution from server/lib/db.ts**
   - What we know: `import.meta.url` in `server/lib/db.ts` gives the `server/lib/` directory. `../../data` resolves to `{project_root}/data/` — correct.
   - What is unclear: Only whether tsx --watch changes module URL resolution in edge cases.
   - Recommendation: Low risk. Verify with a `console.log(DB_PATH)` sanity check during implementation.

## Sources

### Primary (HIGH confidence)
- Context7 `/wiselibs/better-sqlite3` — prepared statements, Database constructor, ESM import syntax, transaction API, WAL pragma, `lastInsertRowid` bigint behavior, @types/ confirmation
  - Source: `https://github.com/wiselibs/better-sqlite3/blob/master/README.md`
  - Source: `https://github.com/wiselibs/better-sqlite3/blob/master/docs/api.md`
- Codebase inspection — `package.json`, `server/lib/openai.ts`, `server/routes/meetings.ts`, `src/types/meeting.ts`, `server/index.ts`

### Secondary (MEDIUM confidence)
- TypeScript types via `@types/better-sqlite3` — confirmed via Context7 contribution docs that official TS types are not bundled; `@types/` package is the community standard

### Tertiary (LOW confidence)
- None — all critical claims verified via Context7 or direct codebase reading

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — better-sqlite3 confirmed via Context7; install command verified against npm package
- Architecture (two-table schema): HIGH — Phase 3 requirements clearly require normalized status filtering; two tables is the standard relational approach
- Pitfalls: HIGH — BigInt, missing directory, and ESM __dirname are all documented and confirmed via Context7 official README
- React hydration pattern: MEDIUM — standard React pattern; specific shape-mismatch concern is a project-specific inference from comparing existing types

**Research date:** 2026-02-20
**Valid until:** 2026-03-22 (stable library; 30-day window)
