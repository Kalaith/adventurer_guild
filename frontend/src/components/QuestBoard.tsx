import React, { useEffect, useState } from 'react';
import { fetchQuests } from '../api/mockApi';
import { Quest } from '../types/game';

interface QuestBoardProps {
  onQuestSelect: (quest: Quest) => void;
}

const QuestBoard: React.FC<QuestBoardProps> = ({ onQuestSelect }) => {
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    const loadQuests = async () => {
      const fetchedQuests = await fetchQuests();
      setQuests(fetchedQuests);
    };
    loadQuests();
  }, []);

  return (
    <div>
      <div className="quest-board-header">
        <h2>📋 Quest Board</h2>
        <div className="quest-board-image">
          <img
            src="https://pplx-res.cloudinary.com/image/upload/v1751337951/pplx_project_search_images/9083c87217ad8ba02d828b0af816227201827b4b.jpg"
            alt="Quest Board"
            className="quest-board-img"
          />
        </div>
      </div>
      <div className="quest-grid" id="quest-grid">
        {quests.map((quest) => (
          <div
            key={quest.id}
            className="quest-item"
            onClick={() => onQuestSelect(quest)}
          >
            <h3>{quest.name}</h3>
            <p>{quest.description}</p>
            <p>Reward: {quest.reward}</p>
            <p>Difficulty: {quest.difficulty}</p> {/* Display difficulty */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestBoard;
