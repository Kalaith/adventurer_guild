import React from 'react';
import type { ActivityEntry } from '../api/guild';

interface ActivityLogProps {
  entries?: ActivityEntry[];
}

const formatTimestamp = (timestamp: number | null): string => {
  if (!timestamp) {
    return 'Unknown time';
  }

  return new Date(timestamp).toLocaleString();
};

const ActivityLog: React.FC<ActivityLogProps> = ({ entries = [] }) => {
  if (entries.length === 0) {
    return (
      <div className="activity-log">
        <h2>Activity Log</h2>
        <p>No guild activity has been recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="activity-log">
      <h2>Activity Log</h2>
      <ul className="log-list">
        {entries.map(entry => (
          <li key={entry.id} className="log-entry">
            <div className="font-semibold text-slate-900">{entry.title}</div>
            <div>{entry.description}</div>
            <div className="text-xs text-slate-500">{formatTimestamp(entry.createdAt)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLog;
