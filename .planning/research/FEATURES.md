# Feature Research

**Domain:** AI Meeting Notes & Action Tracker
**Researched:** 2026-02-20
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Text input for meeting notes | Core interaction — without this nothing works | LOW | Textarea with paste support |
| AI-generated structured summary | Core value — users come specifically for this | MEDIUM | GPT-4o prompt, display result |
| Automatic action item extraction | Core value — eliminates manual work | MEDIUM | Part of same AI call as summary |
| Assignee per action item | Accountability requires knowing who owns it | LOW | Text field, no user management needed for MVP |
| Priority per action item | Users need to triage tasks after extraction | LOW | Low/Medium/High or P1/P2/P3 |
| Status tracking (todo/in-progress/done) | Without this it's a notepad, not a tracker | LOW | Dropdown or toggle |
| Edit action items manually | AI is imperfect — manual correction is essential | LOW | Inline edit UX |
| Delete action items | Noise removal is critical for usability | LOW | Confirm before delete |
| Dashboard list view | See all action items across meetings | MEDIUM | Filter + sort |
| Filter by status | See "what's in progress" without scanning all items | LOW | Simple filter UI |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Filter by assignee | "Show me only my tasks" — high daily utility | LOW | Already scoped to v1 |
| Meeting history | Review past meetings and their items | MEDIUM | List of processed meetings |
| Due date extraction from text | "by Friday" auto-converts to date | HIGH | NLP parsing, defer to v2 |
| Export to markdown/clipboard | Easy to paste into Linear, Notion, Slack | LOW | Good quick win for v1.x |
| Bulk status update | Mark all items as done at end of sprint | LOW | Checkbox multi-select |
| AI confidence indicators | Show which items AI was uncertain about | HIGH | Requires prompt engineering |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time collaboration | Multiple people editing same meeting | Needs auth, conflict resolution, websockets — kills MVP scope | Single user MVP, share exported markdown |
| Audio/video transcription | "We don't always have text" | Completely different problem (transcription), doubles scope | Accept text input only; user pastes from Otter/transcription tool |
| Linear/Slack integration | Automatic sync sounds powerful | Auth flows, webhook management, rate limits — high complexity for uncertain value | Manual export; build integration only after core is validated |
| User authentication | "What if others use it?" | Auth is a project in itself; internal tool doesn't need it | Skip for MVP; single-user assumption |
| AI-suggested priorities | "Let AI decide priority" | Creates overconfidence in AI judgment; users stop thinking | Let AI suggest, but require human confirmation |

## Feature Dependencies

```
[Text Input]
    └──enables──> [AI Processing]
                      ├──produces──> [Meeting Summary]
                      └──produces──> [Action Items List]
                                          ├──enables──> [Edit Action Item]
                                          ├──enables──> [Delete Action Item]
                                          ├──enables──> [Update Status]
                                          └──enables──> [Dashboard View]
                                                              └──enables──> [Filter by Status]
                                                              └──enables──> [Filter by Assignee]
```

### Dependency Notes

- **AI Processing requires Text Input:** No input = nothing to process
- **Action Items requires AI Processing:** The list is produced by AI extraction
- **All editing features require Action Items:** Can't edit what doesn't exist
- **Dashboard requires persistence:** If items aren't saved, dashboard shows nothing after page refresh

## MVP Definition

### Launch With (v1)

- [ ] Text input / paste area — core interaction
- [ ] AI summary generation (GPT-4o) — core value
- [ ] Action item extraction (assignee, priority, status) — core value
- [ ] Inline edit for all action item fields — AI is imperfect, correction is essential
- [ ] Delete action items — noise control
- [ ] Status update (todo / in-progress / done) — the "tracker" part of the name
- [ ] Dashboard with all action items — overview
- [ ] Filter by assignee — "show me my tasks"
- [ ] Filter by status — "what's open"
- [ ] Local persistence — items survive page refresh

### Add After Validation (v1.x)

- [ ] Meeting history list — triggers when users ask "where's my meeting from last week?"
- [ ] Export to markdown — triggers when users want to share results
- [ ] Due date field on action items — triggers when users complain about missing dates

### Future Consideration (v2+)

- [ ] Due date extraction from text — complex NLP, uncertain value until v1 validated
- [ ] Linear export integration — only after users validate they want it
- [ ] Email summaries — only if multiple stakeholders need updates

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Text input + AI processing | HIGH | MEDIUM | P1 |
| Action item extraction | HIGH | MEDIUM | P1 |
| Inline edit | HIGH | LOW | P1 |
| Status tracking | HIGH | LOW | P1 |
| Dashboard | HIGH | MEDIUM | P1 |
| Filters (status + assignee) | MEDIUM | LOW | P1 |
| Local persistence | HIGH | MEDIUM | P1 |
| Meeting history | MEDIUM | MEDIUM | P2 |
| Export to markdown | MEDIUM | LOW | P2 |
| Due date field | LOW | LOW | P2 |
| Audio transcription | MEDIUM | HIGH | P3 |
| Integrations | MEDIUM | HIGH | P3 |

## Competitor Feature Analysis

| Feature | Otter.ai | Fireflies.ai | Our Approach |
|---------|----------|--------------|--------------|
| Input method | Audio recording | Meeting bot (joins call) | Text paste — simpler, no permissions needed |
| Action item extraction | AI-generated | AI-generated | AI-generated (GPT-4o) |
| Assignee detection | Manual | Auto from speakers | Auto from text context |
| Task management | Basic | Basic | Custom editable dashboard |
| Persistence | Cloud | Cloud | Local (MVP), cloud later |
| Price | Freemium | Freemium | Internal free tool |

## Sources

- Otter.ai, Fireflies.ai feature sets (public product pages)
- Linear issue tracker UX patterns (status, assignee, priority)
- Internal project description (Linear project)

---
*Feature research for: AI Meeting Notes & Action Tracker*
*Researched: 2026-02-20*
