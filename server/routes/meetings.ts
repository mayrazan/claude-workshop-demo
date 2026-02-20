import { Router } from 'express'
import { z } from 'zod'
import { processMeetingText } from '../lib/openai.js'

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
