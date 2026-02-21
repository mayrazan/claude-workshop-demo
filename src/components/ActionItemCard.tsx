// src/components/ActionItemCard.tsx
import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import type { ActionItem } from '../types'

interface Props {
  item: ActionItem
  onStatusChange: (status: ActionItem['status']) => void
  onDelete: () => void
  onEdit: (changes: Partial<Pick<ActionItem, 'description' | 'responsible' | 'priority' | 'dueDate'>>) => void
}

const PRIORITY_CLASS: Record<ActionItem['priority'], string> = {
  High: 'priority--high',
  Medium: 'priority--medium',
  Low: 'priority--low',
}

export default function ActionItemCard({ item, onStatusChange, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    description: item.description,
    responsible: item.responsible,
    priority: item.priority,
    dueDate: item.dueDate ?? '',
  })

  function handleSave() {
    onEdit({
      description: draft.description,
      responsible: draft.responsible,
      priority: draft.priority,
      dueDate: draft.dueDate || null,
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="action-item action-item--editing">
        <input
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          className="action-item__input"
          placeholder="Description"
        />
        <input
          value={draft.responsible}
          onChange={(e) => setDraft((d) => ({ ...d, responsible: e.target.value }))}
          className="action-item__input"
          placeholder="Responsible"
        />
        <select
          value={draft.priority}
          onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as ActionItem['priority'] }))}
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <input
          type="date"
          value={draft.dueDate}
          onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
        />
        <button onClick={handleSave} className="btn-icon btn-icon--confirm" title="Save">
          <Check size={16} />
        </button>
        <button onClick={() => setEditing(false)} className="btn-icon btn-icon--cancel" title="Cancel">
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className={`action-item ${item.status === 'Done' ? 'action-item--done' : ''}`}>
      <span className={`priority-dot ${PRIORITY_CLASS[item.priority]}`} title={item.priority} />
      <span className="action-item__description">{item.description}</span>
      <span className="action-item__responsible">@{item.responsible}</span>
      <select
        value={item.status}
        onChange={(e) => onStatusChange(e.target.value as ActionItem['status'])}
        className="action-item__status"
      >
        <option>Pending</option>
        <option>In Progress</option>
        <option>Done</option>
      </select>
      {item.dueDate && (
        <span className="action-item__due">
          {new Date(item.dueDate).toLocaleDateString()}
        </span>
      )}
      <button onClick={() => setEditing(true)} className="btn-icon" title="Edit">
        <Pencil size={14} />
      </button>
      <button onClick={onDelete} className="btn-icon btn-icon--danger" title="Delete">
        <Trash2 size={14} />
      </button>
    </div>
  )
}
