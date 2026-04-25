import { create } from 'zustand';
import { formatNumber } from '../utils/formatters';
import type { Adventurer, GuildState, Quest } from '../types/game';
import { guildApi, type ActivityEntry, type SaveSlotMetadata } from '../api/guild';

interface GuildStore extends GuildState {
  availableQuests: Quest[];
  saveSlots: SaveSlotMetadata[];
  activityEntries: ActivityEntry[];
  isHydrating: boolean;
  isSaving: boolean;
  hasHydrated: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  hireAdventurer: (recruitId: string) => Promise<void>;
  refreshRecruits: () => Promise<void>;
  upgradeFacility: (facilityId: string) => Promise<void>;
  craftRecipe: (recipeId: string) => Promise<void>;
  equipInventoryItem: (adventurerId: string, itemId: string) => Promise<void>;
  unequipInventoryItem: (adventurerId: string, slotType: string) => Promise<void>;
  retireAdventurer: (adventurerId: string, role?: string) => Promise<void>;
  startQuest: (questId: string, adventurerIds: string[]) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
  saveSlot: (slotNumber: number, slotName?: string) => Promise<void>;
  loadSlot: (slotNumber: number) => Promise<void>;
  clearError: () => void;
  formatNumber: (num: number) => string;
  getAvailableAdventurers: () => Adventurer[];
  getActiveQuests: () => Quest[];
  resetState: () => void;
}

const createInitialState = (): GuildState & {
  availableQuests: Quest[];
  saveSlots: SaveSlotMetadata[];
  activityEntries: ActivityEntry[];
  isHydrating: boolean;
  isSaving: boolean;
  hasHydrated: boolean;
  error: string | null;
} => ({
  gold: 0,
  reputation: 0,
  level: 1,
  adventurers: [],
  activeQuests: [],
  completedQuests: [],
  recruits: [],
  lastSave: Date.now(),
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
  materialCatalog: [],
  recipeCatalog: [],
  equipmentInventory: [],
  currentSeason: 'spring',
  seasonalQuests: [],
  generation: 1,
  legacyBonuses: {
    experienceMultiplier: 1,
    goldMultiplier: 1,
    reputationMultiplier: 1,
  },
  availableQuests: [],
  saveSlots: [],
  activityEntries: [],
  isHydrating: false,
  isSaving: false,
  hasHydrated: false,
  error: null,
});

const applyGuildSnapshot = (
  state: ReturnType<typeof createInitialState>,
  payload: {
    summary: Awaited<ReturnType<typeof guildApi.getSummary>>;
    roster: Awaited<ReturnType<typeof guildApi.getRoster>>;
    quests: Awaited<ReturnType<typeof guildApi.getQuestBoard>>;
    saveSlots?: SaveSlotMetadata[];
    activityEntries?: ActivityEntry[];
    worldState?: Awaited<ReturnType<typeof guildApi.getWorldState>>;
  }
): ReturnType<typeof createInitialState> => ({
  ...state,
  gold: payload.summary.gold,
  reputation: payload.summary.reputation,
  level: payload.summary.level,
  adventurers: payload.roster.adventurers,
  recruits: payload.roster.recruits,
  activeQuests: payload.quests.activeQuests,
  completedQuests: payload.quests.completedQuests,
  availableQuests: payload.quests.availableQuests,
  saveSlots: payload.saveSlots ?? state.saveSlots,
  activityEntries: payload.activityEntries ?? state.activityEntries,
  campaigns: payload.quests.campaignProgress,
  factions: payload.worldState?.factions ?? state.factions,
  facilities: payload.worldState?.facilities ?? state.facilities,
  worldEvents: payload.worldState?.worldEvents ?? state.worldEvents,
  territories: payload.worldState?.territories ?? state.territories,
  activeVotes: payload.worldState?.activeVotes ?? state.activeVotes,
  retiredAdventurers: payload.worldState?.retiredAdventurers ?? state.retiredAdventurers,
  materials: payload.worldState?.materials ?? state.materials,
  availableRecipes: payload.worldState?.availableRecipes ?? state.availableRecipes,
  materialCatalog: payload.worldState?.materialCatalog ?? state.materialCatalog,
  recipeCatalog: payload.worldState?.recipeCatalog ?? state.recipeCatalog,
  equipmentInventory: payload.worldState?.equipmentInventory ?? state.equipmentInventory,
  seasonalQuests: payload.quests.availableQuests.filter(quest => quest.questType === 'seasonal'),
  currentSeason: payload.summary.currentSeason,
  generation: payload.summary.generation,
  legacyBonuses: payload.summary.legacyBonuses,
  lastSave: payload.summary.lastSave ?? Date.now(),
});

export const useGuildStore = create<GuildStore>()((set, get) => ({
  ...createInitialState(),

  hydrate: async () => {
    set({ isHydrating: true, error: null });

    try {
      const [summary, roster, quests, saveSlots, activityEntries, worldState] = await Promise.all([
        guildApi.getSummary(),
        guildApi.getRoster(),
        guildApi.getQuestBoard(),
        guildApi.listSaveSlots(),
        guildApi.getActivity(),
        guildApi.getWorldState(),
      ]);

      set(state => ({
        ...applyGuildSnapshot(state, { summary, roster, quests, saveSlots, activityEntries, worldState }),
        isHydrating: false,
        hasHydrated: true,
        error: null,
      }));
    } catch (error) {
      set({
        isHydrating: false,
        hasHydrated: true,
        error: error instanceof Error ? error.message : 'Failed to load guild data',
      });
    }
  },

  startQuest: async (questId: string, adventurerIds: string[]) => {
    set({ error: null });

    try {
      await guildApi.assignQuest(questId, adventurerIds);
      await get().hydrate();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start quest',
      });
      throw error;
    }
  },

  hireAdventurer: async (recruitId: string) => {
    set({ error: null });

    try {
      const payload = await guildApi.hireRecruit(recruitId);
      const activityEntries = await guildApi.getActivity();
      set(state => ({
        ...state,
        gold: payload.summary.gold,
        reputation: payload.summary.reputation,
        level: payload.summary.level,
        adventurers: payload.roster.adventurers,
        recruits: payload.roster.recruits,
        activityEntries,
        currentSeason: payload.summary.currentSeason,
        generation: payload.summary.generation,
        legacyBonuses: payload.summary.legacyBonuses,
        lastSave: payload.summary.lastSave ?? Date.now(),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to hire adventurer',
      });
      throw error;
    }
  },

  refreshRecruits: async () => {
    set({ error: null });

    try {
      const payload = await guildApi.refreshRecruits();
      const activityEntries = await guildApi.getActivity();
      set(state => ({
        ...state,
        gold: payload.summary.gold,
        reputation: payload.summary.reputation,
        level: payload.summary.level,
        recruits: payload.roster.recruits,
        activityEntries,
        currentSeason: payload.summary.currentSeason,
        generation: payload.summary.generation,
        legacyBonuses: payload.summary.legacyBonuses,
        lastSave: payload.summary.lastSave ?? Date.now(),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh recruits',
      });
      throw error;
    }
  },

  upgradeFacility: async (facilityId: string) => {
    set({ error: null });

    try {
      await guildApi.upgradeFacility(facilityId);
      await get().hydrate();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to upgrade facility',
      });
      throw error;
    }
  },

  craftRecipe: async (recipeId: string) => {
    set({ error: null });

    try {
      await guildApi.craftRecipe(recipeId);
      await get().hydrate();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to craft recipe',
      });
      throw error;
    }
  },

  equipInventoryItem: async (adventurerId: string, itemId: string) => {
    set({ error: null });

    try {
      const [payload, activityEntries] = await Promise.all([
        guildApi.equipInventoryItem(adventurerId, itemId),
        guildApi.getActivity(),
      ]);

      set(state => ({
        ...state,
        adventurers: payload.roster.adventurers,
        recruits: payload.roster.recruits,
        factions: payload.worldState.factions,
        facilities: payload.worldState.facilities,
        worldEvents: payload.worldState.worldEvents,
        territories: payload.worldState.territories,
        activeVotes: payload.worldState.activeVotes,
        retiredAdventurers: payload.worldState.retiredAdventurers,
        materials: payload.worldState.materials,
        availableRecipes: payload.worldState.availableRecipes,
        materialCatalog: payload.worldState.materialCatalog,
        recipeCatalog: payload.worldState.recipeCatalog,
        equipmentInventory: payload.worldState.equipmentInventory,
        activityEntries,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to equip inventory item',
      });
      throw error;
    }
  },

  unequipInventoryItem: async (adventurerId: string, slotType: string) => {
    set({ error: null });

    try {
      const [payload, activityEntries] = await Promise.all([
        guildApi.unequipInventoryItem(adventurerId, slotType),
        guildApi.getActivity(),
      ]);

      set(state => ({
        ...state,
        adventurers: payload.roster.adventurers,
        recruits: payload.roster.recruits,
        factions: payload.worldState.factions,
        facilities: payload.worldState.facilities,
        worldEvents: payload.worldState.worldEvents,
        territories: payload.worldState.territories,
        activeVotes: payload.worldState.activeVotes,
        retiredAdventurers: payload.worldState.retiredAdventurers,
        materials: payload.worldState.materials,
        availableRecipes: payload.worldState.availableRecipes,
        materialCatalog: payload.worldState.materialCatalog,
        recipeCatalog: payload.worldState.recipeCatalog,
        equipmentInventory: payload.worldState.equipmentInventory,
        activityEntries,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to unequip inventory item',
      });
      throw error;
    }
  },

  retireAdventurer: async (adventurerId: string, role?: string) => {
    set({ error: null });

    try {
      const [payload, activityEntries] = await Promise.all([
        guildApi.retireAdventurer(adventurerId, role),
        guildApi.getActivity(),
      ]);

      set(state => ({
        ...state,
        gold: payload.summary.gold,
        reputation: payload.summary.reputation,
        level: payload.summary.level,
        adventurers: payload.roster.adventurers,
        recruits: payload.roster.recruits,
        factions: payload.worldState.factions,
        facilities: payload.worldState.facilities,
        worldEvents: payload.worldState.worldEvents,
        territories: payload.worldState.territories,
        activeVotes: payload.worldState.activeVotes,
        retiredAdventurers: payload.worldState.retiredAdventurers,
        materials: payload.worldState.materials,
        availableRecipes: payload.worldState.availableRecipes,
        materialCatalog: payload.worldState.materialCatalog,
        recipeCatalog: payload.worldState.recipeCatalog,
        equipmentInventory: payload.worldState.equipmentInventory,
        activityEntries,
        currentSeason: payload.summary.currentSeason,
        generation: payload.summary.generation,
        legacyBonuses: payload.summary.legacyBonuses,
        lastSave: payload.summary.lastSave ?? Date.now(),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to retire adventurer',
      });
      throw error;
    }
  },

  completeQuest: async (questId: string) => {
    set({ error: null });

    try {
      const payload = await guildApi.resolveQuest(questId);
      const activityEntries = await guildApi.getActivity();
      set(state => ({
        ...applyGuildSnapshot(state, { ...payload, activityEntries }),
        error: null,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to resolve quest',
      });
      throw error;
    }
  },

  saveSlot: async (slotNumber: number, slotName?: string) => {
    set({ isSaving: true, error: null });

    try {
      await guildApi.saveSlot(slotNumber, slotName);
      const [saveSlots, activityEntries] = await Promise.all([guildApi.listSaveSlots(), guildApi.getActivity()]);
      set({ isSaving: false, saveSlots, activityEntries });
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : 'Failed to save slot',
      });
      throw error;
    }
  },

  loadSlot: async (slotNumber: number) => {
    set({ isHydrating: true, error: null });

    try {
      await guildApi.loadSlot(slotNumber);
      await get().hydrate();
    } catch (error) {
      set({
        isHydrating: false,
        error: error instanceof Error ? error.message : 'Failed to load slot',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  formatNumber: (num: number) => formatNumber(num),

  getAvailableAdventurers: () => get().adventurers.filter(adventurer => adventurer.status === 'available'),

  getActiveQuests: () => get().activeQuests,

  resetState: () => set(createInitialState()),
}));

export const rehydrateGuildStore = async (): Promise<void> => {
  useGuildStore.getState().resetState();
};
