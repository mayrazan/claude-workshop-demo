import 'dotenv/config'
import express from 'express'
import { Router } from 'express'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(express.json({ limit: '1mb' }))

// Placeholder router — replaced by Plan 02
const meetingsRouter = Router()
meetingsRouter.post('/process', (_req, res) => {
  res.status(501).json({ error: 'Not yet implemented' })
})

app.use('/api/meetings', meetingsRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
