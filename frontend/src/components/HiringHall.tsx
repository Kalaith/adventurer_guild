import React from 'react';
import { Recruit } from '../types/game';
import { GUILD_CONSTANTS } from '../constants/gameConstants';

interface HiringHallProps {
  gold: number;
  recruits: Recruit[];
  onHireAdventurer: (recruitId: string) => void;
  onRefreshRecruits: () => void;
  onGoldDeduction: (amount: number) => void;
}

const HiringHall: React.FC<HiringHallProps> = ({
  gold,
  recruits,
  onHireAdventurer,
  onRefreshRecruits
}) => {
  const handleHireAdventurer = (recruitId: string) => {
    onHireAdventurer(recruitId);
  };

  const handleRefreshRecruits = () => {
    if (gold >= GUILD_CONSTANTS.RECRUIT_REFRESH_COST) {
      onRefreshRecruits();
    } else {
      alert('Not enough gold to refresh recruits!');
    }
  };

  return (
    <div>
      <h2>👥 Hiring Hall</h2>
      <div className="hiring-info">
        <p>Gold: {gold}</p>
        <button
          className="btn btn--secondary"
          onClick={handleRefreshRecruits}
          disabled={gold < GUILD_CONSTANTS.RECRUIT_REFRESH_COST}
        >
          🔄 Refresh Recruits ({GUILD_CONSTANTS.RECRUIT_REFRESH_COST} gold)
        </button>
      </div>
      <div className="recruit-grid">
        {recruits.length === 0 ? (
          <p>No recruits available. Refresh to get new recruits!</p>
        ) : (
          recruits.map((recruit) => (
            <div key={recruit.id} className="recruit-item">
              <h3>{recruit.name}</h3>
              <p>Level: {recruit.level}</p>
              <p>Class: {recruit.class}</p>
              <p>Cost: {recruit.cost} gold</p>
              <button
                className="btn btn--primary"
                onClick={() => handleHireAdventurer(recruit.id)}
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
