import { useGuildStore } from '../stores/gameStore';
import { useEffect } from 'react';

export const useGuildData = () => {
  const { adventurers, recruits, activeQuests, gold, reputation, level, refreshRecruits } =
    useGuildStore();

  // Auto-refresh recruits if none are available
  useEffect(() => {
    if (recruits.length === 0 && gold >= 50) {
      refreshRecruits();
    }
  }, [recruits.length, gold, refreshRecruits]);

  return {
    adventurers,
    recruits,
    activeQuests,
    gold,
    reputation,
    level,
    isLoading: false, // For future API integration
    error: null, // For future error handling
  };
};
