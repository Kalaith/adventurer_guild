import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GuildState, Adventurer, Quest, Recruit } from '../types/game';
import { GUILD_CONSTANTS } from '../constants/gameConstants';
import { getQuestById } from '../data/quests';
import { INITIAL_ADVENTURERS } from '../data/adventurers';
import { formatNumber } from '../utils/formatters';

interface GuildStore extends GuildState {
  // Actions
  hireAdventurer: (recruitId: string) => void;
  startQuest: (questId: string, adventurerIds: string[]) => void;
  completeQuest: (questId: string) => void;
  refreshRecruits: () => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;

  // Calculations
  calculateRecruitCost: (level: number) => number;
  calculateQuestReward: (quest: Quest) => number;
  getAvailableAdventurers: () => Adventurer[];
  getActiveQuests: () => Quest[];

  // Utilities
  formatNumber: (num: number) => string;
  saveGame: () => void;
}

export const useGuildStore = create<GuildStore>()(
  persist(
    (set, get) => ({
      // Initial state
      gold: 1000,
      reputation: 0,
      level: 1,
      adventurers: INITIAL_ADVENTURERS,
      activeQuests: [],
      completedQuests: [],
      recruits: [],
      lastSave: Date.now(),

      hireAdventurer: (recruitId: string) => {
        const state = get();
        const recruit = state.recruits.find(r => r.id === recruitId);

        if (!recruit) return;

        if (state.adventurers.length >= GUILD_CONSTANTS.MAX_ADVENTURERS) {
          console.warn('Maximum adventurers reached');
          return;
        }

        if (!state.spendGold(recruit.cost)) {
          console.warn('Not enough gold');
          return;
        }

        const newAdventurer: Adventurer = {
          id: recruit.id,
          name: recruit.name,
          class: recruit.class,
          rank: 'Novice',
          level: recruit.level,
          experience: 0,
          status: 'available',
          stats: {
            strength: recruit.level * 10,
            intelligence: recruit.level * 10,
            dexterity: recruit.level * 10,
            vitality: recruit.level * 10,
          }
        };

        set((prevState) => ({
          adventurers: [...prevState.adventurers, newAdventurer],
          recruits: prevState.recruits.filter(r => r.id !== recruitId)
        }));
      },

      startQuest: (questId: string, adventurerIds: string[]) => {
        const state = get();
        const quest = getQuestById(questId);

        if (!quest) {
          console.warn('Quest not found');
          return;
        }

        const availableAdventurers = state.getAvailableAdventurers();
        const selectedAdventurers = availableAdventurers.filter(a => adventurerIds.includes(a.id));

        if (selectedAdventurers.length === 0) {
          console.warn('No available adventurers selected');
          return;
        }

        const questWithAdventurers: Quest = {
          ...quest,
          assignedAdventurers: adventurerIds,
          status: 'active'
        };

        set((prevState) => ({
          activeQuests: [...prevState.activeQuests, questWithAdventurers],
          adventurers: prevState.adventurers.map(adv =>
            adventurerIds.includes(adv.id)
              ? { ...adv, status: 'on quest' }
              : adv
          )
        }));
      },

      completeQuest: (questId: string) => {
        const state = get();
        const quest = state.activeQuests.find(q => q.id === questId);

        if (!quest) return;

        const reward = state.calculateQuestReward(quest);
        const xpReward = quest.requirements.minLevel * GUILD_CONSTANTS.EXPERIENCE_PER_QUEST_LEVEL;

        set((prevState) => ({
          gold: prevState.gold + reward,
          reputation: prevState.reputation + Math.floor(reward / 10),
          activeQuests: prevState.activeQuests.filter(q => q.id !== questId),
          completedQuests: [...prevState.completedQuests, questId],
          adventurers: prevState.adventurers.map(adv =>
            quest.assignedAdventurers?.includes(adv.id)
              ? {
                  ...adv,
                  status: 'available',
                  experience: adv.experience + xpReward,
                  level: adv.experience + xpReward >= adv.level * 100
                    ? adv.level + 1
                    : adv.level
                }
              : adv
          )
        }));
      },

      refreshRecruits: () => {
        if (!get().spendGold(GUILD_CONSTANTS.RECRUIT_REFRESH_COST)) {
          console.warn('Not enough gold to refresh recruits');
          return;
        }

        const newRecruits: Recruit[] = [];
        for (let i = 0; i < 3; i++) {
          const level = Math.floor(Math.random() * 5) + 1;
          const classType = GUILD_CONSTANTS.RECRUIT_CLASSES[Math.floor(Math.random() * GUILD_CONSTANTS.RECRUIT_CLASSES.length)];
          const cost = get().calculateRecruitCost(level);

          newRecruits.push({
            id: `recruit_${Date.now()}_${i}`,
            name: `${classType} ${level}`,
            level,
            class: classType,
            cost
          });
        }

        set({ recruits: newRecruits });
      },

      addGold: (amount: number) => {
        set((state) => ({ gold: state.gold + amount }));
      },

      spendGold: (amount: number) => {
        const state = get();
        if (state.gold >= amount) {
          set({ gold: state.gold - amount });
          return true;
        }
        return false;
      },

      calculateRecruitCost: (level: number) => {
        return Math.floor(GUILD_CONSTANTS.RECRUIT_BASE_COST * Math.pow(GUILD_CONSTANTS.RECRUIT_COST_MULTIPLIER, level - 1));
      },

      calculateQuestReward: (quest: Quest) => {
        const baseReward = quest.requirements.minLevel * GUILD_CONSTANTS.GOLD_PER_QUEST_LEVEL;
        const difficultyMultiplier = quest.difficulty === 'Easy' ? 1 : quest.difficulty === 'Medium' ? 1.5 : 2;
        return Math.floor(baseReward * difficultyMultiplier);
      },

      getAvailableAdventurers: () => {
        return get().adventurers.filter(adv => adv.status === 'available');
      },

      getActiveQuests: () => {
        return get().activeQuests;
      },

      formatNumber: (num: number) => {
        return formatNumber(num);
      },

      saveGame: () => {
        set({ lastSave: Date.now() });
      },
    }),
    {
      name: 'adventurer-guild',
      partialize: (state) => ({
        gold: state.gold,
        reputation: state.reputation,
        level: state.level,
        adventurers: state.adventurers,
        activeQuests: state.activeQuests,
        completedQuests: state.completedQuests,
        lastSave: state.lastSave,
      }),
    }
  )
);
