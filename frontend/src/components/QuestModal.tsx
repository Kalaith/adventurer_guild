import React, { useState } from 'react';
import { Quest, Adventurer } from '../types/game';

interface QuestModalProps {
  quest: Quest | null;
  adventurers: Adventurer[];
  onClose: () => void;
  onStartQuest: (questId: string, adventurerIds: string[]) => void;
}

const formatDuration = (quest: Quest): string => {
  const durationMs = quest.durationMs ?? quest.duration * 1000;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

const QuestModal: React.FC<QuestModalProps> = ({ quest, adventurers, onClose, onStartQuest }) => {
  const [selectedAdventurers, setSelectedAdventurers] = useState<string[]>([]);

  if (!quest) return null;

  const toggleAdventurerSelection = (id: string) => {
    setSelectedAdventurers(prev =>
      prev.includes(id) ? prev.filter(advId => advId !== id) : [...prev, id]
    );
  };

  const handleStartQuest = () => {
    onStartQuest(quest.id, selectedAdventurers);
    onClose();
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Assign: {quest.name}</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="quest-details">
            <p>
              <strong>Difficulty:</strong> {quest.difficulty}
            </p>
            <p>
              <strong>Reward:</strong> {quest.reward} gold
            </p>
            <p>
              <strong>Duration:</strong> {formatDuration(quest)}
            </p>
            <p>
              <strong>Min Level:</strong> {quest.requirements.minLevel}
            </p>
            <p>
              <strong>Preferred Classes:</strong> {quest.requirements.preferredClasses.join(', ')}
            </p>
            {quest.campaignId ? (
              <p>
                <strong>Campaign:</strong> {quest.campaignId}
              </p>
            ) : null}
          </div>
          <p>{quest.description}</p>

          <div className="available-adventurers">
            {adventurers
              .filter(adv => adv.status === 'available')
              .map(adv => (
                <div
                  key={adv.id}
                  className={`adventurer-select-card ${selectedAdventurers.includes(adv.id) ? 'selected' : ''}`}
                  onClick={() => toggleAdventurerSelection(adv.id)}
                >
                  <div>
                    <strong>{adv.name}</strong>
                  </div>
                  <div>
                    {adv.class} ({adv.rank})
                  </div>
                  <div>Level {adv.level}</div>
                </div>
              ))}
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn--primary"
            onClick={handleStartQuest}
            disabled={selectedAdventurers.length === 0}
          >
            Start Quest
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestModal;
