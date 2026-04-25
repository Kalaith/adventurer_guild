import { apiClient } from './apiClient';
import type { Adventurer, Campaign, CraftingMaterial, CraftingRecipe, Faction, GuildFacility, GuildVote, Quest, Recruit, RetiredAdventurer, Territory, WorldEvent } from '../types/game';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface SummaryResponse {
  gold: number;
  reputation: number;
  level: number;
  currentSeason: string;
  generation: number;
  legacyBonuses: {
    experienceMultiplier: number;
    goldMultiplier: number;
    reputationMultiplier: number;
  };
  lastSave: number | null;
  activeQuestCount: number;
  completedQuestCount: number;
}

interface RosterResponse {
  adventurers: Adventurer[];
  recruits: Recruit[];
}

interface QuestBoardResponse {
  availableQuests: Quest[];
  activeQuests: Quest[];
  completedQuests: string[];
  campaignProgress: Campaign[];
}

interface WorldStateResponse {
  factions: Faction[];
  facilities: GuildFacility[];
  worldEvents: WorldEvent[];
  territories: Territory[];
  activeVotes: GuildVote[];
  retiredAdventurers: RetiredAdventurer[];
  materials: Record<string, number>;
  materialCatalog: CraftingMaterial[];
  availableRecipes: string[];
  recipeCatalog: Array<CraftingRecipe & { unlocked?: boolean }>;
  equipmentInventory: Array<CraftingRecipe['result']>;
}

interface WorldActionResponse {
  summary: SummaryResponse;
  worldState: WorldStateResponse;
}

interface EquipmentActionResponse {
  roster: RosterResponse;
  worldState: WorldStateResponse;
}

interface AdventurerActionResponse {
  summary: SummaryResponse;
  roster: RosterResponse;
  worldState: WorldStateResponse;
}

interface ResolveQuestResponse {
  summary: SummaryResponse;
  roster: RosterResponse;
  quests: QuestBoardResponse;
}

interface RecruitResponse {
  summary: SummaryResponse;
  roster: RosterResponse;
}

export interface SaveSlotMetadata {
  slotNumber: number;
  slotName: string;
  version: string;
  updatedAt: number | null;
  createdAt: number | null;
  metadata: {
    adventurerCount?: number;
    activeQuestCount?: number;
    completedQuestCount?: number;
  };
}

export interface ActivityEntry {
  id: number;
  eventType: string;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: number | null;
}

const unwrap = <T,>(payload: ApiEnvelope<T>): T => {
  if (!payload.success) {
    throw new Error(payload.error || 'Request failed');
  }

  return payload.data;
};

const normalizeQuest = (quest: Quest): Quest => ({
  ...quest,
  durationMs: quest.durationMs ?? (quest.duration * 1000),
  remainingMs: quest.remainingMs ?? null,
  canResolve: quest.canResolve ?? false,
});

const normalizeQuestBoard = (payload: QuestBoardResponse): QuestBoardResponse => ({
  ...payload,
  availableQuests: payload.availableQuests.map(normalizeQuest),
  activeQuests: payload.activeQuests.map(normalizeQuest),
});

const normalizeResolveQuest = (payload: ResolveQuestResponse): ResolveQuestResponse => ({
  ...payload,
  quests: normalizeQuestBoard(payload.quests),
});

export const guildApi = {
  async getSummary(): Promise<SummaryResponse> {
    const response = await apiClient.get<ApiEnvelope<SummaryResponse>>('/api/guild/summary');
    return unwrap(response.data);
  },

  async getRoster(): Promise<RosterResponse> {
    const response = await apiClient.get<ApiEnvelope<RosterResponse>>('/api/guild/roster');
    return unwrap(response.data);
  },

  async getActivity(): Promise<ActivityEntry[]> {
    const response = await apiClient.get<ApiEnvelope<ActivityEntry[]>>('/api/guild/activity');
    return unwrap(response.data);
  },

  async getWorldState(): Promise<WorldStateResponse> {
    const response = await apiClient.get<ApiEnvelope<WorldStateResponse>>('/api/guild/world-state');
    return unwrap(response.data);
  },

  async upgradeFacility(facilityId: string): Promise<WorldActionResponse> {
    const response = await apiClient.post<ApiEnvelope<WorldActionResponse>>('/api/guild/facilities/upgrade', {
      facility_id: facilityId,
    });
    return unwrap(response.data);
  },

  async craftRecipe(recipeId: string): Promise<WorldActionResponse> {
    const response = await apiClient.post<ApiEnvelope<WorldActionResponse>>('/api/guild/crafting/craft', {
      recipe_id: recipeId,
    });
    return unwrap(response.data);
  },

  async equipInventoryItem(adventurerId: string, itemId: string): Promise<EquipmentActionResponse> {
    const response = await apiClient.post<ApiEnvelope<EquipmentActionResponse>>('/api/guild/equipment/equip', {
      adventurer_id: adventurerId,
      item_id: itemId,
    });
    return unwrap(response.data);
  },

  async unequipInventoryItem(adventurerId: string, slotType: string): Promise<EquipmentActionResponse> {
    const response = await apiClient.post<ApiEnvelope<EquipmentActionResponse>>('/api/guild/equipment/unequip', {
      adventurer_id: adventurerId,
      slot_type: slotType,
    });
    return unwrap(response.data);
  },

  async retireAdventurer(adventurerId: string, role?: string): Promise<AdventurerActionResponse> {
    const response = await apiClient.post<ApiEnvelope<AdventurerActionResponse>>('/api/guild/adventurers/retire', {
      adventurer_id: adventurerId,
      role,
    });
    return unwrap(response.data);
  },

  async getQuestBoard(): Promise<QuestBoardResponse> {
    const response = await apiClient.get<ApiEnvelope<QuestBoardResponse>>('/api/guild/quests');
    return normalizeQuestBoard(unwrap(response.data));
  },

  async assignQuest(questId: string, adventurerIds: string[]): Promise<QuestBoardResponse> {
    const response = await apiClient.post<ApiEnvelope<QuestBoardResponse>>('/api/guild/quests/assign', {
      quest_id: questId,
      adventurer_ids: adventurerIds,
    });

    return normalizeQuestBoard(unwrap(response.data));
  },

  async resolveQuest(questId: string): Promise<ResolveQuestResponse> {
    const response = await apiClient.post<ApiEnvelope<ResolveQuestResponse>>('/api/guild/quests/resolve', {
      quest_id: questId,
    });

    return normalizeResolveQuest(unwrap(response.data));
  },

  async refreshRecruits(): Promise<RecruitResponse> {
    const response = await apiClient.post<ApiEnvelope<RecruitResponse>>('/api/guild/recruits/refresh');
    return unwrap(response.data);
  },

  async hireRecruit(recruitId: string): Promise<RecruitResponse> {
    const response = await apiClient.post<ApiEnvelope<RecruitResponse>>('/api/guild/recruits/hire', {
      recruit_id: recruitId,
    });

    return unwrap(response.data);
  },

  async saveSlot(slotNumber: number, slotName?: string): Promise<void> {
    const response = await apiClient.post<ApiEnvelope<unknown>>(`/api/guild/save-slots/${slotNumber}`, {
      slot_name: slotName,
    });

    unwrap(response.data);
  },

  async loadSlot(slotNumber: number): Promise<void> {
    const response = await apiClient.get<ApiEnvelope<unknown>>(`/api/guild/save-slots/${slotNumber}`);
    unwrap(response.data);
  },

  async listSaveSlots(): Promise<SaveSlotMetadata[]> {
    const response = await apiClient.get<ApiEnvelope<SaveSlotMetadata[]>>('/api/guild/save-slots');
    return unwrap(response.data);
  },
};
