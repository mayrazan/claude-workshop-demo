// Figma node-id: 1639-343791
import { useState } from 'react';
import type { AISuccessResponse } from '../types';
import { processMeeting } from '../services/ai';

interface MeetingInputProps {
  onSuccess: (result: AISuccessResponse, submitter: string) => void;
}

export default function MeetingInput({ onSuccess }: MeetingInputProps) {
  const [text, setText] = useState('');
  const [submitter, setSubmitter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit() {
    setValidationError(null);
    setError(null);

    if (!submitter.trim()) {
      setValidationError('Please enter your name before submitting.');
      return;
    }

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 20) {
      setValidationError('Please provide at least 20 words of meeting notes.');
      return;
    }

    setLoading(true);
    try {
      const result = await processMeeting(text);
      if (result.success) {
        onSuccess(result, submitter.trim());
      } else if (result.error.code === 'INSUFFICIENT_INPUT') {
        setValidationError(result.error.message);
      } else {
        setError(result.error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleRetry() {
    setError(null);
    handleSubmit();
  }

  return (
    <div className="meeting-input">
      <div className="meeting-input__header">
        <h1 className="meeting-input__title">New Meeting</h1>
        <p className="meeting-input__subtitle">
          Paste your meeting transcript or notes below and we'll extract action items for you.
        </p>
      </div>

      <div className="meeting-input__form">
        <div className="form-field">
          <label className="form-label" htmlFor="submitter">
            Your name
          </label>
          <input
            id="submitter"
            type="text"
            className="form-input"
            placeholder="e.g. Sarah"
            value={submitter}
            onChange={(e) => setSubmitter(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="transcript">
            Meeting transcript or notes
          </label>
          <textarea
            id="transcript"
            className="form-textarea"
            placeholder="Paste your meeting notes here..."
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
        </div>

        {validationError && (
          <div className="alert alert--warning" role="alert">
            {validationError}
          </div>
        )}

        {error && (
          <div className="alert alert--error" role="alert">
            <span>{error}</span>
            <button className="btn btn--ghost btn--sm" onClick={handleRetry} disabled={loading}>
              Retry
            </button>
          </div>
        )}

        <button
          className="btn btn--primary btn--full"
          onClick={handleSubmit}
          disabled={loading || !text.trim() || !submitter.trim()}
        >
          {loading ? (
            <span className="btn__loading">
              <span className="spinner" />
              Processing…
            </span>
          ) : (
            'Process Meeting'
          )}
        </button>
      </div>
    </div>
  );
}
