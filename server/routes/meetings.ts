import { Router } from 'express'
import { z } from 'zod'
import { processMeetingText } from '../lib/openai.js'
import { saveMeeting, getLatestMeeting, getItemsByMeeting } from '../lib/db.js'

export const meetingsRouter = Router()

const RequestSchema = z.object({
  text: z
    .string()
    .min(10, 'Meeting text must be at least 10 characters')
    .max(50000, 'Meeting text must be under 50,000 characters'),
})

meetingsRouter.post('/process', async (req, res) => {
  try {
    const { text } = RequestSchema.parse(req.body)
    const result = await processMeetingText(text)
    // Persist to SQLite -- synchronous, wrapped in transaction
    saveMeeting(result.title, result.action_items)
    res.json(result)
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: err.issues })
      return
    }
    console.error('Meeting processing error:', err)
    res.status(500).json({ error: 'Failed to process meeting' })
  }
})

meetingsRouter.get('/latest', (_req, res) => {
  const meeting = getLatestMeeting.get() as
    | { id: number; title: string; created_at: string }
    | undefined
  if (!meeting) {
    // Empty database -- frontend shows welcome/empty state
    res.json(null)
    return
  }
  const items = getItemsByMeeting.all(meeting.id)
  res.json({ meeting, action_items: items })
})
