import React, { useEffect, useState } from 'react';
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
import { useAuth } from '../contexts/AuthContext';

export function GamePage() {
  const [modalQuest, setModalQuest] = useState<Quest | null>(null);
  const activeTab = useUIStore(s => s.activeTab);
  const { isAuthenticated, isLoading, error, continueAsGuest, loginWithRedirect, user, getLinkAccountUrl } = useAuth();

  const {
    gold,
    adventurers,
    activeQuests,
    completedQuests,
    recruits,
    availableQuests,
    activityEntries,
    hydrate,
    isHydrating: isGuildHydrating,
    error: guildError,
    hireAdventurer,
    refreshRecruits,
    startQuest,
    completeQuest,
  } = useGuildStore();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void hydrate();
  }, [hydrate, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50 px-6 text-slate-800">
        <div className="max-w-md rounded-xl border border-amber-200 bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-2xl font-bold text-slate-900">Loading Guild Archive</h1>
          <p className="text-sm text-slate-600">Resolving your current game session.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50 px-6 text-slate-800">
        <div className="max-w-xl rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
          <h1 className="mb-3 text-3xl font-bold text-slate-900">Enter the Guild Hall</h1>
          <p className="mb-6 text-sm text-slate-600">
            Authentication now runs through the app backend. Guild summary, roster, and quest progression now come from the database.
          </p>
          {error ? <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void continueAsGuest()}
              className="rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-amber-50 transition hover:bg-slate-700"
            >
              Continue as Guest
            </button>
            <button
              type="button"
              onClick={loginWithRedirect}
              className="rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleOpenQuestModal = (quest: Quest) => {
    setModalQuest(quest);
  };

  const handleCloseQuestModal = () => {
    setModalQuest(null);
  };

  const handleStartQuest = async (questId: string, adventurerIds: string[]) => {
    await startQuest(questId, adventurerIds);
    setModalQuest(null);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'guild-hall':
        return (
          <section className="tab-content active" id="guild-hall">
            <GuildHall
              adventurerCount={adventurers.length}
              activeQuestCount={activeQuests.length}
              completedQuestCount={completedQuests.length}
              activeQuests={activeQuests}
              activityEntries={activityEntries}
            />
          </section>
        );
      case 'adventurers':
        return (
          <section className="tab-content active" id="adventurers">
            <Adventurers adventurers={adventurers} />
          </section>
        );
      case 'quest-board':
        return (
          <section className="tab-content active" id="quest-board">
            <QuestBoard onQuestSelect={handleOpenQuestModal} />
          </section>
        );
      case 'hiring-hall':
        return (
          <section className="tab-content active" id="hiring-hall">
            <HiringHall gold={gold} recruits={recruits} onHireAdventurer={hireAdventurer} onRefreshRecruits={refreshRecruits} />
          </section>
        );
      case 'treasury':
        return (
          <section className="tab-content active" id="treasury">
            <Treasury />
          </section>
        );
      default:
        return (
          <section className="tab-content active" id="guild-hall">
            <GuildHall
              adventurerCount={adventurers.length}
              activeQuestCount={activeQuests.length}
              completedQuestCount={completedQuests.length}
              activeQuests={activeQuests}
              activityEntries={activityEntries}
            />
          </section>
        );
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 text-slate-800">
      <Header />
      {user?.is_guest ? (
        <div className="mx-auto mt-4 w-[min(1100px,calc(100%-2rem))] rounded-xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-950">
          Playing on a guest session. <a href={getLinkAccountUrl()} className="font-semibold underline">Link this save to an account</a>.
        </div>
      ) : null}
      <NavigationTabs />
      <main className="main-content">
        {isGuildHydrating ? (
          <div className="mx-auto mb-4 w-[min(1100px,calc(100%-2rem))] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            Loading guild data from the database.
          </div>
        ) : null}
        {guildError ? (
          <div className="mx-auto mb-4 w-[min(1100px,calc(100%-2rem))] rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {guildError}
          </div>
        ) : null}
        {renderActiveTab()}
        <ActiveQuests activeQuests={activeQuests} onCompleteQuest={completeQuest} />
        <ActivityLog entries={activityEntries} />
      </main>
      {modalQuest && (
        <QuestModal
          quest={availableQuests.find(quest => quest.id === modalQuest.id) ?? modalQuest}
          adventurers={adventurers}
          onClose={handleCloseQuestModal}
          onStartQuest={(questId, adventurerIds) => {
            void handleStartQuest(questId, adventurerIds);
          }}
        />
      )}
    </div>
  );
}
