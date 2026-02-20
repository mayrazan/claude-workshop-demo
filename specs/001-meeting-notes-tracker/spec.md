# Feature Specification: AI Meeting Notes & Action Tracker

**Feature Branch**: `001-meeting-notes-tracker`
**Created**: 2026-02-20
**Status**: Draft
**Input**: User description: "Internal system to transform meeting transcriptions into structured summaries, action items, responsible parties, priorities, and tracking status with dashboard visualization"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Summary and Action Items from Meeting Text (Priority: P1)

A team member pastes the raw text from a meeting (notes or transcript) into the system and receives a structured summary plus an automatically generated list of action items. Each action item includes a description, a suggested responsible person (extracted from context), and a suggested priority level. The user reviews the output and can adjust before saving.

**Why this priority**: This is the core value proposition of the entire feature. Without automated extraction, there is no productivity gain. Every other user story depends on this working well.

**Independent Test**: Can be fully tested by pasting a sample meeting transcript and verifying that a structured summary and at least one action item are returned — delivers core documentation value without requiring dashboard or status management.

**Acceptance Scenarios**:

1. **Given** a user has a meeting transcript, **When** they paste it into the input field and submit, **Then** the system displays a structured summary with key discussion points, an auto-suggested meeting title, and a list of identified action items within 30 seconds.
1a. **Given** the system has generated results, **When** the user reviews the auto-suggested title, **Then** they can accept it as-is or edit it before saving the meeting.
2. **Given** the system processes a transcript, **When** action items are extracted, **Then** each item displays a description, a suggested responsible person (if mentioned in the text), and a suggested priority level.
3. **Given** a user submits an empty or very short text (under 20 words), **When** the system processes it, **Then** a clear message is shown indicating that insufficient content was provided to generate meaningful output.
4. **Given** a transcript with no identifiable action items, **When** processed, **Then** the system displays the summary and shows an empty action items list with a message indicating none were found, without failing.

---

### User Story 2 - Edit and Manage Action Items (Priority: P2)

After the system generates action items, the user reviews and refines them. They can edit descriptions, reassign responsible persons, change priority levels, update status, add new action items manually, and delete items that are incorrect or irrelevant.

**Why this priority**: AI extraction is imperfect. Human curation is required to ensure accuracy and accountability. This story closes the loop between automated output and reliable team commitments.

**Independent Test**: Can be tested by manually creating a meeting entry with action items and verifying that all CRUD operations (create, read, update, delete) work as expected — delivers accountability value independently of the AI extraction quality.

**Acceptance Scenarios**:

1. **Given** a list of action items has been generated, **When** a user clicks to edit an item, **Then** they can modify the description, responsible person, priority, status, and due date, and the changes are saved immediately.
2. **Given** a list of action items, **When** a user deletes an item, **Then** the item is removed from the list and a confirmation is shown.
3. **Given** a list of action items, **When** a user changes the status of an item (e.g., from "Pending" to "In Progress"), **Then** the status is updated and reflected immediately in the view.
4. **Given** an existing meeting, **When** a user manually adds a new action item, **Then** the item is appended to the list with all required fields available for input.

---

### User Story 3 - Dashboard with Filtering (Priority: P3)

A team member opens the dashboard to see all action items across all meetings. They can filter the list by responsible person or by status to focus on what's relevant. This provides a consolidated view for accountability tracking and follow-up.

**Why this priority**: The dashboard aggregates value from individual meetings, enabling ongoing accountability. However, it only delivers value once multiple meetings and action items exist, making it a secondary priority to the generation and editing flows.

**Independent Test**: Can be tested by creating multiple meetings with action items assigned to different people and in different statuses, then verifying that filters correctly narrow the displayed list — delivers team visibility value as a standalone view.

**Acceptance Scenarios**:

1. **Given** multiple meetings have been processed and saved, **When** a user opens the dashboard, **Then** all action items from all meetings are displayed in a flat list showing description, responsible person, priority, status, due date (if set), and parent meeting title.
2. **Given** the dashboard is displayed, **When** a user filters by a specific responsible person, **Then** only action items assigned to that person are shown.
3. **Given** the dashboard is displayed, **When** a user filters by status (e.g., "Done"), **Then** only items with that status are shown.
4. **Given** the dashboard is displayed on a mobile device, **When** the user navigates and applies filters, **Then** all content is legible and interactive elements are usable without horizontal scrolling.

---

### Edge Cases

- What happens when the input text is extremely long (e.g., a 4-hour meeting transcript)?
- If AI processing fails after multiple retries, the user's pasted text is preserved so they do not lose their input.
- How does the system handle meeting text written in languages other than the configured default?
- What if a user tries to delete all action items from a meeting — should the meeting record be preserved?
- What happens when two action items appear identical after extraction?
- How does the dashboard behave when there are zero meetings saved?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept meeting text via a multi-line text input field (paste or type).
- **FR-002**: System MUST automatically generate a structured summary of the meeting upon submission.
- **FR-003**: System MUST automatically identify and extract action items from the submitted meeting text.
- **FR-004**: System MUST suggest a responsible person for each extracted action item when a name is identifiable in the text.
- **FR-005**: System MUST suggest a priority level (High, Medium, Low) for each extracted action item.
- **FR-006**: System MUST allow users to edit the description of any action item.
- **FR-007**: System MUST allow users to assign or change the responsible person for any action item (free-text input).
- **FR-008**: System MUST allow users to change the priority level of any action item.
- **FR-009**: System MUST allow users to update the status of any action item (Pending, In Progress, Done).
- **FR-010**: System MUST allow users to delete any action item.
- **FR-011**: System MUST allow users to manually add new action items to any meeting.
- **FR-012**: System MUST persist all meetings and their associated action items across sessions.
- **FR-013**: System MUST provide a dashboard view displaying all action items across all saved meetings.
- **FR-014**: System MUST allow filtering the dashboard by responsible person.
- **FR-015**: System MUST allow filtering the dashboard by status.
- **FR-016**: System MUST display correctly on both desktop and mobile screen sizes.
- **FR-017**: System MUST provide clear feedback when text is insufficient for extraction (under 20 words).
- **FR-018**: System MUST auto-suggest a meeting title extracted from the meeting content after processing; the user MUST be able to accept or edit this title before the meeting is saved.
- **FR-019**: When AI processing fails, the system MUST display a clear error message and provide a retry action; the meeting MUST NOT be saved until AI processing completes successfully.
- **FR-020**: System MUST display all meetings and action items to all users without access restrictions (fully shared team workspace).
- **FR-021**: When submitting a meeting, the system MUST prompt the user to enter their name (free-text) as the submitter, for attribution purposes.
- **FR-022**: System MUST allow users to set an optional due date on any action item; the due date field MUST be clearable (not required).
- **FR-023**: The dashboard MUST display the parent meeting's title alongside each action item as context; no meeting detail view or navigation to source text is provided.

### Key Entities

- **Meeting**: Represents a single meeting session. Contains title (auto-suggested from content, user-editable), submitter name (free-text, for attribution), submission date, and a list of associated action items. The source text and AI-generated summary are used during processing only and are not accessible after the meeting is saved. All meetings are shared across the team workspace.
- **Action Item**: Represents a task extracted from or added to a meeting. Contains description, responsible person (free-text), priority level (High/Medium/Low), status (Pending/In Progress/Done), optional due date, and the parent meeting's title (displayed as context — no navigation to meeting detail).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users go from pasting meeting text to having a complete structured summary and action item list in under 30 seconds.
- **SC-002**: At least 80% of clearly stated action items in a meeting transcript are automatically identified without manual addition.
- **SC-003**: Users can update an action item's status from the dashboard in 3 clicks or fewer.
- **SC-004**: Team members report spending at least 60% less time on post-meeting documentation compared to their previous process.
- **SC-005**: Dashboard loads and displays all action items with filters applied in under 2 seconds regardless of the number of saved meetings.
- **SC-006**: 100% of UI interactions are accessible and functional on screens as small as 375px wide.

## Assumptions

- The system is an internal tool accessible without individual user authentication for the MVP (no login required).
- All saved meetings and action items are visible to all team members — the workspace is fully shared with no per-user isolation.
- The submitter of a meeting is identified by a free-text name field (not linked to authenticated accounts); this is used for display/attribution only, not access control.
- Responsible persons are entered as free text — not linked to system user accounts. Future integration with user directories is out of scope for this specification.
- Priority levels are a fixed set: High, Medium, Low.
- Action item statuses are a fixed set: Pending, In Progress, Done.
- The system supports text input only (plain text paste). File upload (PDF, DOCX, audio transcription) is out of scope for this MVP.
- Meeting text language is assumed to be Portuguese or English; multi-language support beyond this is not guaranteed.
- Data is stored locally or in a shared internal storage — no specific infrastructure is prescribed by this spec.
- The AI processing is triggered on user submission (not real-time as the user types).
- The AI provider for meeting processing is OpenAI; the system calls the OpenAI Chat Completions API using an `OPENAI_API_KEY` environment variable.
- There is no meeting detail view — after a meeting is saved, only its action items are accessible. The original source text and AI-generated summary are not stored or retrievable post-save.

## Clarifications

### Session 2026-02-20

- Q: How is each meeting identified/named for the dashboard and history list? → A: System auto-suggests a title extracted from the meeting content after processing; the user can accept or edit it before saving.
- Q: When AI processing fails, what is the fallback behavior? → A: Show error message with a retry action only; the meeting is not saved until AI processing succeeds.
- Q: Are saved meetings visible to all team members or only the submitter? → A: Fully shared workspace — all meetings and action items are visible to all team members; submitter is tracked as a free-text attribution field only.
- Q: Should action items have a due date field? → A: Yes, optional due date set manually by the user; field is clearable (not required).
- Q: Can users navigate from the dashboard to a meeting detail view (summary, source text)? → A: No — no meeting detail view exists; the dashboard is a flat list only; source text and summary are not stored or accessible after saving.
- Q: Which AI provider should be used for meeting processing? → A: OpenAI — team already has an OpenAI API key; use the OpenAI Chat Completions API with `OPENAI_API_KEY`.
