# Contract: AI Service (`src/services/ai.ts`)

**Feature**: `001-meeting-notes-tracker` | **Date**: 2026-02-20

## Overview

The AI service is the single integration point with the OpenAI API. It accepts raw meeting text and returns a structured result. All OpenAI-specific concerns (prompt construction, API call, retry, response parsing) are encapsulated here.

---

## Transport

| Property | Value |
|----------|-------|
| Endpoint | `POST /api/openai` (Vite dev proxy → `https://api.openai.com/v1/chat/completions`) |
| Auth | `OPENAI_API_KEY` env var — injected by Vite proxy; never in browser bundle |
| Model | `gpt-4o-mini` |
| Max Tokens | `1024` |
| Temperature | `0` (deterministic output) |
| JSON Mode | `response_format: { type: 'json_object' }` — guaranteed valid JSON response |

### Vite Proxy Config

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

### Request Body (browser → proxy)

```json
{
  "model": "gpt-4o-mini",
  "max_tokens": 1024,
  "temperature": 0,
  "response_format": { "type": "json_object" },
  "messages": [
    { "role": "system", "content": "<system-prompt>" },
    { "role": "user", "content": "<user-prompt-with-meeting-text>" }
  ]
}
```

### Response (proxy → browser, OpenAI envelope)

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "<json-string>"
      }
    }
  ]
}
```

---

## Function Signature

```ts
// src/services/ai.ts
export async function processMeeting(text: string): Promise<AIResponse>;
```

**Parameters**:
- `text` — raw meeting transcript or notes (any length; <20 word validation is done via prompt)

**Returns**: `AIResponse` (see data-model.md)

**Throws**: Only throws if the network is unreachable after retry. Logical errors (insufficient input, parsing failure) are returned as `AIErrorResponse`, not thrown.

---

## System Prompt

```
You are an expert meeting notes processor. Analyze raw meeting transcripts or notes and extract a meeting title, structured summary, and action items.

IMPORTANT: You MUST respond with a valid JSON object. The response_format is set to json_object, so your entire response must be valid JSON with no extra text.

The JSON must match this exact schema:

For successful processing:
{
  "success": true,
  "meeting": {
    "title": "<concise title, 5-12 words, Title Case>",
    "summary": "<2-3 sentence narrative summary of key discussions and decisions>",
    "discussionPoints": ["<point 1>", "<point 2>"]
  },
  "actionItems": [
    {
      "description": "<specific, actionable task>",
      "responsible": "<first name only, or null if not identifiable>",
      "priority": "High"
    }
  ]
}

For insufficient input (fewer than 20 words):
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_INPUT",
    "message": "Texto insuficiente. Forneça pelo menos 20 palavras."
  }
}

RULES:
- Detect the input language (Portuguese or English) and respond in that language
- Priority values: "High" (urgent/blocking), "Medium" (standard), "Low" (deferred/nice-to-have)
- responsible: extract first name only (e.g. "Sarah" from "Sarah Chen"); use null if no person identifiable
- If no action items found, return "actionItems": [] — do NOT fail
- discussionPoints: 2-4 bullets covering main themes and decisions
```

---

## User Prompt Template

```
Process this meeting text and return a JSON object:

{MEETING_TEXT}
```

---

## Response Parsing

```ts
// Pseudocode for src/services/ai.ts
const raw = await fetch('/api/openai', { ... });
const envelope = await raw.json();              // OpenAI API envelope
const text = envelope.choices[0].message.content; // Model's JSON string
const result: AIResponse = JSON.parse(text);    // Parse (guaranteed valid by json_object mode)
```

**Error recovery**:
- Network failure → retry once after 1 second → return `AIErrorResponse` with `PROCESSING_ERROR`
- HTTP error (4xx/5xx from OpenAI) → return `AIErrorResponse` with `PROCESSING_ERROR`
- `JSON.parse` failure (should never happen with JSON mode) → return `AIErrorResponse` with `PROCESSING_ERROR`

---

## Caller Contract

`MeetingInput.tsx` is the only caller. It must:

1. Disable the submit button while `processMeeting` is in flight
2. Preserve the original text in component state regardless of outcome (FR-019 edge case)
3. On `success: false` with `INSUFFICIENT_INPUT`: display validation message, do not proceed to review
4. On `success: false` with `PROCESSING_ERROR`: display error with retry button; do not save meeting
5. On `success: true`: pass result to `MeetingReview` component via App state
