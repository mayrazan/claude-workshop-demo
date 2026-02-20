# Roadmap: AI Meeting Notes & Action Tracker – MVP

## Overview

Three phases deliver the core value: a secure AI backend that processes meeting text (Phase 1), local persistence that makes action items survive sessions (Phase 2), and a complete dashboard where users manage and track those items (Phase 3). Each phase is independently verifiable and builds on the previous.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Backend + AI Core** - Express backend processes meeting text via GPT-4o and returns structured summary + action items (completed 2026-02-20)
- [ ] **Phase 2: Persistence** - Action items and meetings are saved to SQLite and survive page refresh
- [ ] **Phase 3: Dashboard + Action Items** - Users manage, filter, edit, and delete action items from a central dashboard

## Phase Details

### Phase 1: Backend + AI Core
**Goal**: Users can paste meeting text and instantly receive an AI-generated summary and action item list
**Depends on**: Nothing (first phase)
**Requirements**: AI-01, AI-02, AI-03
**Success Criteria** (what must be TRUE):
  1. User can paste or type meeting text into a textarea and submit it
  2. The app returns a structured meeting summary within seconds of submission
  3. Action items appear with description, assignee, and priority extracted from the text
  4. The OpenAI API key is never exposed in the browser (calls go through backend)
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Express backend infrastructure (deps, scripts, Vite proxy, server entry point)
- [x] 01-02-PLAN.md — OpenAI integration: Zod schemas, processMeetingText(), POST /api/meetings/process route
- [x] 01-03-PLAN.md — React frontend: shared types, MeetingForm, MeetingResults, App.tsx update

### Phase 2: Persistence
**Goal**: Action items and meeting data survive page refresh without any user action
**Depends on**: Phase 1
**Requirements**: ITEM-04
**Success Criteria** (what must be TRUE):
  1. After processing a meeting, refreshing the page still shows the same action items
  2. Action items created in one session are present when the app is reopened
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Server persistence layer (better-sqlite3, db.ts, title field, save-on-process, GET /latest)
- [ ] 02-02-PLAN.md — Frontend hydration (types update, DisplayResult, useEffect on mount, verify checkpoint)

### Phase 3: Dashboard + Action Items
**Goal**: Users can view, manage, and track all action items from a central dashboard
**Depends on**: Phase 2
**Requirements**: ITEM-01, ITEM-02, ITEM-03, DASH-01, DASH-02
**Success Criteria** (what must be TRUE):
  1. User can see all action items in a single list view
  2. User can edit the description, assignee, and priority of any action item inline
  3. User can change the status of an action item (todo / in-progress / done)
  4. User can delete an action item that is incorrect or irrelevant
  5. User can filter the list to show only items matching a specific status
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Backend + AI Core | 3/3 | Complete | 2026-02-20 |
| 2. Persistence | 0/? | Not started | - |
| 3. Dashboard + Action Items | 0/? | Not started | - |
