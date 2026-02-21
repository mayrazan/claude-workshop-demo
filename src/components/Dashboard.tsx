// src/components/Dashboard.tsx
import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { getMeetings, deleteActionItem, updateActionItemStatus, updateActionItem } from '../utils/storage'
import DashboardFilters, { type Filters } from './DashboardFilters'
import ActionItemCard from './ActionItemCard'
import type { ActionItem } from '../types'

interface Props {
  onNewMeeting: () => void
  refreshKey: number
}

export default function Dashboard({ onNewMeeting, refreshKey }: Props) {
  const [localRefresh, setLocalRefresh] = useState(0)
  const [filters, setFilters] = useState<Filters>({ responsible: '', status: '', priority: '' })

  const allItems = useMemo(() => {
    const meetings = getMeetings()
    return meetings.flatMap((m) => m.actionItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, localRefresh])

  const responsibles = [...new Set(allItems.map((i) => i.responsible))].sort()

  const filtered = allItems.filter((item) => {
    if (filters.responsible && item.responsible !== filters.responsible) return false
    if (filters.status && item.status !== filters.status) return false
    if (filters.priority && item.priority !== filters.priority) return false
    return true
  })

  function refresh() {
    setLocalRefresh((n) => n + 1)
  }

  function handleStatusChange(item: ActionItem, status: ActionItem['status']) {
    updateActionItemStatus(item.meetingId, item.id, status)
    refresh()
  }

  function handleDelete(item: ActionItem) {
    deleteActionItem(item.meetingId, item.id)
    refresh()
  }

  function handleEdit(item: ActionItem, changes: Partial<Pick<ActionItem, 'description' | 'responsible' | 'priority' | 'dueDate'>>) {
    updateActionItem(item.meetingId, item.id, changes)
    refresh()
  }

  if (allItems.length === 0) {
    return (
      <div className="dashboard dashboard--empty">
        <p>No meetings yet.</p>
        <button onClick={onNewMeeting} className="btn btn--primary">
          <Plus size={16} /> Process your first meeting
        </button>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Action Items <span className="badge">{filtered.length}</span></h1>
      </div>

      <DashboardFilters
        filters={filters}
        responsibles={responsibles}
        onChange={setFilters}
      />

      <div className="action-item-list">
        {filtered.length === 0 ? (
          <p className="dashboard__empty-filter">No items match the current filters.</p>
        ) : (
          filtered.map((item) => (
            <ActionItemCard
              key={item.id}
              item={item}
              onStatusChange={(status) => handleStatusChange(item, status)}
              onDelete={() => handleDelete(item)}
              onEdit={(changes) => handleEdit(item, changes)}
            />
          ))
        )}
      </div>
    </div>
  )
}
