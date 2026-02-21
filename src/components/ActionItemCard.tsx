// Figma node-id: 1639-343791
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { ActionItem } from '../types';

interface ActionItemCardProps {
  item: ActionItem;
  onChange: (updated: ActionItem) => void;
  onDelete: (id: string) => void;
}

export default function ActionItemCard({ item, onChange, onDelete }: ActionItemCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  function update(patch: Partial<ActionItem>) {
    onChange({ ...item, ...patch });
  }

  function handleDeleteClick() {
    if (confirmDelete) {
      onDelete(item.id);
    } else {
      setConfirmDelete(true);
    }
  }

  return (
    <div className="action-card">
      <div className="action-card__main">
        <input
          type="text"
          className="action-card__description"
          value={item.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Task description"
          aria-label="Task description"
        />
      </div>

      <div className="action-card__meta">
        <div className="action-card__field">
          <label className="action-card__label">Responsible</label>
          <input
            type="text"
            className="action-card__input"
            value={item.responsible}
            onChange={(e) => update({ responsible: e.target.value })}
            placeholder="Unassigned"
            aria-label="Responsible person"
          />
        </div>

        <div className="action-card__field">
          <label className="action-card__label">Priority</label>
          <select
            className="action-card__select"
            value={item.priority}
            onChange={(e) => update({ priority: e.target.value as ActionItem['priority'] })}
            aria-label="Priority"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="action-card__field">
          <label className="action-card__label">Status</label>
          <select
            className="action-card__select"
            value={item.status}
            onChange={(e) => update({ status: e.target.value as ActionItem['status'] })}
            aria-label="Status"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div className="action-card__field">
          <label className="action-card__label">Due date</label>
          <div className="action-card__date-row">
            <input
              type="date"
              className="action-card__input"
              value={item.dueDate ?? ''}
              onChange={(e) => update({ dueDate: e.target.value || null })}
              aria-label="Due date"
            />
            {item.dueDate && (
              <button
                className="btn btn--ghost btn--icon"
                onClick={() => update({ dueDate: null })}
                aria-label="Clear due date"
                title="Clear"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="action-card__actions">
        {confirmDelete ? (
          <div className="action-card__confirm">
            <span className="action-card__confirm-text">Delete?</span>
            <button className="btn btn--danger btn--sm" onClick={handleDeleteClick}>
              Yes, delete
            </button>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="btn btn--ghost btn--icon"
            onClick={handleDeleteClick}
            aria-label="Delete action item"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
