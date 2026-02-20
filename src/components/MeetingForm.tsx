import { useState, useEffect } from 'react'
import type { DisplayResult, LatestMeetingResponse, MeetingResponse } from '../types/meeting'
import { MeetingResults } from './MeetingResults'

export function MeetingForm() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<DisplayResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hydrate from last session on mount
  useEffect(() => {
    fetch('/api/meetings/latest')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: LatestMeetingResponse | null) => {
        if (data) {
          setResult({
            title: data.meeting.title,
            // summary is not stored — omitted from hydrated state
            action_items: data.action_items.map((item) => ({
              id: item.id,
              description: item.description,
              assignee: item.assignee,
              priority: item.priority,
              status: item.status,
            })),
          })
        }
      })
      .catch(() => {
        // Silent fail — empty state is acceptable if the server is not running
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/meetings/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Server error: ${res.status}`)
      }
      const data: MeetingResponse = await res.json()
      // Fresh process result — include title and summary
      setResult({
        title: data.title,
        summary: data.summary,
        action_items: data.action_items,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="meeting-form-container">
      <form onSubmit={handleSubmit} className="meeting-form">
        <label htmlFor="meeting-text">Meeting Notes</label>
        <textarea
          id="meeting-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your meeting notes here..."
          rows={10}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !text.trim()}>
          {loading ? 'Processing...' : 'Process Meeting'}
        </button>
      </form>
      {error && <p role="alert" className="error-message">{error}</p>}
      {result && <MeetingResults data={result} />}
    </div>
  )
}
