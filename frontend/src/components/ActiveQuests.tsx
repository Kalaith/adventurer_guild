import React, { useEffect, useState } from 'react';
import { Quest } from '../types/game';

interface ActiveQuestsProps {
  activeQuests: Quest[];
}

const ActiveQuests: React.FC<ActiveQuestsProps> = ({ activeQuests }) => {
  const [timeRemaining, setTimeRemaining] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const updated = { ...prev };
        activeQuests.forEach((quest) => {
          updated[quest.id] = Math.max((updated[quest.id] || quest.duration) - 1000, 0);
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeQuests]);

  return (
    <div className="active-quests">
      <h2>🕒 Active Quests</h2>
      <div className="quest-list">
        {activeQuests.map((quest) => (
          <div key={quest.id} className="active-quest-item">
            <h3>{quest.name}</h3>
            <p>Reward: {quest.reward} gold</p>
            <p>Time Remaining: {Math.floor((timeRemaining[quest.id] || quest.duration) / 60000)}m {Math.floor(((timeRemaining[quest.id] || quest.duration) % 60000) / 1000)}s</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveQuests;
