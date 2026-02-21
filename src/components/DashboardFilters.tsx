// src/components/DashboardFilters.tsx
import type { ActionItem } from '../types'

export interface Filters {
  responsible: string
  status: ActionItem['status'] | ''
  priority: ActionItem['priority'] | ''
}

interface Props {
  filters: Filters
  responsibles: string[]
  onChange: (filters: Filters) => void
}

export default function DashboardFilters({ filters, responsibles, onChange }: Props) {
  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="dashboard-filters">
      <select
        value={filters.responsible}
        onChange={(e) => set('responsible', e.target.value)}
      >
        <option value="">All assignees</option>
        {responsibles.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => set('status', e.target.value as Filters['status'])}
      >
        <option value="">All statuses</option>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>

      <select
        value={filters.priority}
        onChange={(e) => set('priority', e.target.value as Filters['priority'])}
      >
        <option value="">All priorities</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
    </div>
  )
}
