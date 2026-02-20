import { useState } from 'react'
import type { MeetingResponse } from '../types/meeting'
import { MeetingResults } from './MeetingResults'

export function MeetingForm() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<MeetingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setResult(data)
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
