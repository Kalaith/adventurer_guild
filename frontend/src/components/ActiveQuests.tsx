import React, { useEffect, useState } from 'react';
import { Quest } from '../types/game';

interface ActiveQuestsProps {
  activeQuests: Quest[];
  onCompleteQuest: (questId: string) => void;
}

const ActiveQuests: React.FC<ActiveQuestsProps> = ({ activeQuests, onCompleteQuest }) => {
  const [timeRemaining, setTimeRemaining] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const updated = { ...prev };
        activeQuests.forEach(quest => {
          const currentTime = updated[quest.id] || quest.duration;
          const newTime = Math.max(currentTime - 1000, 0);
          updated[quest.id] = newTime;

          // Auto-complete quest when time runs out
          if (newTime === 0 && currentTime > 0) {
            onCompleteQuest(quest.id);
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeQuests, onCompleteQuest]);

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (activeQuests.length === 0) {
    return (
      <div className="active-quests">
        <h2>🕒 Active Quests</h2>
        <p>No active quests. Check the Quest Board to start a new quest!</p>
      </div>
    );
  }

  return (
    <div className="active-quests">
      <h2>🕒 Active Quests</h2>
      <div className="quest-list">
        {activeQuests.map(quest => (
          <div key={quest.id} className="active-quest-item">
            <h3>{quest.name}</h3>
            <p>Reward: {quest.reward} gold</p>
            <p>Difficulty: {quest.difficulty}</p>
            <p>Time Remaining: {formatTime(timeRemaining[quest.id] || quest.duration)}</p>
            {quest.assignedAdventurers && <p>Adventurers: {quest.assignedAdventurers.length}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveQuests;
