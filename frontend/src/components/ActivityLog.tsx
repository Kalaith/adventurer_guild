import React from 'react';

interface ActivityLogProps {
  logEntries: string[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ logEntries }) => {
  return (
    <div className="activity-log">
      <h2>📜 Activity Log</h2>
      <ul className="log-list">
        {logEntries.map((entry, index) => (
          <li key={index} className="log-entry">
            {entry}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLog;
