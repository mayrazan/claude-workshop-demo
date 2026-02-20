# Architecture Research

**Domain:** AI Meeting Notes & Action Tracker
**Researched:** 2026-02-20
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                    │
├─────────────┬───────────────────┬───────────────────────────┤
│  MeetingInput│   Dashboard/List  │   ActionItemEditor        │
│  (textarea  │   (filters, table)│   (inline edit form)      │
│   + submit) │                   │                           │
└─────────────┴────────┬──────────┴───────────────────────────┘
                       │ fetch /api/*
┌──────────────────────▼──────────────────────────────────────┐
│                  Express Backend (Node.js)                   │
├────────────────────┬────────────────────────────────────────┤
│  POST /api/process │  CRUD /api/meetings, /api/action-items  │
│  (calls OpenAI,    │  (read, update status, edit, delete)    │
│   returns summary  │                                         │
│   + action items)  │                                         │
└────────────┬───────┴──────────────────────┬─────────────────┘
             │                              │
    ┌────────▼────────┐           ┌─────────▼────────┐
    │   OpenAI API    │           │  SQLite DB        │
    │   (GPT-4o)      │           │  (better-sqlite3) │
    └─────────────────┘           └──────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| MeetingInput | Capture raw meeting text, trigger processing | Controlled textarea + submit button + loading state |
| ProcessingService | Call backend `/api/process`, handle errors | Custom hook `useProcessMeeting()` |
| Dashboard | Display all action items, apply filters | Zustand store or Context, computed filtered list |
| ActionItemCard | Display + inline edit single action item | Local edit state, optimistic update |
| FilterBar | Status and assignee filter controls | Controlled selects, filter state in parent or store |
| Express API | Route handlers for meetings + action items | `src/server/routes/` |
| OpenAI Service | Build prompt, call API, parse response | `src/server/services/openai.ts` |
| SQLite Storage | Persist meetings and action items | `src/server/db/` with typed queries |

## Recommended Project Structure

```
src/
├── components/           # UI components
│   ├── MeetingInput.tsx   # Textarea + submit
│   ├── Dashboard.tsx      # Main list view
│   ├── ActionItemCard.tsx # Single item display/edit
│   └── FilterBar.tsx      # Status + assignee filters
├── hooks/                # Custom React hooks
│   ├── useProcessMeeting.ts  # API call + loading state
│   └── useActionItems.ts     # CRUD operations
├── store/                # State management
│   └── actionItemsStore.ts   # Zustand store
├── types/                # Shared TypeScript types
│   └── index.ts              # Meeting, ActionItem interfaces
├── server/               # Express backend
│   ├── index.ts              # Server entry point
│   ├── routes/
│   │   ├── meetings.ts       # POST /api/process, GET /api/meetings
│   │   └── actionItems.ts    # GET/PUT/DELETE /api/action-items
│   ├── services/
│   │   └── openai.ts         # GPT-4o prompt + response parsing
│   └── db/
│       ├── index.ts          # SQLite connection
│       ├── meetings.ts       # Meeting queries
│       └── actionItems.ts    # Action item queries
├── App.tsx               # Root component, routing
├── main.tsx              # React entry point
└── index.css             # Global styles
data/
└── meetings.db           # SQLite database (gitignored)
.env                      # OPENAI_API_KEY (gitignored)
```

### Structure Rationale

- **src/server/:** Backend lives inside src/ so tsconfig covers it; separate entry point `src/server/index.ts`
- **src/types/:** Shared types between frontend and backend — single source of truth for `ActionItem`, `Meeting`
- **src/hooks/:** Isolates API call logic from components — easy to test, easy to swap implementation

## Architectural Patterns

### Pattern 1: Backend Proxy for AI Calls

**What:** All OpenAI calls go through the Express backend. Frontend never touches the API key.
**When to use:** Always — API keys must never be in browser bundles.
**Trade-offs:** Adds a backend server; increases complexity slightly but is non-negotiable for security.

**Example:**
```typescript
// Frontend calls backend
const res = await fetch('/api/process', {
  method: 'POST',
  body: JSON.stringify({ text: meetingText }),
  headers: { 'Content-Type': 'application/json' }
})
const { summary, actionItems } = await res.json()
```

### Pattern 2: GPT-4o Structured Outputs (JSON Mode)

**What:** Use OpenAI's response_format: { type: "json_schema" } to get guaranteed-valid JSON.
**When to use:** Any time you need to parse AI output into typed data — eliminates malformed response handling.
**Trade-offs:** Requires defining a JSON schema; slightly reduces model creativity (fine for extraction tasks).

**Example:**
```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: buildPrompt(meetingText) }],
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'meeting_analysis',
      schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          actionItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                assignee: { type: 'string' },
                priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                status: { type: 'string', enum: ['todo', 'in-progress', 'done'] }
              }
            }
          }
        }
      }
    }
  }
})
```

### Pattern 3: Optimistic Updates for Status Changes

**What:** Update UI immediately on status change, then sync to backend.
**When to use:** Status toggles and edits — makes the app feel instant.
**Trade-offs:** Need to handle rollback on error; simple for MVP.

## Data Flow

### AI Processing Flow

```
User pastes text → clicks "Process"
    ↓
Frontend: POST /api/process { text }
    ↓
Backend: builds GPT-4o prompt
    ↓
OpenAI API: returns structured JSON
    ↓
Backend: validates with zod, saves to SQLite
    ↓
Backend: returns { summary, actionItems } to frontend
    ↓
Frontend: displays summary + populates action items list
```

### Action Item Edit Flow

```
User clicks edit on action item
    ↓
ActionItemCard: enters edit mode (local state)
    ↓
User submits → Frontend: PUT /api/action-items/:id
    ↓
Backend: updates SQLite record
    ↓
Frontend: updates Zustand store (or re-fetches)
    ↓
UI updates
```

### Dashboard Filter Flow

```
User selects filter (status="todo", assignee="João")
    ↓
FilterBar: updates filter state (URL params or store)
    ↓
Dashboard: re-computes filtered list from store
    ↓
No API call needed — filtering is client-side
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-50 meetings | Current architecture is fine; single SQLite file |
| 50-500 meetings | Add pagination to dashboard; add indexes to SQLite |
| 500+ meetings | Consider Turso (distributed SQLite) or PostgreSQL |

### Scaling Priorities

1. **First bottleneck:** Dashboard load time with many items → add pagination + server-side filter
2. **Second bottleneck:** SQLite concurrent writes → single-user app, not an issue unless going multi-user

## Anti-Patterns

### Anti-Pattern 1: Calling OpenAI from Frontend

**What people do:** `VITE_OPENAI_API_KEY` in .env, call OpenAI SDK directly in React component
**Why it's wrong:** Vite embeds VITE_* vars in the bundle — API key is visible to anyone who opens DevTools → Network tab
**Do this instead:** Always proxy through Express backend; keep API key in server-side .env only

### Anti-Pattern 2: Parsing AI Output with String Splitting

**What people do:** `response.split('\n').filter(line => line.startsWith('-'))` to extract action items
**Why it's wrong:** GPT output format is inconsistent; any prompt change breaks the parser
**Do this instead:** Use GPT-4o structured outputs with JSON schema — returns typed, guaranteed-valid JSON

### Anti-Pattern 3: Storing Everything in React State (No Persistence)

**What people do:** Keep action items in useState; data lost on page refresh
**Why it's wrong:** "Tracker" implies persistence; losing data on refresh is a critical UX failure
**Do this instead:** Persist to SQLite via backend immediately on creation; load on app start

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| OpenAI GPT-4o | REST via official SDK, backend only | Use structured outputs; handle rate limits with retry |
| SQLite (better-sqlite3) | Synchronous node.js module | Runs in same process as Express; no connection pooling needed |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Frontend ↔ Backend | HTTP fetch to /api/* | Vite proxies in dev; same origin in production |
| Backend ↔ OpenAI | openai SDK (HTTPS) | API key only in server process |
| Backend ↔ SQLite | better-sqlite3 (sync) | Direct function calls, not async |

## Sources

- Vite docs — server.proxy configuration
- OpenAI docs — structured outputs / JSON schema mode
- better-sqlite3 README — Node.js usage patterns

---
*Architecture research for: AI Meeting Notes & Action Tracker*
*Researched: 2026-02-20*
