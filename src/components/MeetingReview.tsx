// Figma node-id: 1639-343791
import { useState } from 'react';
import type { ActionItem, AISuccessResponse, Meeting } from '../types';
import { addMeeting } from '../utils/storage';
import ActionItemList from './ActionItemList';

interface MeetingReviewProps {
  aiResult: AISuccessResponse;
  submitter: string;
  onSaved: () => void;
  onBack: () => void;
}

function buildInitialItems(
  aiResult: AISuccessResponse,
  meetingId: string,
  meetingTitle: string
): ActionItem[] {
  return aiResult.actionItems.map((ai) => ({
    id: crypto.randomUUID(),
    meetingId,
    meetingTitle,
    description: ai.description,
    responsible: ai.responsible ?? '',
    priority: ai.priority,
    status: 'Pending' as const,
    dueDate: null,
  }));
}

export default function MeetingReview({ aiResult, submitter, onSaved, onBack }: MeetingReviewProps) {
  const [meetingId] = useState(() => crypto.randomUUID());
  const [title, setTitle] = useState(aiResult.meeting.title);
  const [items, setItems] = useState<ActionItem[]>(() =>
    buildInitialItems(aiResult, meetingId, aiResult.meeting.title)
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleItemChange(updated: ActionItem) {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }

  function handleItemDelete(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleAddItem() {
    const newItem: ActionItem = {
      id: crypto.randomUUID(),
      meetingId,
      meetingTitle: title,
      description: '',
      responsible: '',
      priority: 'Medium',
      status: 'Pending',
      dueDate: null,
    };
    setItems((prev) => [...prev, newItem]);
  }

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    // Keep meetingTitle in sync on existing items
    setItems((prev) => prev.map((item) => ({ ...item, meetingTitle: newTitle })));
  }

  function handleSave() {
    setSaveError(null);
    const meeting: Meeting = {
      id: meetingId,
      title: title.trim() || 'Untitled Meeting',
      submitter,
      createdAt: new Date().toISOString(),
      actionItems: items.map((item) => ({ ...item, meetingTitle: title.trim() || 'Untitled Meeting' })),
    };
    try {
      addMeeting(meeting);
      onSaved();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save meeting.');
    }
  }

  return (
    <div className="meeting-review">
      <div className="meeting-review__header">
        <button className="btn btn--ghost btn--sm" onClick={onBack}>
          ← Back
        </button>
        <h1 className="meeting-review__heading">Review Meeting</h1>
      </div>

      <div className="meeting-review__body">
        <section className="review-section">
          <label className="form-label" htmlFor="meeting-title">
            Meeting title
          </label>
          <input
            id="meeting-title"
            type="text"
            className="form-input form-input--lg"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Meeting title"
          />
        </section>

        <section className="review-section">
          <h2 className="review-section__title">Summary</h2>
          <p className="review-section__summary">{aiResult.meeting.summary}</p>
          {aiResult.meeting.discussionPoints.length > 0 && (
            <ul className="review-section__points">
              {aiResult.meeting.discussionPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="review-section">
          <h2 className="review-section__title">Action Items</h2>
          <ActionItemList
            items={items}
            onChange={handleItemChange}
            onDelete={handleItemDelete}
            onAdd={handleAddItem}
          />
        </section>

        {saveError && (
          <div className="alert alert--error" role="alert">
            {saveError}
          </div>
        )}

        <div className="meeting-review__footer">
          <button className="btn btn--primary" onClick={handleSave}>
            Save Meeting
          </button>
        </div>
      </div>
    </div>
  );
}
