# Phase 2: Persistence - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Action items and meeting data are persisted to SQLite so they survive page refresh — no user action required. History management, editing, and filtering are Phase 3. This phase establishes the storage foundation and ensures the last processed meeting reloads automatically.

</domain>

<decisions>
## Implementation Decisions

### Data scope
- Save action items only — raw meeting text is NOT persisted
- Each batch of action items is linked to a minimal meeting record
- The meeting record stores an AI-generated title (returned by GPT-4o as part of Phase 1's response)
- Meeting record includes a `created_at` timestamp

### Action item fields
- Claude's discretion on exact schema, but must support Phase 3: description, assignee, priority, and status (todo/in-progress/done)
- Status field added now even though Phase 2 doesn't expose editing — avoids Phase 3 migration

### Load behavior
- On startup (or page refresh): show the most recently processed meeting and its action items
- Layout of form vs results on load: Claude's discretion
- Empty database state (first launch): Claude's discretion
- Processing a new meeting while items are visible: replace — new meeting's action items replace the current view

### Meeting history
- Each processed meeting is saved as a separate record — full history preserved in DB
- History is stored silently in Phase 2; no UI for browsing past meetings
- History UI belongs in Phase 3 dashboard
- No delete or clear functionality in Phase 2

### Storage & queries
- SQLite database file stored in `/data` directory at project root, gitignored
- Raw SQL queries using `better-sqlite3` — no ORM
- Schema designed forward-compatible with Phase 3 (status column, appropriate indexes for filtering by status and meeting_id)

### Claude's Discretion
- Exact table structure and column names
- Whether to use two tables (meetings + action_items) or embedded JSON — choose based on Phase 3 queryability requirements
- Index strategy for Phase 3 filtering patterns
- How the form/results layout looks on first load vs return visits
- Empty state UI design

</decisions>

<specifics>
## Specific Ideas

- AI-generated meeting title should come from GPT-4o alongside the summary — this implies Phase 1's prompt/schema may need a small update to also return a `title` field
- `better-sqlite3` is preferred for synchronous API (no async complexity on the Express route handlers)

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-persistence*
*Context gathered: 2026-02-20*
