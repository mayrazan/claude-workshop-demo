# Implementation Plan: AI Meeting Notes & Action Tracker

**Branch**: `001-meeting-notes-tracker` | **Date**: 2026-02-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-meeting-notes-tracker/spec.md`

## Summary

Build a React 19 + TypeScript single-page application that transforms raw meeting transcripts into structured summaries and action items via the OpenAI Chat Completions API. All state persists in `localStorage`. Navigation between three views (input, review, dashboard) is managed by conditional rendering in `App.tsx`. No new npm runtime dependencies are added.

## Technical Context

**Language/Version**: TypeScript ~5.9.x (strict mode)
**Primary Dependencies**: React 19.x, Vite 7.x, lucide-react ^0.563
**Storage**: Browser `localStorage` (key: `"meetings"`, value: `JSON.stringify(Meeting[])`)
**Testing**: Manual verification (no testing framework per constitution)
**Target Platform**: Web browser, desktop + mobile (375px minimum width)
**Project Type**: Single web application (frontend only, no backend)
**Performance Goals**: AI processing < 30s (SC-001); dashboard load < 2s (SC-005)
**Constraints**: `npm run lint` and `npm run build` must pass with zero errors; no new runtime npm packages without a constitution amendment
**Scale/Scope**: Workshop demo; small data volume; one active user or small team sharing a browser/device

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First | ✅ PASS | All UI in `src/components/` before composition in `App.tsx` |
| II. Type Safety | ✅ PASS | `tsc --strict` required; all props typed; no implicit `any` |
| III. Design Fidelity | ✅ PASS | Components reference Figma node-id=1639-343791 via code comment |
| IV. Full-Workflow Integration | ✅ PASS | `spec.md` exists; `plan.md` created; PR will reference Figma node-id |
| V. Simplicity | ⚠️ JUSTIFIED | `src/services/ai.ts` serves a single call site (`MeetingInput`), but its complexity (prompt management, fetch, JSON parsing, retries) justifies isolation for workshop readability — see Complexity Tracking below |

**Post-Design Re-check**: ✅ No new violations introduced by data model or contracts.

## Project Structure

### Documentation (this feature)

```text
specs/001-meeting-notes-tracker/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── ai-service.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── MeetingInput.tsx       # View 1: text area + submitter name + submit
│   ├── MeetingReview.tsx      # View 2: review AI output, edit title, confirm
│   ├── ActionItemList.tsx     # Editable list of action items (used in review + meeting)
│   ├── ActionItemCard.tsx     # Single action item row (edit/delete/status)
│   ├── Dashboard.tsx          # View 3: flat list of all action items across meetings
│   └── DashboardFilters.tsx   # Filter controls (responsible person, status)
├── services/
│   └── ai.ts                  # OpenAI Chat Completions integration (see Complexity Tracking)
├── types/
│   └── index.ts               # Meeting, ActionItem, AIResponse interfaces
├── utils/
│   └── storage.ts             # localStorage read/write helpers
├── App.tsx                    # View state machine + navigation shell
├── main.tsx                   # Entry point (unchanged)
└── index.css                  # Global styles (extend as needed)
```

**Structure Decision**: Single web application (frontend only). No `backend/` split — the Vite dev proxy handles OpenAI API calls from the same Node.js process.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| `src/services/ai.ts` is a single-call-site abstraction (Principle V) | The AI service bundles: system prompt, user prompt template, fetch to `/api/openai`, JSON parse, retry on network failure, edge-case error mapping. Inlining 80+ lines of prompt + fetch logic into `MeetingInput.tsx` would make the component unreadable and defeat the workshop's educational purpose. | Inline in component: makes `MeetingInput.tsx` ~150 lines with mixed concerns, hard for attendees to follow. The service boundary is the simplest split that keeps each file focused. |

## Implementation Phases

### Phase 1 — Foundation

**Goal**: Types, storage, AI service, and app shell with view routing.

1. `src/types/index.ts` — Define `Meeting`, `ActionItem`, `AIResponse` types
2. `src/utils/storage.ts` — `loadMeetings()`, `saveMeetings()`, `addMeeting()`, `updateActionItem()`, `deleteActionItem()`, `addActionItem()`
3. `src/services/ai.ts` — `processMeeting(text: string): Promise<AIResponse>`
4. `vite.config.ts` — Add `server.proxy` for `/api/openai`
5. `src/App.tsx` — View state (`'input' | 'review' | 'dashboard'`), nav bar, conditional rendering

### Phase 2 — MeetingInput View

**Goal**: FR-001, FR-017, FR-018, FR-019, FR-021 — paste transcript, validate, call AI, handle errors.

6. `src/components/MeetingInput.tsx` — Textarea, submitter name field, submit button, loading state, error display with retry

### Phase 3 — MeetingReview View

**Goal**: FR-002–FR-011, FR-018 — review AI output, edit title, manage action items before saving.

7. `src/components/ActionItemCard.tsx` — Inline editing for description, responsible, priority, status, due date, delete
8. `src/components/ActionItemList.tsx` — List of `ActionItemCard` + "Add manually" button
9. `src/components/MeetingReview.tsx` — Meeting title field, summary display, `ActionItemList`, Save button

### Phase 4 — Dashboard View

**Goal**: FR-013–FR-016 — flat list of all action items with filters.

10. `src/components/DashboardFilters.tsx` — Responsible and status filter dropdowns
11. `src/components/Dashboard.tsx` — All action items from localStorage, filtered list, empty state
12. Mobile responsiveness pass (FR-016, SC-006)

### Phase 5 — Polish & Verification

13. Apply Untitled UI design tokens (colors, spacing, typography) — FR-016, Principle III
14. Verify `npm run lint` → zero errors
15. Verify `npm run build` → zero TypeScript errors
16. Manual verification against all acceptance scenarios in spec

## Key Constraints Summary

- **No new npm runtime dependencies** without a constitution amendment + table update
- **`tsc --strict` must pass** — all types explicit, no `any`
- **Component-first** — components renderable standalone; no circular imports
- **Figma reference** — every component file must include `// Figma node-id: 1639-343791` comment
- **`OPENAI_API_KEY`** in `.env` (no `VITE_` prefix) — accessed by Vite proxy in Node.js context only; never embedded in browser bundle
