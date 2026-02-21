// src/components/MeetingInput.tsx
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { processMeetingNotes } from '../services/ai'
import { saveMeeting } from '../utils/storage'
import type { AISuccessResponse, Meeting } from '../types'

interface Props {
  onSuccess: () => void
}

export default function MeetingInput({ onSuccess }: Props) {
  const [text, setText] = useState('')
  const [submitter, setSubmitter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    setError(null)

    try {
      const result = await processMeetingNotes(text)

      if (!result.success) {
        setError(result.error.message)
        return
      }

      const aiResult = result as AISuccessResponse
      const meetingId = crypto.randomUUID()
      const meeting: Meeting = {
        id: meetingId,
        title: aiResult.meeting.title,
        submitter: submitter.trim() || 'Unknown',
        createdAt: new Date().toISOString(),
        summary: aiResult.meeting.summary,
        actionItems: aiResult.actionItems.map((item) => ({
          id: crypto.randomUUID(),
          meetingId,
          meetingTitle: aiResult.meeting.title,
          description: item.description,
          responsible: item.responsible ?? 'Unassigned',
          priority: item.priority,
          status: 'Pending' as const,
          dueDate: item.dueDate,
        })),
      }

      saveMeeting(meeting)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="meeting-input">
      <h1 className="meeting-input__title">New Meeting</h1>
      <p className="meeting-input__subtitle">
        Paste your meeting notes and AI will extract action items automatically.
      </p>

      <form onSubmit={handleSubmit} className="meeting-input__form">
        <div className="form-field">
          <label htmlFor="submitter">Your name</label>
          <input
            id="submitter"
            type="text"
            value={submitter}
            onChange={(e) => setSubmitter(e.target.value)}
            placeholder="e.g. Ana"
          />
        </div>

        <div className="form-field">
          <label htmlFor="notes">Meeting notes *</label>
          <textarea
            id="notes"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your meeting notes here..."
            rows={10}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="btn btn--primary"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="spin" />
              Processing...
            </>
          ) : (
            'Process Meeting'
          )}
        </button>
      </form>
    </div>
  )
}
