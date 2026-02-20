import 'dotenv/config'
import express from 'express'
import { meetingsRouter } from './routes/meetings.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(express.json({ limit: '1mb' }))

app.use('/api/meetings', meetingsRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
