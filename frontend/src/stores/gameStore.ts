import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GuildState, Adventurer, Quest, Recruit } from '../types/game';
import { guildConstants, personalityDefaults, skillDefaults } from '../constants/gameConstants';
import { getQuestById } from '../data/quests';
import { initialAdventurers } from '../data/adventurers';
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

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const randomInt = (minInclusive: number, maxInclusive: number): number => {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
};

const createDefaultSkills = () => ({
  combat: { ...skillDefaults.combat },
  magic: { ...skillDefaults.magic },
  stealth: { ...skillDefaults.stealth },
  survival: { ...skillDefaults.survival },
});

const createDefaultPersonality = () => ({ ...personalityDefaults });

const hasOwn = <T extends object>(obj: T, key: PropertyKey): key is keyof T => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

const applyPotentialSkills = (
  base: Adventurer['skills'],
  potential: Recruit['potentialSkills']
): Adventurer['skills'] => {
  const next = {
    combat: { ...base.combat },
    magic: { ...base.magic },
    stealth: { ...base.stealth },
    survival: { ...base.survival },
  };

  Object.entries(potential).forEach(([key, value]) => {
    const [category, skill] = key.split('.');
    if (!category || !skill) return;

    if (!hasOwn(next, category)) return;
    const categoryObj = next[category] as Record<string, number>;
    if (!Object.prototype.hasOwnProperty.call(categoryObj, skill)) return;
    categoryObj[skill] = value;
  });

  return next;
};

export const useGuildStore = create<GuildStore>()(
  persist(
    (set, get) => ({
      // Initial state
      gold: 1000,
      reputation: 0,
      level: 1,
      adventurers: [...initialAdventurers],
      activeQuests: [],
      completedQuests: [],
      recruits: [],
      lastSave: Date.now(),

      // New features (defaulted; systems can layer on later)
      factions: [],
      facilities: [],
      campaigns: [],
      worldEvents: [],
      rivalGuilds: [],
      territories: [],
      activeVotes: [],
      retiredAdventurers: [],
      materials: {},
      availableRecipes: [],
      currentSeason: 'spring',
      seasonalQuests: [],
      generation: 1,
      legacyBonuses: {
        experienceMultiplier: 1,
        goldMultiplier: 1,
        reputationMultiplier: 1,
      },

      hireAdventurer: (recruitId: string) => {
        const state = get();
        const recruit = state.recruits.find((r) => r.id === recruitId);

        if (!recruit) return;

        if (state.adventurers.length >= guildConstants.MAX_ADVENTURERS) {
          console.warn('Maximum adventurers reached');
          return;
        }

        if (!state.spendGold(recruit.cost)) {
          console.warn('Not enough gold');
          return;
        }

        const baseSkills = createDefaultSkills();
        const skills = applyPotentialSkills(baseSkills, recruit.potentialSkills);

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
          },
          personality: recruit.personality,
          skills,
          equipment: {},
          relationships: [],
          questsCompleted: 0,
          yearsInGuild: 0,
          retirementEligible: false,
        };

        set((prevState) => ({
          adventurers: [...prevState.adventurers, newAdventurer],
          recruits: prevState.recruits.filter((r) => r.id !== recruitId),
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
        const selectedAdventurers = availableAdventurers.filter((a) =>
          adventurerIds.includes(a.id)
        );

        if (selectedAdventurers.length === 0) {
          console.warn('No available adventurers selected');
          return;
        }

        const assignedAdventurerIds = selectedAdventurers.map((a) => a.id);

        const questWithAdventurers: Quest = {
          ...quest,
          assignedAdventurers: assignedAdventurerIds,
          status: 'active',
        };

        set((prevState) => ({
          activeQuests: [...prevState.activeQuests, questWithAdventurers],
          adventurers: prevState.adventurers.map((adv) =>
            assignedAdventurerIds.includes(adv.id) ? { ...adv, status: 'on quest' } : adv
          ),
        }));
      },

      completeQuest: (questId: string) => {
        const state = get();
        const quest = state.activeQuests.find((q) => q.id === questId);

        if (!quest) return;

        const reward = state.calculateQuestReward(quest);
        const xpReward =
          quest.experienceReward ??
          quest.requirements.minLevel * guildConstants.EXPERIENCE_PER_QUEST_LEVEL;

        set((prevState) => ({
          gold: prevState.gold + reward,
          reputation: prevState.reputation + Math.floor(reward / 10),
          activeQuests: prevState.activeQuests.filter((q) => q.id !== questId),
          completedQuests: [...prevState.completedQuests, questId],
          adventurers: prevState.adventurers.map((adv) =>
            quest.assignedAdventurers?.includes(adv.id)
              ? {
                  ...adv,
                  status: 'available',
                  questsCompleted: adv.questsCompleted + 1,
                  experience: adv.experience + xpReward,
                  level: adv.experience + xpReward >= adv.level * 100 ? adv.level + 1 : adv.level,
                }
              : adv
          ),
        }));
      },

      refreshRecruits: () => {
        if (!get().spendGold(guildConstants.RECRUIT_REFRESH_COST)) {
          console.warn('Not enough gold to refresh recruits');
          return;
        }

        const newRecruits: Recruit[] = [];
        for (let i = 0; i < 3; i++) {
          const level = Math.floor(Math.random() * 5) + 1;
          const classType =
            guildConstants.RECRUIT_CLASSES[
              Math.floor(Math.random() * guildConstants.RECRUIT_CLASSES.length)
            ];
          const cost = get().calculateRecruitCost(level);

          const personality = createDefaultPersonality();
          (Object.keys(personality) as Array<keyof typeof personality>).forEach((trait) => {
            personality[trait] = clamp(personality[trait] + randomInt(-15, 15), 0, 100);
          });

          // Sparse potential skill bumps; keys align with Recruit.potentialSkills shape.
          const potentialSkills: Recruit['potentialSkills'] = {};
          const potentialKeys: Array<
            | keyof typeof skillDefaults.combat
            | keyof typeof skillDefaults.magic
            | keyof typeof skillDefaults.stealth
            | keyof typeof skillDefaults.survival
          > = [
            'weaponMastery',
            'tacticalKnowledge',
            'spellPower',
            'elementalMastery',
            'sneaking',
            'lockpicking',
            'tracking',
            'herbalism',
          ];

          for (let j = 0; j < 3; j++) {
            const key = potentialKeys[randomInt(0, potentialKeys.length - 1)];
            const category =
              key in skillDefaults.combat
                ? 'combat'
                : key in skillDefaults.magic
                  ? 'magic'
                  : key in skillDefaults.stealth
                    ? 'stealth'
                    : 'survival';

            potentialSkills[`${category}.${String(key)}`] = randomInt(1, 10);
          }

          newRecruits.push({
            id: `recruit_${Date.now()}_${i}`,
            name: `${classType} ${level}`,
            level,
            class: classType,
            cost,
            personality,
            potentialSkills,
            descendantOf: undefined,
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
        return Math.floor(
          guildConstants.RECRUIT_BASE_COST *
            Math.pow(guildConstants.RECRUIT_COST_MULTIPLIER, level - 1)
        );
      },

      calculateQuestReward: (quest: Quest) => {
        const baseReward = quest.requirements.minLevel * guildConstants.GOLD_PER_QUEST_LEVEL;
        const difficultyMultiplier =
          quest.difficulty === 'Easy' ? 1 : quest.difficulty === 'Medium' ? 1.5 : 2;
        return Math.floor(baseReward * difficultyMultiplier);
      },

      getAvailableAdventurers: () => {
        return get().adventurers.filter((adv) => adv.status === 'available');
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

        // Persisted "extended" state (kept minimal; adjust as these systems land in UI)
        factions: state.factions,
        facilities: state.facilities,
        campaigns: state.campaigns,
        worldEvents: state.worldEvents,
        rivalGuilds: state.rivalGuilds,
        territories: state.territories,
        activeVotes: state.activeVotes,
        retiredAdventurers: state.retiredAdventurers,
        materials: state.materials,
        availableRecipes: state.availableRecipes,
        currentSeason: state.currentSeason,
        seasonalQuests: state.seasonalQuests,
        generation: state.generation,
        legacyBonuses: state.legacyBonuses,
      }),
    }
  )
);
