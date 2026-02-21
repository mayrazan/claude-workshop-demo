# Data Model: AI Meeting Notes & Action Tracker

**Feature**: `001-meeting-notes-tracker` | **Date**: 2026-02-20

## Entities

### Meeting

Represents a single processed meeting session.

```ts
// src/types/index.ts
interface Meeting {
  id: string;          // crypto.randomUUID() — generated at save time
  title: string;       // Auto-suggested by AI, confirmed/edited by user before save (FR-018)
  submitter: string;   // Free-text name entered by user at submission time (FR-021)
  createdAt: string;   // ISO 8601 date string — set at save time
  actionItems: ActionItem[];
}
```

**Validation rules**:
- `title`: non-empty string (enforced in UI before save)
- `submitter`: non-empty string (enforced in UI before submit)
- `actionItems`: may be empty array (valid per spec: meetings with no action items are saved normally)

**Lifecycle**:
1. User pastes transcript + enters submitter name → `MeetingInput` view
2. AI processing generates `title`, `summary`, `discussionPoints`, `actionItems` (suggested values)
3. User reviews/edits in `MeetingReview` — title is confirmed or overridden
4. On save: `Meeting` record is created and appended to localStorage
5. Source text and AI-generated summary are **not stored** post-save (per spec assumption)

---

### ActionItem

Represents a task associated with a meeting. Stored nested inside `Meeting.actionItems`.

```ts
interface ActionItem {
  id: string;                          // crypto.randomUUID() — generated at review time
  meetingId: string;                   // Parent meeting ID (set at review time, before save)
  meetingTitle: string;                // Denormalized from parent — for dashboard display (FR-023)
  description: string;                 // Task description — editable (FR-006)
  responsible: string;                 // Free-text person name — editable (FR-007); empty string if unassigned
  priority: 'High' | 'Medium' | 'Low'; // Editable (FR-008)
  status: 'Pending' | 'In Progress' | 'Done'; // Editable (FR-009)
  dueDate: string | null;              // ISO 8601 date string or null — optional, clearable (FR-022)
}
```

**Validation rules**:
- `description`: non-empty string (enforced before saving to localStorage)
- `responsible`: any string including empty (empty = "Unassigned")
- `dueDate`: valid ISO date string if set, `null` if not set
- `priority`: must be one of the three enum values
- `status`: must be one of the three enum values

**State transitions**:
```
status: Pending → In Progress → Done
                ↑               |
                └───────────────┘ (any direction, user-controlled)
```

---

## AI Processing Types

Ephemeral types used during AI processing — **not stored** in localStorage.

```ts
// Successful AI extraction
interface AISuccessResponse {
  success: true;
  meeting: {
    title: string;           // Suggested title — user may edit
    summary: string;         // Narrative summary — displayed during review, not saved
    discussionPoints: string[]; // Bullet points — displayed during review, not saved
  };
  actionItems: Array<{
    description: string;
    responsible: string | null; // null if no person identifiable
    priority: 'High' | 'Medium' | 'Low';
  }>;
}

// Error response (insufficient input or API failure)
interface AIErrorResponse {
  success: false;
  error: {
    code: 'INSUFFICIENT_INPUT' | 'PROCESSING_ERROR';
    message: string;
  };
}

type AIResponse = AISuccessResponse | AIErrorResponse;
```

---

## localStorage Schema

```
Storage key: "meetings"
Storage value: JSON.stringify(Meeting[])
```

**Operations**:
| Operation | Description | Used by |
|-----------|-------------|---------|
| `loadMeetings()` | Read + parse from localStorage; return `[]` if missing/invalid | Dashboard, App init |
| `saveMeetings(meetings)` | JSON.stringify + write to localStorage | After any mutation |
| `addMeeting(meeting)` | Append to array + persist | MeetingReview save |
| `updateActionItem(meetingId, updated)` | Find + replace item + persist | ActionItemCard edit |
| `deleteActionItem(meetingId, itemId)` | Filter out item + persist | ActionItemCard delete |
| `addActionItem(meetingId, item)` | Append item to meeting + persist | ActionItemList add |

---

## Relationships

```
Meeting (1) ──── (N) ActionItem
```

- `ActionItem.meetingId` references `Meeting.id`
- `ActionItem.meetingTitle` is denormalized from `Meeting.title` at creation time
- If a meeting's title is never editable post-save (per spec: no meeting detail view), denormalization is safe
- No cascade delete needed: deleting action items does not delete the meeting; meetings are never deleted in MVP

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Empty `actionItems` array | Meeting saved normally; dashboard shows no items for that meeting |
| AI returns `responsible: null` | Stored as `responsible: ''` (empty string = "Unassigned" in UI) |
| User clears `dueDate` | Stored as `null` |
| localStorage unavailable/full | `saveMeetings()` catches `DOMException` and surfaces an error message |
| Malformed JSON in localStorage | `loadMeetings()` catches `SyntaxError` and returns `[]` with a console warning |
