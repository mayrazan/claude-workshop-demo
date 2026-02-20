# Pitfalls Research

**Domain:** AI Meeting Notes & Action Tracker
**Researched:** 2026-02-20
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: API Key Exposed in Frontend Bundle

**What goes wrong:**
Developer puts `VITE_OPENAI_API_KEY=sk-...` in `.env` and calls OpenAI SDK directly from React. Vite embeds all `VITE_*` vars into the JavaScript bundle. Anyone who opens DevTools can read the key.

**Why it happens:**
Vite's env var system is convenient; developers don't realize `VITE_*` = "public by design."

**How to avoid:**
- Call OpenAI ONLY from the Express backend
- Backend reads `OPENAI_API_KEY` from `.env` (never VITE_)
- Frontend calls `/api/process` — never imports openai directly
- Add `.env` to `.gitignore` immediately

**Warning signs:**
- `import OpenAI from 'openai'` anywhere in `src/` (non-server files)
- `VITE_OPENAI` in any `.env` file

**Phase to address:**
Phase 1 (Backend setup) — get this right from day one

---

### Pitfall 2: Unvalidated / Unparseable AI Output

**What goes wrong:**
GPT returns markdown instead of JSON, or valid JSON with unexpected field names. `JSON.parse()` throws and the app crashes with a white screen.

**Why it happens:**
Developers trust that "GPT will always return what the prompt says" — it doesn't under edge cases (long inputs, ambiguous prompts, model updates).

**How to avoid:**
- Use GPT-4o structured outputs (`response_format: { type: 'json_schema' }`) — guaranteed valid JSON
- Add zod schema validation on the backend before sending to frontend
- Return a meaningful error message if parsing fails (don't let it crash silently)

**Warning signs:**
- No try/catch around JSON.parse()
- No zod validation on AI response
- Using text completion prompts like "return a JSON array" without json_schema

**Phase to address:**
Phase 1 (AI integration) — use structured outputs from the first implementation

---

### Pitfall 3: No Loading / Error States for AI Calls

**What goes wrong:**
User clicks "Process", nothing happens for 15 seconds, clicks again, gets duplicate results. Or API fails silently and user doesn't know.

**Why it happens:**
Developers test with short meeting texts (fast responses). Real meetings take 10-30 seconds to process.

**How to avoid:**
- Show loading spinner immediately on submit
- Disable submit button while processing
- Show error message if API call fails (network error, rate limit, invalid API key)
- Show token count or estimated time for long inputs

**Warning signs:**
- Submit button stays enabled during API call
- No error boundary or error display in the UI
- No abort controller for cancellation

**Phase to address:**
Phase 1 (AI integration) — loading states are part of the feature, not polish

---

### Pitfall 4: Data Loss on Page Refresh

**What goes wrong:**
Action items live only in React state. User closes the tab and all work is gone. The "tracker" part stops working.

**Why it happens:**
Easy to build stateful React app first, persistence feels like "v2."

**How to avoid:**
- Save meetings and action items to SQLite immediately on creation
- Load persisted data on app startup (useEffect on mount)
- Never treat persistence as optional for a "tracker" app

**Warning signs:**
- `useState` for action items list with no backend sync
- No GET /api/action-items call on app load

**Phase to address:**
Phase 1 or 2 (persistence must be in MVP, not deferred)

---

### Pitfall 5: Fragile Prompt Engineering

**What goes wrong:**
The prompt works for "nice" meeting notes but fails on messy real-world text (speaker labels, timestamps, interruptions, bullet lists, all-caps). AI extracts 0 items or hallucinates items.

**Why it happens:**
Testing with clean examples, not representative data.

**How to avoid:**
- Test prompt with at least 5 diverse real meeting notes before shipping
- Use system prompt to handle varied input formats explicitly
- Include examples (few-shot) in the prompt for edge cases
- Instruct the model to return empty array for action items if none found (not fabricate)

**Warning signs:**
- Prompt tested with only 1-2 clean examples
- No instruction for "if no action items found, return empty array"
- Model sometimes returns items with null assignee, no handling for that

**Phase to address:**
Phase 1 (AI integration) — prompt is part of the core feature

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode port numbers (3001, 5173) | Simpler config | Breaks in different envs | MVP only; use env vars before any deployment |
| No error boundaries in React | Faster dev | White screen crash on any unhandled error | Never in production |
| No database migrations | Simpler start | Schema changes break existing data | Add from Phase 1; even one migration file is enough |
| Synchronous SQLite everywhere | Simple code | Blocks Express event loop on large queries | Acceptable for MVP (small dataset); fix if slow |
| No input length validation | One less check | OpenAI token limits cause cryptic errors | Add max character limit on textarea (e.g., 50k chars) |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| OpenAI rate limits | No retry logic; 429 errors crash the flow | Wrap in try/catch, return user-friendly "try again" message |
| OpenAI token limits | Very long meeting text hits context limit | Truncate input or warn user before submission (show character count) |
| better-sqlite3 install | Native bindings fail on Windows without build tools | Document: requires Python + Visual Studio Build Tools on Windows; Linux/Mac works out of the box |
| Vite + Express dev | CORS errors when frontend (5173) calls backend (3001) | Add `cors()` middleware to Express; configure Vite proxy |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-render on every keystroke in filter | Filter input feels laggy | Debounce filter input or use uncontrolled input | With 50+ action items |
| Loading all meetings eagerly | Dashboard slow to open | Paginate; load last N meetings by default | With 100+ meetings |
| Syncing entire action items list on every status change | Wasteful re-renders | Update single item in store, optimistic update | With 30+ items on screen |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| OPENAI_API_KEY in frontend bundle | API key theft, financial loss | Backend-only; never VITE_ prefix |
| No .env in .gitignore | API key committed to git | Add `.env` to `.gitignore` before first commit |
| SQL injection via user input | DB corruption | Use parameterized queries in better-sqlite3 (it does this by default with `?` placeholders) |
| Storing raw meeting notes with PII in plain text | Privacy risk | Acceptable for internal MVP; add encryption if deployed externally |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No feedback during 15s AI processing | User thinks app is broken, clicks multiple times | Progress indicator + "Processing your meeting..." message |
| Editing overwrites without confirmation | User accidentally changes assignee | Autosave with undo, or explicit save button |
| Dashboard shows all items (no status grouping) | Hard to see what's actually open | Group by status: Todo / In Progress / Done columns or sections |
| Action item text truncated in list view | User can't read what the task is | Expand on click, or show full text by default |
| No empty state when no meetings processed | Blank screen confuses new users | Show "Paste your first meeting notes to get started" placeholder |

## "Looks Done But Isn't" Checklist

- [ ] **AI Processing:** Tested with messy real meeting text (not just clean demo notes) — verify it extracts correctly
- [ ] **Persistence:** Verified data survives page refresh (open DevTools > Application > clear localStorage — data should still be in DB)
- [ ] **Error Handling:** API key removed from .env — verify user sees friendly error, not white screen
- [ ] **Loading State:** Verified loading spinner shows during AI call (not just instant in local dev)
- [ ] **Edit Flow:** Verified edited action item updates in DB, not just in React state
- [ ] **Filters:** Verified filters work correctly when combined (status=todo AND assignee=João)

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| API key exposed | HIGH | Rotate key immediately in OpenAI dashboard; audit git history; move to backend |
| No persistence (data loss) | HIGH | Add backend + SQLite; users lose existing data (no migration possible if no schema) |
| Unvalidated AI output | MEDIUM | Add zod validation; add structured outputs; fix prompt |
| No loading states | LOW | Add isLoading state and spinner; 1-2 hour fix |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| API key in frontend | Phase 1 (Backend setup) | Grep for `VITE_OPENAI` in codebase |
| Unvalidated AI output | Phase 1 (AI integration) | Test with malformed/empty input |
| No loading states | Phase 1 (AI integration) | Test with throttled network (DevTools) |
| Data loss on refresh | Phase 2 (Persistence) | Refresh page, verify data persists |
| Fragile prompt | Phase 1 (AI integration) | Test with 5 diverse real meeting notes |

## Sources

- OpenAI docs — structured outputs, rate limits, token limits
- Vite docs — VITE_* env vars are public by design
- better-sqlite3 README — Windows install requirements
- Common React patterns — optimistic updates, loading states

---
*Pitfalls research for: AI Meeting Notes & Action Tracker*
*Researched: 2026-02-20*
