# Design: AI Meeting Notes & Action Tracker – MVP

**Date:** 2026-02-20
**Branch:** 001-meeting-notes-tracker
**Linear:** https://linear.app/winnin/project/ai-meeting-notes-and-action-tracker-mvp-80f507bc5aee

---

## Overview

A React SPA that transforms pasted meeting text into a structured list of action items using OpenAI. Users paste raw notes, the AI extracts a summary and action items, and results are auto-saved to localStorage and displayed in a filterable dashboard.

---

## Decisions

| Question | Decision |
|---|---|
| Input method | Paste text only |
| AI service | OpenAI API (already configured via `.env`) |
| Action item fields | title, assignee, priority, status, due date |
| Dashboard view | Flat list of all action items across meetings |
| Save flow | Auto-save after AI processing, no review step |
| Persistence | `localStorage` key `"meetings"` |

---

## Data Model

```ts
interface ActionItem {
  id: string
  title: string
  assignee: string
  priority: 'high' | 'medium' | 'low'
  status: 'todo' | 'in-progress' | 'done'
  dueDate?: string       // ISO date string, optional
}

interface Meeting {
  id: string
  date: string           // ISO timestamp
  summary: string        // AI-generated 2-3 sentence summary
  actionItems: ActionItem[]
}
```

Storage: `JSON.stringify(Meeting[])` in `localStorage["meetings"]`.

---

## Architecture

```
App (view state: 'input' | 'dashboard')
├── Header (nav: New Meeting | Dashboard)
├── MeetingInput  (view = 'input')
└── Dashboard     (view = 'dashboard')
    ├── DashboardFilters
    └── ActionItemList
        └── ActionItemCard (×n)
```

**Services**
- `services/ai.ts` — sends text to OpenAI, returns `{ summary, actionItems[] }`
- `utils/storage.ts` — read/write `Meeting[]` to localStorage

---

## User Flow

```
1. User opens app → New Meeting view
2. Pastes raw meeting text → clicks "Process Meeting"
3. Loading spinner while OpenAI processes
4. AI returns { summary, actionItems[] }
5. Auto-saves Meeting to localStorage
6. Navigates to Dashboard
7. User sees flat filtered list of action items
8. User can change status inline, edit, or delete items
```

---

## AI Integration

**Prompt structure:** Send meeting text, request structured JSON response with:
- `summary`: 2-3 sentence summary of the meeting
- `actionItems[]`: each with title, assignee (name or "Unassigned"), priority, dueDate (if mentioned)

**Error handling:**
- Network/timeout error → error banner, preserve textarea content
- Malformed JSON → "Couldn't parse results, try again"
- Empty action items → warn "No action items found", save summary only

---

## UI Layout

### New Meeting View
```
┌─────────────────────────────────────────────┐
│  Meeting Notes    [New Meeting] [Dashboard]  │
├─────────────────────────────────────────────┤
│                                             │
│  Paste your meeting notes                   │
│  ┌─────────────────────────────────────┐   │
│  │  (textarea, ~8 rows)                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│              [Process Meeting]              │
│                                             │
└─────────────────────────────────────────────┘
```

### Dashboard View
```
┌─────────────────────────────────────────────┐
│  Meeting Notes    [New Meeting] [Dashboard]  │
├─────────────────────────────────────────────┤
│  [Assignee ▼]  [Status ▼]  [Priority ▼]    │
├─────────────────────────────────────────────┤
│  ● Fix auth bug · @ana · High · Mar 1  ✏ 🗑  │
│  ● Write docs  · @bob · Low  · —       ✏ 🗑  │
│  ✓ Deploy fix  · @ana · Med  · Feb 28  ✏ 🗑  │
└─────────────────────────────────────────────┘
```

Priority shown as colored dot: red=high, yellow=medium, green=low.
Completed items: muted / strikethrough.

---

## Component Responsibilities

| Component | Responsibility |
|---|---|
| `App.tsx` | View state (`input`/`dashboard`), navigation |
| `MeetingInput.tsx` | Textarea, submit, loading/error state, calls AI service |
| `Dashboard.tsx` | Reads from localStorage, applies filters, renders list |
| `DashboardFilters.tsx` | Controlled filter dropdowns (assignee, status, priority) |
| `ActionItemCard.tsx` | Single item row: inline status change, edit, delete |
| `services/ai.ts` | OpenAI call, JSON parsing, typed response |
| `utils/storage.ts` | localStorage read/write for `Meeting[]` |

---

## Out of Scope (MVP)

- File upload (PDF, docx)
- Manual mode without AI
- Review/edit step before saving
- View by meeting (grouped)
- Authentication
- Backend / database
