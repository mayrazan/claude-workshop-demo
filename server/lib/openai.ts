import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const ActionItemSchema = z.object({
  description: z.string(),
  assignee: z.string().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high']),
})

export const MeetingResponseSchema = z.object({
  title: z.string(),
  summary: z.string(),
  action_items: z.array(ActionItemSchema),
})

export type MeetingResponse = z.infer<typeof MeetingResponseSchema>

export async function processMeetingText(text: string): Promise<MeetingResponse> {
  const completion = await openai.chat.completions.parse({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are a meeting assistant. Generate a short meeting title (5-10 words) capturing the main topic. Extract a concise summary (2-4 sentences) and all action items from the meeting notes. For each action item, identify the person responsible (assignee) if mentioned, and assign a priority level (low/medium/high) based on urgency cues in the text. If no assignee is mentioned, omit the field. If priority is unclear, default to medium.',
      },
      { role: 'user', content: text },
    ],
    response_format: zodResponseFormat(MeetingResponseSchema, 'meeting_response'),
  })

  const message = completion.choices[0]?.message
  if (!message?.parsed) {
    throw new Error('OpenAI returned no parsed response')
  }
  return message.parsed
}
