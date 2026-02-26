import type { DisplayResult } from '../types/meeting'

interface Props {
  data: DisplayResult
}

export function MeetingResults({ data }: Props) {
  return (
    <div className="meeting-results">
      {data.title && (
        <section className="title-section">
          <h2>{data.title}</h2>
        </section>
      )}
      {data.summary && (
        <section className="summary-section">
          <h2>Summary</h2>
          <p>{data.summary}</p>
        </section>
      )}
      <section className="action-items-section">
        <h2>Action Items ({data.action_items.length})</h2>
        {data.action_items.length === 0 ? (
          <p>No action items found.</p>
        ) : (
          <ul className="action-items-list">
            {data.action_items.map((item, index) => (
              <li key={item.id ?? index} className="action-item">
                <span className={`priority-badge priority-${item.priority}`}>
                  {item.priority}
                </span>
                <span className="action-description">{item.description}</span>
                {item.assignee && (
                  <span className="assignee">@{item.assignee}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
