// Figma node-id: 1639-343791

interface DashboardFiltersProps {
  responsibleOptions: string[];
  selectedResponsible: string;
  selectedStatus: string;
  onResponsibleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Done'] as const;

export default function DashboardFilters({
  responsibleOptions,
  selectedResponsible,
  selectedStatus,
  onResponsibleChange,
  onStatusChange,
}: DashboardFiltersProps) {
  return (
    <div className="dashboard-filters">
      <div className="filter-field">
        <label className="form-label" htmlFor="filter-responsible">
          Responsible
        </label>
        <select
          id="filter-responsible"
          className="form-select"
          value={selectedResponsible}
          onChange={(e) => onResponsibleChange(e.target.value)}
        >
          <option value="All">All people</option>
          {responsibleOptions.map((name) => (
            <option key={name} value={name}>
              {name || 'Unassigned'}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label className="form-label" htmlFor="filter-status">
          Status
        </label>
        <select
          id="filter-status"
          className="form-select"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? 'All statuses' : s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
