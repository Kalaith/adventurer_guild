import React from 'react';
import { Quest } from '../types/game';
import { useGuildStore } from '../stores/gameStore';

interface QuestBoardProps {
  onQuestSelect: (quest: Quest) => void;
}

const formatDuration = (quest: Quest): string => {
  const durationMs = quest.durationMs ?? quest.duration * 1000;
  return `${Math.floor(durationMs / 60000)} minutes`;
};

const QuestBoard: React.FC<QuestBoardProps> = ({ onQuestSelect }) => {
  const { availableQuests, campaigns, isHydrating } = useGuildStore();

  return (
    <div>
      <div className="quest-board-header">
        <h2>Quest Board</h2>
        <p>Choose from available quests to send your adventurers on assignments tracked in the database.</p>
      </div>

      {campaigns.length > 0 ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-900">{campaign.name}</h3>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${campaign.completed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>
                  {campaign.completed ? 'Completed' : 'In Progress'}
                </span>
              </div>
              <p className="text-sm text-slate-600">{campaign.description}</p>
              <div className="mt-3 text-sm text-slate-700">
                <div>Current Step: {campaign.currentQuestIndex + 1} / {campaign.questIds.length}</div>
                <div>Current Quest: {campaign.currentQuestName ?? 'None'}</div>
                <div>Completion Reward: {campaign.rewards.gold ?? 0} gold, {campaign.rewards.reputation ?? 0} reputation</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="quest-grid">
        {isHydrating ? <p>Loading quest board...</p> : null}
        {!isHydrating && availableQuests.length === 0 ? (
          <p>No quests are currently available for this guild.</p>
        ) : null}
        {availableQuests.map(quest => (
          <div key={quest.id} className="quest-item" onClick={() => onQuestSelect(quest)}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3>{quest.name}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                {quest.questType.replace('_', ' ')}
              </span>
            </div>
            <p>{quest.description}</p>
            <div className="quest-details">
              <p>Reward: {quest.reward} gold</p>
              <p>
                Difficulty:{' '}
                <span className={`difficulty-${quest.difficulty.toLowerCase()}`}>
                  {quest.difficulty}
                </span>
              </p>
              <p>Duration: {formatDuration(quest)}</p>
              <p>Min Level: {quest.requirements.minLevel}</p>
              {quest.campaignId ? <p>Campaign Quest: {quest.campaignId}</p> : null}
            </div>
            <button type="button" className="btn btn--primary">
              View Quest
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestBoard;
