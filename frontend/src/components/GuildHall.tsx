import React from 'react';
import { Quest } from '../types/game';

interface GuildHallProps {
  adventurerCount: number;
  activeQuestCount: number;
  completedQuestCount: number;
  activeQuests: Quest[];
}

const GuildHall: React.FC<GuildHallProps> = ({
  adventurerCount,
  activeQuestCount,
  completedQuestCount,
  activeQuests,
}) => {
  return (
    <div className="guild-overview">
      <div className="guild-image">
        <img
          src="https://pplx-res.cloudinary.com/image/upload/v1751337951/pplx_project_search_images/c116f2633238f064f7b5f29e80faad842e2bf063.jpg"
          alt="Guild Hall Interior"
          className="guild-hall-image"
        />
      </div>
      <div className="guild-info">
        <h2>Welcome, Guild Master!</h2>
        <p>Manage your adventurers, assign quests, and grow your guild&apos;s reputation.</p>
        <div className="quick-stats">
          <div className="stat-card">
            <h3>Active Adventurers</h3>
            <div className="stat-number" id="active-adventurers">
              {adventurerCount}
            </div>
          </div>
          <div className="stat-card">
            <h3>Active Quests</h3>
            <div className="stat-number" id="active-quests">
              {activeQuestCount}
            </div>
          </div>
          <div className="stat-card">
            <h3>Completed Quests</h3>
            <div className="stat-number" id="completed-quests">
              {completedQuestCount}
            </div>
          </div>
        </div>
        <div className="active-quest-panel">
          <h3>Active Quests</h3>
          <div id="active-quests-list" className="active-quests-container">
            {activeQuests.length === 0 ? (
              <p className="no-quests">No active quests</p>
            ) : (
              activeQuests.map((quest) => (
                <div key={quest.id} className="active-quest-item">
                  <h4>{quest.name}</h4>
                  <p>Difficulty: {quest.difficulty}</p>
                  <p>Reward: {quest.reward} gold</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="activity-log">
          <h3>Recent Activity</h3>
          <div id="activity-log" className="log-container">
            <p>Welcome to your new guild! Start by hiring adventurers and taking on quests.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuildHall;
