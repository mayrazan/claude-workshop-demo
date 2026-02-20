# Quickstart: AI Meeting Notes & Action Tracker

**Feature**: `001-meeting-notes-tracker` | **Date**: 2026-02-20

## Prerequisites

- Node.js 18+ installed
- An OpenAI API key (get one at platform.openai.com)
- The repository cloned and on branch `001-meeting-notes-tracker`

## Setup

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Create the API key file**:
   ```bash
   # .env (already in .gitignore — never commit this)
   echo "OPENAI_API_KEY=sk-your-key-here" > .env
   ```
   > Note: No `VITE_` prefix. The key is read by the Vite dev proxy (Node.js process) and never sent to the browser.

3. **Start the dev server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**: `http://localhost:5173`

## App Flow

```
[Paste Transcript] → [AI Processing] → [Review & Edit] → [Dashboard]
```

1. **Input view**: Paste any meeting transcript or notes, enter your name, click Submit
2. **Review view**: See AI-generated title, summary, and action items. Edit anything, then Save
3. **Dashboard view**: See all action items across all saved meetings, filter by person or status

## Development Commands

```bash
npm run dev      # Start dev server (required for AI calls — Vite proxy handles CORS)
npm run build    # Type-check + production build (run before PR)
npm run lint     # ESLint check (must pass before PR)
npm run preview  # Preview production build (AI calls will NOT work — no proxy)
```

## Key Files for This Feature

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All TypeScript interfaces (Meeting, ActionItem, AIResponse) |
| `src/services/ai.ts` | OpenAI Chat Completions integration (see `contracts/ai-service.md`) |
| `src/utils/storage.ts` | localStorage read/write helpers |
| `src/App.tsx` | View state machine (input → review → dashboard) |
| `src/components/` | All UI components (one file per component) |
| `vite.config.ts` | Vite proxy config for `/api/openai` |
| `.env` | `OPENAI_API_KEY` (not committed) |

## Architecture Notes

- **No backend**: The Vite dev server proxies `/api/openai` → `api.openai.com/v1/chat/completions`. The proxy injects the `Authorization: Bearer` header so it never reaches the browser.
- **JSON mode**: The AI service uses `response_format: { type: 'json_object' }` for guaranteed parseable output.
- **No router**: Three views rendered conditionally in `App.tsx` via a `view` state.
- **No new dependencies**: All functionality built with React 19, TypeScript, Vite, and native browser APIs (`fetch`, `localStorage`, `crypto.randomUUID()`).
- **Data persistence**: Meetings and action items stored in `localStorage["meetings"]` as a JSON array.

## Figma Design Reference

All components are implemented against the Untitled UI design system, Figma node `1639-343791`. Each component file includes:
```ts
// Figma node-id: 1639-343791
```

## Known Limitations (MVP)

- AI calls only work with `npm run dev` (Vite proxy). Production builds need a real server/edge function.
- localStorage is browser-local; "shared team workspace" means sharing the same browser/device.
- Very long transcripts approach `gpt-4o-mini`'s 128k context limit — no truncation implemented.
- No offline support beyond localStorage read; AI processing requires network.
