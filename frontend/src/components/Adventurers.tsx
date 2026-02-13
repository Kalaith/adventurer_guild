import React from 'react';
import { Adventurer } from '../types/game';

interface AdventurersProps {
  adventurers: Adventurer[];
}

const Adventurers: React.FC<AdventurersProps> = ({ adventurers }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600';
      case 'on quest':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getClassIcon = (adventurerClass: string) => {
    switch (adventurerClass) {
      case 'Warrior':
        return '⚔️';
      case 'Mage':
        return '🔮';
      case 'Rogue':
        return '🗡️';
      case 'Archer':
        return '🏹';
      default:
        return '👤';
    }
  };

  if (adventurers.length === 0) {
    return (
      <div>
        <h2>⚔️ Your Adventurers</h2>
        <p>No adventurers hired yet. Visit the Hiring Hall to recruit some!</p>
      </div>
    );
  }

  return (
    <div>
      <h2>⚔️ Your Adventurers</h2>
      <div className="adventurer-grid">
        {adventurers.map((adventurer) => (
          <div key={adventurer.id} className="adventurer-card">
            <div className="adventurer-header">
              <span className="class-icon">{getClassIcon(adventurer.class)}</span>
              <h3>{adventurer.name}</h3>
            </div>
            <div className="adventurer-details">
              <p>Class: {adventurer.class}</p>
              <p>Rank: {adventurer.rank}</p>
              <p>Level: {adventurer.level}</p>
              <p>Experience: {adventurer.experience}</p>
              <p className={getStatusColor(adventurer.status)}>Status: {adventurer.status}</p>
            </div>
            <div className="adventurer-stats">
              <h4>Stats:</h4>
              <p>STR: {adventurer.stats.strength}</p>
              <p>INT: {adventurer.stats.intelligence}</p>
              <p>DEX: {adventurer.stats.dexterity}</p>
              <p>VIT: {adventurer.stats.vitality}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Adventurers;
