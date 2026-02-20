# AI Meeting Notes Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a two-view React SPA where users paste meeting notes, OpenAI extracts a summary and action items, and results are auto-saved to localStorage and displayed in a filterable dashboard.

**Architecture:** Two views (`input` | `dashboard`) managed by `App.tsx`. `MeetingInput` calls an OpenAI proxy, auto-saves to localStorage, and redirects to `Dashboard`. Dashboard reads localStorage, flattens all action items across meetings, and filters by responsible/status/priority.

**Tech Stack:** React 19, TypeScript 5.9 (strict), Vite 7, lucide-react, localStorage persistence, OpenAI via `/api/openai` Vite proxy

---

## Branch setup

Before starting, ensure you're on the correct branch:

```bash
git checkout 001-meeting-notes-tracker
npm install
npm run dev   # verify app runs at localhost:5173
```

---

## Task 1: Add Vitest

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/utils/storage.test.ts` (in Task 3)

**Step 1: Install Vitest**

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/jest-dom
```

**Step 2: Add test script to `package.json`**

In the `"scripts"` block, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 3: Add Vitest config to `vite.config.ts`**

```ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
    },
    server: {
      proxy: {
        '/api/openai': {
          target: 'https://api.openai.com',
          changeOrigin: true,
          rewrite: () => '/v1/chat/completions',
          headers: {
            'Authorization': `Bearer ${env.VITE_OPENAI_API_KEY ?? ''}`,
          },
        },
      },
    },
  }
})
```

**Step 4: Verify Vitest works**

```bash
npm test
```
Expected: "No test files found" (passes with 0 tests).

**Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts
git commit -m "chore: add vitest for unit testing"
```

---

## Task 2: Define types

**Files:**
- Modify: `src/types/index.ts`

**Step 1: Replace the file with the complete type definitions**

```ts
// src/types/index.ts

export interface Meeting {
  id: string;
  title: string;
  submitter: string;
  createdAt: string;         // ISO timestamp
  summary: string;           // AI-generated 2-3 sentence summary
  actionItems: ActionItem[];
}

export interface ActionItem {
  id: string;
  meetingId: string;
  meetingTitle: string;
  description: string;
  responsible: string;       // name or "Unassigned"
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Done';
  dueDate: string | null;    // ISO date string or null
}

export interface AISuccessResponse {
  success: true;
  meeting: {
    title: string;
    summary: string;
    discussionPoints: string[];
  };
  actionItems: Array<{
    description: string;
    responsible: string | null;
    priority: 'High' | 'Medium' | 'Low';
    dueDate: string | null;
  }>;
}

export interface AIErrorResponse {
  success: false;
  error: {
    code: 'INSUFFICIENT_INPUT' | 'PROCESSING_ERROR';
    message: string;
  };
}

export type AIResponse = AISuccessResponse | AIErrorResponse;
```

**Step 2: Verify types compile**

```bash
npm run build
```
Expected: no TypeScript errors.

**Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add dueDate to ActionItem and summary to Meeting"
```

---

## Task 3: Storage utility

**Files:**
- Create/Modify: `src/utils/storage.ts`
- Create: `src/utils/storage.test.ts`

**Step 1: Write the failing tests first**

```ts
// src/utils/storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { getMeetings, saveMeeting, deleteActionItem, updateActionItemStatus } from './storage'
import type { Meeting } from '../types'

const mockMeeting: Meeting = {
  id: 'meeting-1',
  title: 'Q1 Planning',
  submitter: 'Ana',
  createdAt: '2026-02-20T12:00:00.000Z',
  summary: 'Discussed Q1 goals.',
  actionItems: [
    {
      id: 'item-1',
      meetingId: 'meeting-1',
      meetingTitle: 'Q1 Planning',
      description: 'Write specs',
      responsible: 'Bob',
      priority: 'High',
      status: 'Pending',
      dueDate: '2026-03-01',
    },
  ],
}

beforeEach(() => {
  localStorage.clear()
})

describe('getMeetings', () => {
  it('returns empty array when nothing stored', () => {
    expect(getMeetings()).toEqual([])
  })

  it('returns stored meetings', () => {
    localStorage.setItem('meetings', JSON.stringify([mockMeeting]))
    expect(getMeetings()).toEqual([mockMeeting])
  })
})

describe('saveMeeting', () => {
  it('appends a meeting to the list', () => {
    saveMeeting(mockMeeting)
    expect(getMeetings()).toHaveLength(1)
    expect(getMeetings()[0].id).toBe('meeting-1')
  })

  it('preserves existing meetings when saving a new one', () => {
    saveMeeting(mockMeeting)
    const second = { ...mockMeeting, id: 'meeting-2' }
    saveMeeting(second)
    expect(getMeetings()).toHaveLength(2)
  })
})

describe('deleteActionItem', () => {
  it('removes an action item from its meeting', () => {
    saveMeeting(mockMeeting)
    deleteActionItem('meeting-1', 'item-1')
    const meetings = getMeetings()
    expect(meetings[0].actionItems).toHaveLength(0)
  })
})

describe('updateActionItemStatus', () => {
  it('updates the status of an action item', () => {
    saveMeeting(mockMeeting)
    updateActionItemStatus('meeting-1', 'item-1', 'Done')
    const meetings = getMeetings()
    expect(meetings[0].actionItems[0].status).toBe('Done')
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL — "getMeetings is not a function"

**Step 3: Implement `storage.ts`**

```ts
// src/utils/storage.ts
import type { Meeting, ActionItem } from '../types'

const STORAGE_KEY = 'meetings'

export function getMeetings(): Meeting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Meeting[]) : []
  } catch {
    return []
  }
}

export function saveMeeting(meeting: Meeting): void {
  const meetings = getMeetings()
  meetings.push(meeting)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings))
}

export function deleteActionItem(meetingId: string, actionItemId: string): void {
  const meetings = getMeetings()
  const updated = meetings.map((m) =>
    m.id === meetingId
      ? { ...m, actionItems: m.actionItems.filter((a) => a.id !== actionItemId) }
      : m
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function updateActionItemStatus(
  meetingId: string,
  actionItemId: string,
  status: ActionItem['status']
): void {
  const meetings = getMeetings()
  const updated = meetings.map((m) =>
    m.id === meetingId
      ? {
          ...m,
          actionItems: m.actionItems.map((a) =>
            a.id === actionItemId ? { ...a, status } : a
          ),
        }
      : m
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function updateActionItem(
  meetingId: string,
  actionItemId: string,
  changes: Partial<Pick<ActionItem, 'description' | 'responsible' | 'priority' | 'dueDate'>>
): void {
  const meetings = getMeetings()
  const updated = meetings.map((m) =>
    m.id === meetingId
      ? {
          ...m,
          actionItems: m.actionItems.map((a) =>
            a.id === actionItemId ? { ...a, ...changes } : a
          ),
        }
      : m
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test
```
Expected: 7 tests pass.

**Step 5: Commit**

```bash
git add src/utils/storage.ts src/utils/storage.test.ts
git commit -m "feat(storage): add localStorage utilities with tests"
```

---

## Task 4: AI service

**Files:**
- Create/Modify: `src/services/ai.ts`

> No tests for this task — the service makes real HTTP calls. Mock testing adds complexity not worth it for this MVP. Manual test happens in Task 9.

**Step 1: Implement `ai.ts`**

```ts
// src/services/ai.ts
import type { AIResponse } from '../types'

const SYSTEM_PROMPT = `You are a meeting notes processor. Extract a structured summary and action items from raw meeting notes.

Respond ONLY with valid JSON matching this schema exactly:

For successful processing:
{
  "success": true,
  "meeting": {
    "title": "<concise title, 5-12 words, Title Case>",
    "summary": "<2-3 sentence narrative summary>",
    "discussionPoints": ["<point 1>", "<point 2>"]
  },
  "actionItems": [
    {
      "description": "<what needs to be done>",
      "responsible": "<person name or null>",
      "priority": "High" | "Medium" | "Low",
      "dueDate": "<YYYY-MM-DD or null>"
    }
  ]
}

For insufficient input (too short, not a meeting):
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_INPUT",
    "message": "<explanation>"
  }
}`

export async function processMeetingNotes(text: string): Promise<AIResponse> {
  const response = await fetch('/api/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> }
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('Empty response from OpenAI')
  }

  return JSON.parse(content) as AIResponse
}
```

**Step 2: Verify TypeScript compiles**

```bash
npm run build
```
Expected: no errors.

**Step 3: Commit**

```bash
git add src/services/ai.ts
git commit -m "feat(ai): implement OpenAI meeting processor service"
```

---

## Task 5: MeetingInput component

**Files:**
- Create/Modify: `src/components/MeetingInput.tsx`

**Step 1: Implement `MeetingInput.tsx`**

```tsx
// src/components/MeetingInput.tsx
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { processMeetingNotes } from '../services/ai'
import { saveMeeting } from '../utils/storage'
import type { AISuccessResponse, Meeting } from '../types'

interface Props {
  onSuccess: () => void
}

export default function MeetingInput({ onSuccess }: Props) {
  const [text, setText] = useState('')
  const [submitter, setSubmitter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    setError(null)

    try {
      const result = await processMeetingNotes(text)

      if (!result.success) {
        setError(result.error.message)
        return
      }

      const aiResult = result as AISuccessResponse
      const meetingId = crypto.randomUUID()
      const meeting: Meeting = {
        id: meetingId,
        title: aiResult.meeting.title,
        submitter: submitter.trim() || 'Unknown',
        createdAt: new Date().toISOString(),
        summary: aiResult.meeting.summary,
        actionItems: aiResult.actionItems.map((item) => ({
          id: crypto.randomUUID(),
          meetingId,
          meetingTitle: aiResult.meeting.title,
          description: item.description,
          responsible: item.responsible ?? 'Unassigned',
          priority: item.priority,
          status: 'Pending' as const,
          dueDate: item.dueDate,
        })),
      }

      saveMeeting(meeting)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="meeting-input">
      <h1 className="meeting-input__title">New Meeting</h1>
      <p className="meeting-input__subtitle">
        Paste your meeting notes and AI will extract action items automatically.
      </p>

      <form onSubmit={handleSubmit} className="meeting-input__form">
        <div className="form-field">
          <label htmlFor="submitter">Your name</label>
          <input
            id="submitter"
            type="text"
            value={submitter}
            onChange={(e) => setSubmitter(e.target.value)}
            placeholder="e.g. Ana"
          />
        </div>

        <div className="form-field">
          <label htmlFor="notes">Meeting notes *</label>
          <textarea
            id="notes"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your meeting notes here..."
            rows={10}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="btn btn--primary"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="spin" />
              Processing...
            </>
          ) : (
            'Process Meeting'
          )}
        </button>
      </form>
    </div>
  )
}
```

**Step 2: Verify TypeScript compiles**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/components/MeetingInput.tsx
git commit -m "feat(components): add MeetingInput component"
```

---

## Task 6: ActionItemCard component

**Files:**
- Create/Modify: `src/components/ActionItemCard.tsx`

**Step 1: Implement `ActionItemCard.tsx`**

```tsx
// src/components/ActionItemCard.tsx
import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import type { ActionItem } from '../types'

interface Props {
  item: ActionItem
  onStatusChange: (status: ActionItem['status']) => void
  onDelete: () => void
  onEdit: (changes: Partial<Pick<ActionItem, 'description' | 'responsible' | 'priority' | 'dueDate'>>) => void
}

const PRIORITY_CLASS: Record<ActionItem['priority'], string> = {
  High: 'priority--high',
  Medium: 'priority--medium',
  Low: 'priority--low',
}

export default function ActionItemCard({ item, onStatusChange, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    description: item.description,
    responsible: item.responsible,
    priority: item.priority,
    dueDate: item.dueDate ?? '',
  })

  function handleSave() {
    onEdit({
      description: draft.description,
      responsible: draft.responsible,
      priority: draft.priority,
      dueDate: draft.dueDate || null,
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="action-item action-item--editing">
        <input
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          className="action-item__input"
          placeholder="Description"
        />
        <input
          value={draft.responsible}
          onChange={(e) => setDraft((d) => ({ ...d, responsible: e.target.value }))}
          className="action-item__input"
          placeholder="Responsible"
        />
        <select
          value={draft.priority}
          onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as ActionItem['priority'] }))}
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <input
          type="date"
          value={draft.dueDate}
          onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
        />
        <button onClick={handleSave} className="btn-icon btn-icon--confirm" title="Save">
          <Check size={16} />
        </button>
        <button onClick={() => setEditing(false)} className="btn-icon btn-icon--cancel" title="Cancel">
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className={`action-item ${item.status === 'Done' ? 'action-item--done' : ''}`}>
      <span className={`priority-dot ${PRIORITY_CLASS[item.priority]}`} title={item.priority} />
      <span className="action-item__description">{item.description}</span>
      <span className="action-item__responsible">@{item.responsible}</span>
      <select
        value={item.status}
        onChange={(e) => onStatusChange(e.target.value as ActionItem['status'])}
        className="action-item__status"
      >
        <option>Pending</option>
        <option>In Progress</option>
        <option>Done</option>
      </select>
      {item.dueDate && (
        <span className="action-item__due">
          {new Date(item.dueDate).toLocaleDateString()}
        </span>
      )}
      <button onClick={() => setEditing(true)} className="btn-icon" title="Edit">
        <Pencil size={14} />
      </button>
      <button onClick={onDelete} className="btn-icon btn-icon--danger" title="Delete">
        <Trash2 size={14} />
      </button>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/ActionItemCard.tsx
git commit -m "feat(components): add ActionItemCard with inline edit and status change"
```

---

## Task 7: DashboardFilters component

**Files:**
- Create/Modify: `src/components/DashboardFilters.tsx`

**Step 1: Implement `DashboardFilters.tsx`**

```tsx
// src/components/DashboardFilters.tsx
import type { ActionItem } from '../types'

export interface Filters {
  responsible: string
  status: ActionItem['status'] | ''
  priority: ActionItem['priority'] | ''
}

interface Props {
  filters: Filters
  responsibles: string[]
  onChange: (filters: Filters) => void
}

export default function DashboardFilters({ filters, responsibles, onChange }: Props) {
  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="dashboard-filters">
      <select
        value={filters.responsible}
        onChange={(e) => set('responsible', e.target.value)}
      >
        <option value="">All assignees</option>
        {responsibles.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => set('status', e.target.value as Filters['status'])}
      >
        <option value="">All statuses</option>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>

      <select
        value={filters.priority}
        onChange={(e) => set('priority', e.target.value as Filters['priority'])}
      >
        <option value="">All priorities</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/DashboardFilters.tsx
git commit -m "feat(components): add DashboardFilters component"
```

---

## Task 8: Dashboard component

**Files:**
- Create/Modify: `src/components/Dashboard.tsx`

**Step 1: Implement `Dashboard.tsx`**

```tsx
// src/components/Dashboard.tsx
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { getMeetings, deleteActionItem, updateActionItemStatus, updateActionItem } from '../utils/storage'
import DashboardFilters, { type Filters } from './DashboardFilters'
import ActionItemCard from './ActionItemCard'
import type { ActionItem } from '../types'

interface Props {
  onNewMeeting: () => void
  refreshKey: number
}

export default function Dashboard({ onNewMeeting, refreshKey }: Props) {
  const [allItems, setAllItems] = useState<ActionItem[]>([])
  const [filters, setFilters] = useState<Filters>({ responsible: '', status: '', priority: '' })

  useEffect(() => {
    const meetings = getMeetings()
    const items = meetings.flatMap((m) => m.actionItems)
    setAllItems(items)
  }, [refreshKey])

  const responsibles = [...new Set(allItems.map((i) => i.responsible))].sort()

  const filtered = allItems.filter((item) => {
    if (filters.responsible && item.responsible !== filters.responsible) return false
    if (filters.status && item.status !== filters.status) return false
    if (filters.priority && item.priority !== filters.priority) return false
    return true
  })

  function refresh() {
    const meetings = getMeetings()
    setAllItems(meetings.flatMap((m) => m.actionItems))
  }

  function handleStatusChange(item: ActionItem, status: ActionItem['status']) {
    updateActionItemStatus(item.meetingId, item.id, status)
    refresh()
  }

  function handleDelete(item: ActionItem) {
    deleteActionItem(item.meetingId, item.id)
    refresh()
  }

  function handleEdit(item: ActionItem, changes: Partial<Pick<ActionItem, 'description' | 'responsible' | 'priority' | 'dueDate'>>) {
    updateActionItem(item.meetingId, item.id, changes)
    refresh()
  }

  if (allItems.length === 0) {
    return (
      <div className="dashboard dashboard--empty">
        <p>No meetings yet.</p>
        <button onClick={onNewMeeting} className="btn btn--primary">
          <Plus size={16} /> Process your first meeting
        </button>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Action Items <span className="badge">{filtered.length}</span></h1>
      </div>

      <DashboardFilters
        filters={filters}
        responsibles={responsibles}
        onChange={setFilters}
      />

      <div className="action-item-list">
        {filtered.length === 0 ? (
          <p className="dashboard__empty-filter">No items match the current filters.</p>
        ) : (
          filtered.map((item) => (
            <ActionItemCard
              key={item.id}
              item={item}
              onStatusChange={(status) => handleStatusChange(item, status)}
              onDelete={() => handleDelete(item)}
              onEdit={(changes) => handleEdit(item, changes)}
            />
          ))
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Dashboard.tsx
git commit -m "feat(components): add Dashboard with flat filtered action item list"
```

---

## Task 9: Wire up App.tsx

**Files:**
- Modify: `src/App.tsx`

**Step 1: Replace `App.tsx`**

```tsx
// src/App.tsx
import { useState } from 'react'
import MeetingInput from './components/MeetingInput'
import Dashboard from './components/Dashboard'
import './App.css'

type View = 'input' | 'dashboard'

export default function App() {
  const [view, setView] = useState<View>('input')
  const [refreshKey, setRefreshKey] = useState(0)

  function handleSuccess() {
    setRefreshKey((k) => k + 1)
    setView('dashboard')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <span className="app-logo">Meeting Notes</span>
          <nav className="app-nav">
            <button
              className={`nav-link ${view === 'input' ? 'nav-link--active' : ''}`}
              onClick={() => setView('input')}
            >
              New Meeting
            </button>
            <button
              className={`nav-link ${view === 'dashboard' ? 'nav-link--active' : ''}`}
              onClick={() => setView('dashboard')}
            >
              Dashboard
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {view === 'input' && <MeetingInput onSuccess={handleSuccess} />}
        {view === 'dashboard' && (
          <Dashboard onNewMeeting={() => setView('input')} refreshKey={refreshKey} />
        )}
      </main>
    </div>
  )
}
```

**Step 2: Run the app and manually test**

```bash
npm run dev
```

1. Open `http://localhost:5173`
2. Paste a sample meeting text (example below)
3. Click "Process Meeting" — expect spinner, then redirect to Dashboard
4. Verify action items appear with correct fields
5. Change status on one item
6. Delete one item
7. Edit one item

**Sample meeting text for testing:**
```
Q1 Planning - February 20, 2026
Attendees: Ana, Bob, Carlos

We discussed the roadmap for Q1. Ana will write the technical specs by March 1st.
Bob needs to set up the CI pipeline — this is high priority and must be done by Feb 28.
Carlos will schedule user interviews for next week, medium priority.
Everyone agreed to use TypeScript strict mode going forward.
```

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up two-view app with MeetingInput and Dashboard"
```

---

## Task 10: CSS styling

**Files:**
- Modify: `src/App.css`
- Modify: `src/index.css`

**Step 1: Update `src/App.css`**

Add styles for the layout classes used in components. Key classes to define:

```css
/* App shell */
.app { min-height: 100vh; display: flex; flex-direction: column; }
.app-header { background: var(--color-surface); border-bottom: 1px solid var(--color-border); }
.app-header__inner { max-width: 900px; margin: 0 auto; padding: 0 1.5rem; display: flex; align-items: center; justify-content: space-between; height: 56px; }
.app-logo { font-weight: 700; font-size: 1.1rem; }
.app-nav { display: flex; gap: 0.5rem; }
.app-main { max-width: 900px; width: 100%; margin: 0 auto; padding: 2rem 1.5rem; flex: 1; }

/* Nav links */
.nav-link { background: none; border: none; cursor: pointer; padding: 0.4rem 0.75rem; border-radius: 6px; color: var(--color-text-muted); font-size: 0.9rem; }
.nav-link--active { background: var(--color-accent-subtle); color: var(--color-accent); font-weight: 600; }

/* Form */
.meeting-input__title { font-size: 1.5rem; margin-bottom: 0.25rem; }
.meeting-input__subtitle { color: var(--color-text-muted); margin-bottom: 1.5rem; }
.meeting-input__form { display: flex; flex-direction: column; gap: 1rem; }
.form-field { display: flex; flex-direction: column; gap: 0.4rem; }
.form-field label { font-size: 0.875rem; font-weight: 500; }
.form-field input, .form-field textarea { padding: 0.6rem 0.75rem; border: 1px solid var(--color-border); border-radius: 8px; font-family: inherit; font-size: 0.95rem; background: var(--color-surface); resize: vertical; }

/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.25rem; border-radius: 8px; border: none; cursor: pointer; font-size: 0.95rem; font-weight: 500; }
.btn--primary { background: var(--color-accent); color: white; }
.btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-icon { background: none; border: none; cursor: pointer; padding: 0.3rem; border-radius: 4px; color: var(--color-text-muted); display: inline-flex; align-items: center; }
.btn-icon--danger:hover { color: var(--color-error); }
.btn-icon--confirm { color: var(--color-success); }

/* Error */
.error-message { color: var(--color-error); font-size: 0.875rem; }

/* Dashboard */
.dashboard__header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.badge { background: var(--color-accent-subtle); color: var(--color-accent); padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; }
.dashboard--empty { text-align: center; padding: 4rem 0; }
.dashboard__empty-filter { color: var(--color-text-muted); }

/* Filters */
.dashboard-filters { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
.dashboard-filters select { padding: 0.4rem 0.75rem; border: 1px solid var(--color-border); border-radius: 6px; background: var(--color-surface); font-size: 0.875rem; cursor: pointer; }

/* Action item row */
.action-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 0.5rem; background: var(--color-surface); }
.action-item--done { opacity: 0.5; }
.action-item--done .action-item__description { text-decoration: line-through; }
.action-item__description { flex: 1; font-size: 0.95rem; }
.action-item__responsible { font-size: 0.85rem; color: var(--color-text-muted); white-space: nowrap; }
.action-item__status { padding: 0.25rem 0.5rem; border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.8rem; background: var(--color-surface); cursor: pointer; }
.action-item__due { font-size: 0.8rem; color: var(--color-text-muted); white-space: nowrap; }
.action-item--editing { flex-wrap: wrap; gap: 0.5rem; }
.action-item__input { padding: 0.3rem 0.5rem; border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.875rem; }

/* Priority dot */
.priority-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.priority--high { background: var(--color-error); }
.priority--medium { background: var(--color-warning); }
.priority--low { background: var(--color-success); }

/* Spinner */
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
```

**Step 2: Update CSS variables in `src/index.css`**

Ensure these CSS variables exist:
```css
:root {
  --color-surface: #ffffff;
  --color-border: #e5e7eb;
  --color-text-muted: #6b7280;
  --color-accent: #4f46e5;
  --color-accent-subtle: #eef2ff;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-success: #10b981;
}
```

**Step 3: Check the app visually**

```bash
npm run dev
```
Walk through the app and verify layout looks clean and responsive.

**Step 4: Final build check**

```bash
npm run build
npm run lint
```
Expected: no errors, no warnings.

**Step 5: Commit**

```bash
git add src/App.css src/index.css
git commit -m "style: add component styles for meeting notes tracker"
```

---

## Final verification

```bash
npm test        # all storage tests pass
npm run build   # clean TypeScript + Vite build
npm run lint    # no ESLint errors
```

Then do a full manual end-to-end test using the sample meeting text from Task 9.

---

## Out of scope

- File upload
- Manual mode (no AI)
- Review step before saving
- Authentication
- Backend / database
- Meeting-grouped dashboard view
