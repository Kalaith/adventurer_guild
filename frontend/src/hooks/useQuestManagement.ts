import { useMemo } from 'react';
import { useGuildStore } from '../stores/gameStore';
import { Quest } from '../types/game';

export const useQuestManagement = () => {
  const { availableQuests, activeQuests, startQuest, completeQuest, adventurers } = useGuildStore();

  const canStartQuest = (quest: Quest, adventurerIds: string[]) => {
    const selectedAdventurers = adventurers.filter(a => adventurerIds.includes(a.id));
    const availableAdventurers = selectedAdventurers.filter(a => a.status === 'available');

    return (
      availableAdventurers.length > 0 &&
      selectedAdventurers.every(a => a.level >= quest.requirements.minLevel)
    );
  };

  const getRecommendedAdventurers = useMemo(
    () =>
      (quest: Quest) =>
        adventurers.filter(
          adventurer =>
            adventurer.status === 'available' &&
            adventurer.level >= quest.requirements.minLevel &&
            quest.requirements.preferredClasses.includes(adventurer.class)
        ),
    [adventurers]
  );

  return {
    availableQuests,
    activeQuests,
    startQuest,
    completeQuest,
    canStartQuest,
    getRecommendedAdventurers,
  };
};
