# Research: AI Meeting Notes & Action Tracker

**Phase**: 0 | **Feature**: `001-meeting-notes-tracker` | **Date**: 2026-02-20

## Summary of Unknowns Resolved

All NEEDS CLARIFICATION items from Technical Context are resolved below.

---

## Decision 1: OpenAI API Integration Pattern

**Question**: How to call the OpenAI Chat Completions API from a browser-based Vite app without a backend?

**Decision**: Use Vite dev server proxy (`server.proxy` in `vite.config.ts`)

**Rationale**:
- The OpenAI API (`api.openai.com`) blocks direct browser-to-API calls via CORS restrictions
- The Vite dev server (Node.js process) can proxy requests and inject auth headers server-side
- The `OPENAI_API_KEY` stays in the Node.js environment — never embedded in the browser bundle
- Zero new npm dependencies — only `vite.config.ts` changes

**Configuration**:
```ts
// vite.config.ts
server: {
  proxy: {
    '/api/openai': {
      target: 'https://api.openai.com',
      changeOrigin: true,
      rewrite: () => '/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
      },
    },
  },
},
```

**Browser fetch call**:
```ts
const response = await fetch('/api/openai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  }),
});
```

**Alternatives Considered**:
- Direct browser fetch to `api.openai.com` → REJECTED: blocked by CORS
- CORS proxy service → REJECTED: third-party intermediary, security risk
- Express backend → REJECTED: violates simplicity principle and "no backend" constraint

**Limitation**: Vite proxy only works with `npm run dev`. Production builds require a real server or edge function. For the workshop demo scope, dev mode is sufficient.

---

## Decision 2: OpenAI Model Selection

**Question**: Which OpenAI model to use for structured meeting extraction?

**Decision**: `gpt-4o-mini`

**Rationale**:
- Fastest response time in the GPT-4 family — critical for SC-001 (<30 seconds)
- Sufficient reasoning capability for text extraction and summarization tasks
- Lowest cost per token, minimizing workshop API spend
- Full support for `response_format: { type: 'json_object' }` — guaranteed valid JSON output

**Alternatives Considered**:
- `gpt-4o` → REJECTED: ~3–5× slower and more expensive; quality advantage not needed for extraction
- `gpt-4-turbo` → REJECTED: older, higher cost, no JSON mode advantage over gpt-4o-mini
- `gpt-3.5-turbo` → REJECTED: weaker instruction following; may produce inconsistent structured output

---

## Decision 3: JSON Output Reliability

**Question**: How to reliably get structured JSON from the OpenAI API?

**Decision**: Native `response_format: { type: 'json_object' }` + `temperature: 0`

**Rationale**:
- OpenAI's Chat Completions API supports `response_format` in the raw REST API (no SDK needed)
- When `response_format: { type: 'json_object' }` is set, the model is **guaranteed** to return valid JSON
- Combined with `temperature: 0`, output is deterministic and parseable without defensive `try/catch` on `JSON.parse`
- This is a significant advantage over Anthropic's API, which requires prompt engineering alone for JSON output via raw fetch

**Implementation note**: When using JSON mode, the system prompt MUST mention JSON explicitly (e.g., "Respond with a JSON object matching this schema") — OpenAI will return an error otherwise.

---

## Decision 4: Data Persistence

**Question**: What storage mechanism to use for meetings and action items?

**Decision**: Browser `localStorage`

**Rationale**:
- Spec assumption: "Data is stored locally or in a shared internal storage — no specific infrastructure is prescribed"
- No backend exists; localStorage works with no dependencies
- Sufficient for a workshop demo with small data volumes

**localStorage Schema**:
```
Key: "meetings"
Value: JSON string of Meeting[]
```

**Alternatives Considered**:
- IndexedDB → REJECTED: overkill for this data volume, no advantages for MVP
- Server-side DB → REJECTED: requires backend infrastructure not in scope

---

## Decision 5: App Navigation

**Question**: How to navigate between views (input, review, dashboard) without a router?

**Decision**: Conditional rendering with a `view` state in `App.tsx`

**Rationale**:
- Three views total — adding `react-router-dom` for three views violates the simplicity principle
- A `useState<'input' | 'review' | 'dashboard'>` in App.tsx is sufficient
- No browser back/forward navigation needed (internal tool)

**Flow**:
```
'input' → (submit + AI processing) → 'review' → (save) → 'dashboard'
                                              ↑
                                       (always accessible via nav)
```

---

## Decision 6: Unique ID Generation

**Question**: How to generate unique IDs for meetings and action items?

**Decision**: `crypto.randomUUID()` (native browser API)

**Rationale**: No additional dependency; cryptographically secure UUID v4; available in all modern browsers.

---

## Open Items / Non-Decisions

- **Figma design specifics**: The exact Untitled UI Figma layout will be referenced during implementation (node-id=1639-343791). Components will reference this in code comments per the constitution.
- **Long transcript handling** (edge case from spec): No truncation implemented for MVP. Very long transcripts may approach `gpt-4o-mini`'s 128k context limit (unlikely in practice).
