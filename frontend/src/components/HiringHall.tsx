import React, { useEffect, useState } from 'react';
import { fetchRecruits } from '../api/mockApi';
import { Recruit } from '../types/game';

interface HiringHallProps {
  gold: number;
  onGoldDeduction: (amount: number) => void;
}

const HiringHall: React.FC<HiringHallProps> = ({ gold, onGoldDeduction }) => {
  const [recruits, setRecruits] = useState<Recruit[]>([]);

  const refreshRecruits = async () => {
    if (gold >= 50) {
      const fetchedRecruits = await fetchRecruits();
      setRecruits(fetchedRecruits);
      onGoldDeduction(50);
    } else {
      alert('Not enough gold to refresh recruits!');
    }
  };

  useEffect(() => {
    const loadRecruits = async () => {
      const fetchedRecruits = await fetchRecruits();
      setRecruits(fetchedRecruits);
    };
    loadRecruits();
  }, []);

  return (
    <div>
      <h2>👥 Hiring Hall</h2>
      <div className="hiring-info">
        <p>Adventurers Available: <span id="available-slots">4</span> / <span id="max-adventurers">5</span></p>
        <button
          className="btn btn--secondary"
          id="refresh-recruits"
          onClick={refreshRecruits}
        >
          🔄 Refresh Recruits (50 gold)
        </button>
      </div>
      <div className="recruit-grid" id="recruit-grid">
        {recruits.map((recruit) => (
          <div key={recruit.id} className="recruit-item">
            <h3>{recruit.name}</h3>
            <p>Level: {recruit.level}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HiringHall;
