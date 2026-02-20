// src/services/ai.ts

import type { AIResponse } from '../types';

const SYSTEM_PROMPT = `You are an expert meeting notes processor. Analyze raw meeting transcripts or notes and extract a meeting title, structured summary, and action items.

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
- discussionPoints: 2-4 bullets covering main themes and decisions`;

async function callOpenAI(text: string): Promise<Response> {
  return fetch('/api/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Process this meeting text and return a JSON object:\n\n${text}` },
      ],
    }),
  });
}

export async function processMeeting(text: string): Promise<AIResponse> {
  let response: Response;
  try {
    response = await callOpenAI(text);
    if (!response.ok) {
      // Retry once on HTTP error
      await new Promise((r) => setTimeout(r, 1000));
      response = await callOpenAI(text);
      if (!response.ok) {
        return {
          success: false,
          error: { code: 'PROCESSING_ERROR', message: 'API request failed. Please try again.' },
        };
      }
    }
  } catch {
    // Network failure — retry once
    try {
      await new Promise((r) => setTimeout(r, 1000));
      response = await callOpenAI(text);
      if (!response.ok) {
        return {
          success: false,
          error: { code: 'PROCESSING_ERROR', message: 'Network error. Please try again.' },
        };
      }
    } catch {
      return {
        success: false,
        error: { code: 'PROCESSING_ERROR', message: 'Network error. Please try again.' },
      };
    }
  }

  try {
    const envelope = await response.json() as { choices: Array<{ message: { content: string } }> };
    const content = envelope.choices[0].message.content;
    return JSON.parse(content) as AIResponse;
  } catch {
    return {
      success: false,
      error: { code: 'PROCESSING_ERROR', message: 'Failed to parse AI response. Please try again.' },
    };
  }
}
