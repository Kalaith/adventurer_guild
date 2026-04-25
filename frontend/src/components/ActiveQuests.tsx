import React from 'react';
import { Quest } from '../types/game';

interface ActiveQuestsProps {
  activeQuests: Quest[];
  onCompleteQuest: (questId: string) => Promise<void>;
}

const formatTime = (milliseconds: number | null | undefined) => {
  if (milliseconds === null || milliseconds === undefined) {
    return 'Unknown';
  }

  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

const ActiveQuests: React.FC<ActiveQuestsProps> = ({ activeQuests, onCompleteQuest }) => {
  const [resolvingQuestId, setResolvingQuestId] = React.useState<string | null>(null);
  const [, forceTick] = React.useState(0);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      forceTick(tick => tick + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const handleResolveQuest = async (questId: string) => {
    setResolvingQuestId(questId);

    try {
      await onCompleteQuest(questId);
    } finally {
      setResolvingQuestId(current => (current === questId ? null : current));
    }
  };

  if (activeQuests.length === 0) {
    return (
      <div className="active-quests">
        <h2>Active Quests</h2>
        <p>No active quests. Check the Quest Board to start a new quest.</p>
      </div>
    );
  }

  return (
    <div className="active-quests">
      <h2>Active Quests</h2>
      <div className="quest-list">
        {activeQuests.map(quest => {
          const remainingMs = quest.expectedCompletionAt ? Math.max(0, quest.expectedCompletionAt - Date.now()) : quest.remainingMs;
          const canResolve = quest.expectedCompletionAt ? remainingMs === 0 : Boolean(quest.canResolve);

          return (
            <div key={quest.id} className="active-quest-item">
              <h3>{quest.name}</h3>
              <p>Reward: {quest.reward} gold</p>
              <p>Difficulty: {quest.difficulty}</p>
              <p>Time Remaining: {formatTime(remainingMs)}</p>
              {quest.assignedAdventurers && <p>Adventurers: {quest.assignedAdventurers.length}</p>}
              {quest.expectedCompletionAt ? <p>Ready At: {new Date(quest.expectedCompletionAt).toLocaleString()}</p> : null}
              <button
                type="button"
                className="btn btn--primary mt-2"
                onClick={() => void handleResolveQuest(quest.id)}
                disabled={resolvingQuestId === quest.id || !canResolve}
              >
                {resolvingQuestId === quest.id ? 'Resolving...' : canResolve ? 'Resolve Quest' : 'Quest In Progress'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveQuests;
