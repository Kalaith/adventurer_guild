import React from 'react';

interface ActivityLogProps {
  logEntries?: string[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ logEntries = [] }) => {
  // For now, show a simple placeholder since we're not implementing full activity logging yet
  const defaultEntries = [
    'Welcome to your Adventurer Guild!',
    'Start by hiring adventurers and taking on quests.',
    'Complete quests to earn gold and reputation.',
  ];

  const entries = logEntries.length > 0 ? logEntries : defaultEntries;

  return (
    <div className="activity-log">
      <h2>📜 Activity Log</h2>
      <ul className="log-list">
        {entries.map((entry, index) => (
          <li key={index} className="log-entry">
            {entry}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLog;
