import React from 'react';
import { Recruit } from '../types/game';
import { guildConstants } from '../constants/gameConstants';

interface HiringHallProps {
  gold: number;
  recruits: Recruit[];
  onHireAdventurer: (recruitId: string) => Promise<void>;
  onRefreshRecruits: () => Promise<void>;
}

const HiringHall: React.FC<HiringHallProps> = ({ gold, recruits, onHireAdventurer, onRefreshRecruits }) => {
  return (
    <div>
      <h2>Hiring Hall</h2>
      <div className="hiring-info">
        <p>Gold: {gold}</p>
        <button
          className="btn btn--secondary"
          type="button"
          onClick={() => void onRefreshRecruits()}
          disabled={gold < guildConstants.RECRUIT_REFRESH_COST}
        >
          Refresh Recruits ({guildConstants.RECRUIT_REFRESH_COST} gold)
        </button>
      </div>
      <div className="recruit-grid">
        {recruits.length === 0 ? (
          <p>No recruits are stored for this guild yet. Refresh the roster to generate a new pool.</p>
        ) : (
          recruits.map(recruit => (
            <div key={recruit.id} className="recruit-item">
              <h3>{recruit.name}</h3>
              <p>Level: {recruit.level}</p>
              <p>Class: {recruit.class}</p>
              <p>Cost: {recruit.cost} gold</p>
              <button
                className="btn btn--primary"
                type="button"
                onClick={() => void onHireAdventurer(recruit.id)}
                disabled={gold < recruit.cost}
              >
                Hire Adventurer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HiringHall;
