import React, { useState } from 'react';
import Header from '../components/Header';
import NavigationTabs from '../components/NavigationTabs';
import GuildHall from '../components/GuildHall';
import Adventurers from '../components/Adventurers';
import QuestBoard from '../components/QuestBoard';
import HiringHall from '../components/HiringHall';
import Treasury from '../components/Treasury';
import Modal from '../components/Modal';
import Notifications from '../components/Notifications';
import QuestModal from '../components/QuestModal';
import ActiveQuests from '../components/ActiveQuests';
import ActivityLog from '../components/ActivityLog';
import { Quest, Adventurer } from '../types/game';

export function GamePage() {
  const [activeTab, setActiveTab] = useState('guild-hall');
  const [modalQuest, setModalQuest] = useState<Quest | null>(null);
  const [adventurers, setAdventurers] = useState<Adventurer[]>([]);
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [gold, setGold] = useState(100);

  const handleOpenQuestModal = (quest: Quest) => {
    setModalQuest(quest);
  };

  const handleCloseQuestModal = () => {
    setModalQuest(null);
  };

  const handleStartQuest = (questId: string, adventurerIds: string[]) => {
    const startedQuest = modalQuest ? { ...modalQuest, assignedAdventurers: adventurerIds } : null;
    if (startedQuest) {
      setActiveQuests((prev) => [...prev, startedQuest]);
      setActivityLog((prev) => [
        `Started quest: ${startedQuest.name} with adventurers: ${adventurerIds.join(', ')}`,
        ...prev,
      ]);
    }
    setAdventurers((prev) =>
      prev.map((adv) =>
        adventurerIds.includes(adv.id) ? { ...adv, status: 'on quest' } : adv
      )
    );
    handleCloseQuestModal();
  };

  const handleGoldDeduction = (amount: number) => {
    setGold((prev) => Math.max(prev - amount, 0));
    setActivityLog((prev) => [`Deducted ${amount} gold for recruit refresh`, ...prev]);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'guild-hall':
        return <section className="tab-content active" id="guild-hall"><GuildHall /></section>;
      case 'adventurers':
        return <section className="tab-content active" id="adventurers"><Adventurers /></section>;
      case 'quest-board':
        return <section className="tab-content active" id="quest-board"><QuestBoard onQuestSelect={handleOpenQuestModal} /></section>;
      case 'hiring-hall':
        return <section className="tab-content active" id="hiring-hall"><HiringHall gold={gold} onGoldDeduction={handleGoldDeduction} /></section>;
      case 'treasury':
        return <section className="tab-content active" id="treasury"><Treasury /></section>;
      default:
        return <section className="tab-content active" id="guild-hall"><GuildHall /></section>;
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 text-slate-800">
      <Header />
      <NavigationTabs setActiveTab={setActiveTab} activeTab={activeTab} />
      <main className="main-content">
        {renderActiveTab()}
        <ActiveQuests activeQuests={activeQuests} />
        <ActivityLog logEntries={activityLog} />
      </main>
      {modalQuest && (
        <QuestModal
          quest={modalQuest}
          adventurers={adventurers}
          onClose={handleCloseQuestModal}
          onStartQuest={handleStartQuest}
        />
      )}
      <Notifications />
    </div>
  );
}