import { useMemo } from 'react';
import { useGuildStore } from '../stores/gameStore';
import { QUEST_DATA } from '../data/quests';
import { Quest } from '../types/game';

export const useQuestManagement = () => {
  const { activeQuests, startQuest, completeQuest, adventurers } = useGuildStore();

  const availableQuests = useMemo(() => {
    return QUEST_DATA.filter(quest =>
      !activeQuests.some(activeQuest => activeQuest.id === quest.id)
    );
  }, [activeQuests]);

  const canStartQuest = (quest: Quest, adventurerIds: string[]) => {
    const selectedAdventurers = adventurers.filter(a => adventurerIds.includes(a.id));
    const availableAdventurers = selectedAdventurers.filter(a => a.status === 'available');

    return availableAdventurers.length > 0 &&
           selectedAdventurers.every(a => a.level >= quest.requirements.minLevel);
  };

  const getRecommendedAdventurers = (quest: Quest) => {
    return adventurers.filter(adventurer =>
      adventurer.status === 'available' &&
      adventurer.level >= quest.requirements.minLevel &&
      quest.requirements.preferredClasses.includes(adventurer.class)
    );
  };

  return {
    availableQuests,
    activeQuests,
    startQuest,
    completeQuest,
    canStartQuest,
    getRecommendedAdventurers
  };
};
