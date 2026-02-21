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
