// Figma node-id: 1639-343791
import { useMemo, useState } from 'react';
import type { ActionItem } from '../types';
import { loadMeetings } from '../utils/storage';
import DashboardFilters from './DashboardFilters';

interface DashboardProps {
  onNewMeeting: () => void;
}

const PRIORITY_BADGE: Record<ActionItem['priority'], string> = {
  High: 'badge badge--high',
  Medium: 'badge badge--medium',
  Low: 'badge badge--low',
};

const STATUS_BADGE: Record<ActionItem['status'], string> = {
  Pending: 'badge badge--pending',
  'In Progress': 'badge badge--in-progress',
  Done: 'badge badge--done',
};

export default function Dashboard({ onNewMeeting }: DashboardProps) {
  const [selectedResponsible, setSelectedResponsible] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const meetings = loadMeetings();
  const allItems: ActionItem[] = meetings.flatMap((m) => m.actionItems);

  const responsibleOptions = useMemo(() => {
    const names = new Set(allItems.map((item) => item.responsible));
    return Array.from(names).sort();
  }, [allItems]);

  const filteredItems = allItems.filter((item) => {
    const matchResponsible =
      selectedResponsible === 'All' || item.responsible === selectedResponsible;
    const matchStatus = selectedStatus === 'All' || item.status === selectedStatus;
    return matchResponsible && matchStatus;
  });

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Action Items</h1>
        <button className="btn btn--primary btn--sm" onClick={onNewMeeting}>
          + New Meeting
        </button>
      </div>

      {allItems.length === 0 ? (
        <div className="dashboard__empty">
          <p>No meetings saved yet.</p>
          <button className="btn btn--secondary" onClick={onNewMeeting}>
            Process your first meeting
          </button>
        </div>
      ) : (
        <>
          <DashboardFilters
            responsibleOptions={responsibleOptions}
            selectedResponsible={selectedResponsible}
            selectedStatus={selectedStatus}
            onResponsibleChange={setSelectedResponsible}
            onStatusChange={setSelectedStatus}
          />

          {filteredItems.length === 0 ? (
            <p className="dashboard__no-results">No items match the current filters.</p>
          ) : (
            <div className="dashboard__list">
              {filteredItems.map((item) => (
                <div key={item.id} className="dashboard-item">
                  <div className="dashboard-item__main">
                    <span className="dashboard-item__description">{item.description}</span>
                    <span className="dashboard-item__meeting">{item.meetingTitle}</span>
                  </div>
                  <div className="dashboard-item__meta">
                    {item.responsible && (
                      <span className="dashboard-item__responsible">{item.responsible}</span>
                    )}
                    {item.dueDate && (
                      <span className="dashboard-item__due">{item.dueDate}</span>
                    )}
                    <span className={PRIORITY_BADGE[item.priority]}>{item.priority}</span>
                    <span className={STATUS_BADGE[item.status]}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
