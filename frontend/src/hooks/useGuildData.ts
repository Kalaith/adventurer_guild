import { useGuildStore } from '../stores/gameStore';

export const useGuildData = () => {
  const { adventurers, recruits, activeQuests, gold, reputation, level, isHydrating, error } = useGuildStore();

  return {
    adventurers,
    recruits,
    activeQuests,
    gold,
    reputation,
    level,
    isLoading: isHydrating,
    error,
  };
};
