import React, { useState } from 'react';
import Header from '../components/Header';
import NavigationTabs from '../components/NavigationTabs';
import GuildHall from '../components/GuildHall';
import Adventurers from '../components/Adventurers';
import QuestBoard from '../components/QuestBoard';
import HiringHall from '../components/HiringHall';
import Treasury from '../components/Treasury';
import QuestModal from '../components/QuestModal';
import ActiveQuests from '../components/ActiveQuests';
import ActivityLog from '../components/ActivityLog';
import { Quest } from '../types/game';
import { useGuildStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';

export function GamePage() {
  const [modalQuest, setModalQuest] = useState<Quest | null>(null);
  const activeTab = useUIStore((s) => s.activeTab);

  const {
    gold,
    adventurers,
    activeQuests,
    recruits,
    hireAdventurer,
    startQuest,
    completeQuest,
    refreshRecruits,
    spendGold
  } = useGuildStore();

  const handleOpenQuestModal = (quest: Quest) => {
    setModalQuest(quest);
  };

  const handleCloseQuestModal = () => {
    setModalQuest(null);
  };

  const handleStartQuest = (questId: string, adventurerIds: string[]) => {
    startQuest(questId, adventurerIds);
    setModalQuest(null);
  };

  const handleGoldDeduction = (amount: number) => {
    spendGold(amount);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'guild-hall':
        return <section className="tab-content active" id="guild-hall"><GuildHall /></section>;
      case 'adventurers':
        return <section className="tab-content active" id="adventurers">
          <Adventurers adventurers={adventurers} />
        </section>;
      case 'quest-board':
        return <section className="tab-content active" id="quest-board">
          <QuestBoard onQuestSelect={handleOpenQuestModal} />
        </section>;
      case 'hiring-hall':
        return <section className="tab-content active" id="hiring-hall">
          <HiringHall
            gold={gold}
            recruits={recruits}
            onHireAdventurer={hireAdventurer}
            onRefreshRecruits={refreshRecruits}
            onGoldDeduction={handleGoldDeduction}
          />
        </section>;
      case 'treasury':
        return <section className="tab-content active" id="treasury"><Treasury /></section>;
      default:
        return <section className="tab-content active" id="guild-hall"><GuildHall /></section>;
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 text-slate-800">
      <Header />
      <NavigationTabs />
      <main className="main-content">
        {renderActiveTab()}
        <ActiveQuests activeQuests={activeQuests} onCompleteQuest={completeQuest} />
        <ActivityLog />
      </main>
      {modalQuest && (
        <QuestModal
          quest={modalQuest}
          adventurers={adventurers}
          onClose={handleCloseQuestModal}
          onStartQuest={handleStartQuest}
        />
      )}
    </div>
  );
}
