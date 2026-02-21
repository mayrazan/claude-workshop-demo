# Tasks: AI Meeting Notes & Action Tracker

**Input**: Design documents from `/specs/001-meeting-notes-tracker/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ai-service.md ✅ quickstart.md ✅

**Tests**: No test tasks included — manual verification per project constitution (no testing framework configured).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to ([US1], [US2], [US3])
- All file paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Configure the Vite dev server proxy required for OpenAI API calls — zero new npm dependencies.

- [X] T001 Configure Vite dev server proxy mapping `/api/openai` → `https://api.openai.com/v1/chat/completions` with `Authorization: Bearer` header injected from `process.env.OPENAI_API_KEY` in vite.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: TypeScript interfaces, localStorage utilities, AI service, and App navigation shell — all user stories depend on these.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 Define `Meeting`, `ActionItem`, `AISuccessResponse`, `AIErrorResponse`, and `AIResponse` TypeScript interfaces exactly as specified in data-model.md in src/types/index.ts
- [X] T003 [P] Implement `loadMeetings()`, `saveMeetings()`, `addMeeting()`, `updateActionItem()`, `deleteActionItem()`, and `addActionItem()` helpers with `DOMException` and `SyntaxError` error handling in src/utils/storage.ts
- [X] T004 [P] Implement `processMeeting(text: string): Promise<AIResponse>` with system prompt from contracts/ai-service.md, gpt-4o-mini JSON mode (`response_format: { type: 'json_object' }`), `temperature: 0`, fetch to `/api/openai`, and one retry on network failure in src/services/ai.ts
- [X] T005 [P] Implement `view` state typed as `'input' | 'review' | 'dashboard'`, navigation bar with links to each view, and conditional view rendering shell in src/App.tsx

**Checkpoint**: Foundation ready — user story implementation can now begin (T003, T004, T005 run in parallel after T002).

---

## Phase 3: User Story 1 — Generate Summary and Action Items (Priority: P1) 🎯 MVP

**Goal**: User pastes a meeting transcript, system validates word count, calls the AI service, and displays structured summary with action items in the review view.

**Independent Test**: Paste a sample transcript (20+ words) → submit → verify summary and at least one action item appear within 30 seconds (SC-001). Then test: empty/short text (<20 words) shows validation message (FR-017); AI failure shows error with retry button (FR-019); original transcript is preserved on failure.

### Implementation for User Story 1

- [X] T006 [US1] Implement `MeetingInput.tsx` with multi-line textarea (FR-001), submitter name text field (FR-021), ≥20-word client-side validation with clear message (FR-017), submit button disabled during `processMeeting()` in-flight, loading indicator, error message with retry action on `PROCESSING_ERROR` (FR-019), `INSUFFICIENT_INPUT` message without proceeding to review, and successful result passed to App state for navigation to review view in src/components/MeetingInput.tsx

**Checkpoint**: US1 fully functional — paste transcript → AI processes → review view loads with summary and action items.

---

## Phase 4: User Story 2 — Edit and Manage Action Items (Priority: P2)

**Goal**: User reviews AI-generated action items in the review view, edits any field inline, deletes incorrect items, adds items manually, and saves the completed meeting to localStorage.

**Independent Test**: Open review view with pre-populated action items → verify inline editing for description, responsible, priority, status, and due date saves immediately (FR-006–FR-009, FR-022); delete an item and confirm it is removed (FR-010); click "Add manually" and confirm a new blank item appears (FR-011); click Save and confirm meeting appears in localStorage under key `"meetings"`.

### Implementation for User Story 2

- [X] T007 [US2] Implement `ActionItemCard.tsx` with inline editable description field (FR-006), responsible person free-text input (FR-007), priority selector (`High | Medium | Low`) (FR-008), status selector (`Pending | In Progress | Done`) (FR-009), optional clearable due date input (FR-022), and delete button with confirmation (FR-010) in src/components/ActionItemCard.tsx
- [X] T008 [US2] Implement `ActionItemList.tsx` rendering a list of `ActionItemCard` components and an "Add manually" button that appends a new empty `ActionItem` with `crypto.randomUUID()` id (FR-011) in src/components/ActionItemList.tsx
- [X] T009 [US2] Implement `MeetingReview.tsx` with editable meeting title input pre-filled from AI suggestion (FR-018), AI-generated summary and discussion points display (not saved post-review), `ActionItemList` component, and Save button that calls `addMeeting()` with denormalized `meetingTitle` on each action item then navigates to dashboard in src/components/MeetingReview.tsx

**Checkpoint**: US1 and US2 both functional — complete input → AI → review → edit → save flow works end-to-end.

---

## Phase 5: User Story 3 — Dashboard with Filtering (Priority: P3)

**Goal**: User sees all action items from all saved meetings in a flat list, with the parent meeting title as context, filterable by responsible person and status.

**Independent Test**: Seed localStorage with multiple meetings having action items assigned to different people and statuses → open dashboard → verify all items listed with description, responsible, priority, status, due date (if set), and parent meeting title (FR-013, FR-023); filter by responsible person → only that person's items shown (FR-014); filter by status `Done` → only done items shown (FR-015); clear filters → all items restored; verify empty state message when no meetings in localStorage.

### Implementation for User Story 3

- [X] T010 [US3] Implement `DashboardFilters.tsx` with an "All" + dynamically derived unique responsible person options dropdown (FR-014) and an "All" + fixed `Pending | In Progress | Done` status options dropdown (FR-015), accepting current filter values as props and emitting onChange callbacks in src/components/DashboardFilters.tsx
- [X] T011 [US3] Implement `Dashboard.tsx` calling `loadMeetings()` on mount, flattening all `actionItems` arrays with `meetingTitle` context, rendering filtered flat list with all action item fields (FR-013, FR-023), integrating `DashboardFilters` component, and displaying empty state message when no items match or no meetings exist in src/components/Dashboard.tsx

**Checkpoint**: All three user stories functional — complete feature delivered end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Design fidelity, mobile responsiveness, and build validation across all views.

- [X] T012 [P] Apply Untitled UI design tokens (colors, spacing, typography matching Figma node-id `1639-343791`) and add `// Figma node-id: 1639-343791` comment to every component file (Principle III) in src/components/*.tsx and src/index.css
- [X] T013 [P] Verify and fix layout for 375px minimum viewport width across `MeetingInput.tsx`, `MeetingReview.tsx`, `ActionItemCard.tsx`, `ActionItemList.tsx`, `DashboardFilters.tsx`, and `Dashboard.tsx` (FR-016, SC-006) in src/components/*.tsx and src/index.css
- [X] T014 Run `npm run lint` and resolve all ESLint errors to zero across all modified files
- [X] T015 Run `npm run build` (`tsc --strict` + Vite production build) and resolve all TypeScript type errors to zero across all modified files
- [ ] T016 Manual verification against all acceptance scenarios in spec.md following the flow in quickstart.md: input → AI processing → review → save → dashboard → filter

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **User Stories (Phases 3–5)**: All depend on Phase 2 completion
  - Priority order: US1 → US2 → US3 (or parallel across developers if team capacity allows)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (Phase 3)**: Depends on Foundation only — no cross-story dependencies
- **US2 (Phase 4)**: Depends on Foundation — `ActionItemCard`/`ActionItemList` are self-contained; integrates with App state from US1 but independently testable via pre-populated state
- **US3 (Phase 5)**: Depends on Foundation — reads `loadMeetings()` directly; independently testable with pre-seeded localStorage

### Within Each Phase

- **Phase 2**: T002 first → T003, T004, T005 all parallel (each depends only on T002 types, different files)
- **Phase 3**: T006 single task (after Foundation complete)
- **Phase 4**: T007 → T008 (depends on T007 for `ActionItemCard`) → T009 (depends on T008 for `ActionItemList`)
- **Phase 5**: T010 → T011 (depends on T010 for `DashboardFilters`)
- **Phase 6**: T012 + T013 parallel → T014 → T015 → T016

### Parallel Opportunities

- **Phase 2**: T003, T004, T005 all run in parallel after T002 completes
- **Phase 6**: T012 and T013 run in parallel (different concerns)
- **Cross-story**: With multiple developers — after Phase 2 completes, US1 (Phase 3), US2 (Phase 4), US3 (Phase 5) can proceed in parallel

---

## Parallel Example: Phase 2 (Foundation)

```bash
# After T002 completes — launch all three in parallel:
Task: "Implement localStorage helpers in src/utils/storage.ts"   # T003
Task: "Implement AI service in src/services/ai.ts"              # T004
Task: "Set up App.tsx view state machine"                        # T005
```

## Parallel Example: Phase 6 (Polish)

```bash
# After all user stories complete — launch both in parallel:
Task: "Apply Untitled UI design tokens in src/components/*.tsx"  # T012
Task: "Fix mobile responsiveness for 375px width"                # T013
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup — Vite proxy
2. Complete Phase 2: Foundational — types, storage, AI service, App shell
3. Complete Phase 3: User Story 1 — MeetingInput → AI → review
4. **STOP and VALIDATE**: Paste transcript → verify AI response and review view loads within 30s (SC-001)
5. Demo if ready

### Incremental Delivery

1. Setup + Foundation → Infrastructure ready
2. **US1** → AI extraction works → Demo **(MVP!)**
3. **US2** → Full review/edit/save flow → Demo
4. **US3** → Dashboard with filters → Demo
5. **Polish** → Design fidelity + build passes → PR ready

### Parallel Team Strategy

With multiple developers (after Phase 2 completes):
- Developer A: User Story 1 — `MeetingInput.tsx` + AI integration
- Developer B: User Story 2 — `ActionItemCard.tsx`, `ActionItemList.tsx`, `MeetingReview.tsx`
- Developer C: User Story 3 — `DashboardFilters.tsx`, `Dashboard.tsx`

---

## Notes

- No test tasks — manual verification per project constitution; no testing framework
- Every component file must include `// Figma node-id: 1639-343791` comment (Principle III)
- `OPENAI_API_KEY` in `.env` (no `VITE_` prefix) — injected by Vite proxy, never in browser bundle
- No new npm runtime dependencies without a constitution amendment
- `tsc --strict` must pass — no implicit `any`, all props fully typed
- `responsible: null` from AI → store as `''` (empty string = "Unassigned" in UI)
- Commit after each task or logical group; stop at phase checkpoints to validate independently
