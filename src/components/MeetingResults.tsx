import type { MeetingResponse } from '../types/meeting'

interface Props {
  data: MeetingResponse
}

export function MeetingResults({ data }: Props) {
  return (
    <div className="meeting-results">
      <section className="summary-section">
        <h2>Summary</h2>
        <p>{data.summary}</p>
      </section>
      <section className="action-items-section">
        <h2>Action Items ({data.action_items.length})</h2>
        {data.action_items.length === 0 ? (
          <p>No action items found.</p>
        ) : (
          <ul className="action-items-list">
            {data.action_items.map((item, index) => (
              <li key={index} className="action-item">
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
