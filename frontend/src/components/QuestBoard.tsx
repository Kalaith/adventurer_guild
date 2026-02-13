import React from 'react';
import { Quest } from '../types/game';
import { questData } from '../data/quests';

interface QuestBoardProps {
  onQuestSelect: (quest: Quest) => void;
}

const QuestBoard: React.FC<QuestBoardProps> = ({ onQuestSelect }) => {
  return (
    <div>
      <div className="quest-board-header">
        <h2>📋 Quest Board</h2>
        <p>Choose from available quests to send your adventurers on exciting adventures!</p>
      </div>
      <div className="quest-grid">
        {questData.map((quest) => (
          <div
            key={quest.id}
            className="quest-item"
            onClick={() => onQuestSelect(quest)}
          >
            <h3>{quest.name}</h3>
            <p>{quest.description}</p>
            <div className="quest-details">
              <p>Reward: {quest.reward} gold</p>
              <p>Difficulty: <span className={`difficulty-${quest.difficulty.toLowerCase()}`}>{quest.difficulty}</span></p>
              <p>Duration: {Math.floor(quest.duration / 60000)} minutes</p>
              <p>Min Level: {quest.requirements.minLevel}</p>
            </div>
            <button className="btn btn--primary">
              View Quest
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestBoard;
