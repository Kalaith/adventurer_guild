import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGuildStore } from '../../src/stores/gameStore';
import { guildApi } from '../../src/api/guild';
import type { Adventurer, Quest } from '../../src/types/game';

vi.mock('../../src/api/guild', () => ({
  guildApi: {
    getSummary: vi.fn(),
    getRoster: vi.fn(),
    getActivity: vi.fn(),
    getWorldState: vi.fn(),
    upgradeFacility: vi.fn(),
    craftRecipe: vi.fn(),
    equipInventoryItem: vi.fn(),
    unequipInventoryItem: vi.fn(),
    retireAdventurer: vi.fn(),
    getQuestBoard: vi.fn(),
    assignQuest: vi.fn(),
    resolveQuest: vi.fn(),
    saveSlot: vi.fn(),
    loadSlot: vi.fn(),
    listSaveSlots: vi.fn(),
  },
}));

const mockAdventurer: Adventurer = {
  id: 'adv_1',
  name: 'Test Hero',
  class: 'Warrior',
  rank: 'Novice',
  level: 2,
  experience: 25,
  status: 'available',
  stats: {
    strength: 12,
    intelligence: 8,
    dexterity: 10,
    vitality: 11,
  },
  personality: {
    courage: 60,
    loyalty: 60,
    ambition: 50,
    teamwork: 55,
    greed: 25,
  },
  skills: {
    combat: { weaponMastery: 4, tacticalKnowledge: 3, battleRage: 1 },
    magic: { spellPower: 0, manaEfficiency: 0, elementalMastery: 0 },
    stealth: { lockpicking: 0, sneaking: 0, assassination: 0 },
    survival: { tracking: 2, herbalism: 0, animalHandling: 1 },
  },
  equipment: {},
  relationships: [],
  questsCompleted: 1,
  yearsInGuild: 0,
  retirementEligible: false,
};

const mockQuest: Quest = {
  id: 'quest_1',
  name: 'Test Quest',
  description: 'Quest description',
  reward: 150,
  duration: 1800000,
  requirements: {
    minLevel: 1,
    preferredClasses: ['Warrior'],
  },
  difficulty: 'Easy',
  status: 'available',
  questType: 'standard',
  experienceReward: 50,
};

const mockSummary = {
  gold: 1000,
  reputation: 20,
  level: 3,
  currentSeason: 'spring',
  generation: 1,
  legacyBonuses: {
    experienceMultiplier: 1,
    goldMultiplier: 1,
    reputationMultiplier: 1,
  },
  lastSave: 123456789,
  activeQuestCount: 0,
  completedQuestCount: 0,
};

const mockRoster = {
  adventurers: [mockAdventurer],
  recruits: [],
};

const mockQuestBoard = {
  availableQuests: [mockQuest],
  activeQuests: [],
  completedQuests: [],
  campaignProgress: [],
};

const mockActivity = [
  {
    id: 1,
    eventType: 'guild_created',
    title: 'Guild established',
    description: 'A new guild was created.',
    metadata: {},
    createdAt: 123456789,
  },
];

const mockWorldState = {
  factions: [
    {
      id: 'merchants_guild',
      name: "Merchants' Guild",
      reputation: 100,
      standingLabel: 'Friendly',
      description: 'Trade bloc',
      questModifiers: {
        rewardMultiplier: 1.2,
        availableQuestTypes: ['merchant_escort'],
      },
    },
  ],
  facilities: [
    {
      id: 'forge',
      name: 'Guild Forge',
      level: 1,
      maxLevel: 5,
      cost: 500,
      benefits: { craftingLevel: 1 },
      description: 'Produces equipment.',
    },
  ],
  worldEvents: [],
  territories: [],
  activeVotes: [],
  retiredAdventurers: [],
  materials: { iron_ore: 0 },
  materialCatalog: [
    {
      id: 'iron_ore',
      name: 'Iron Ore',
      rarity: 'common' as const,
      sources: ['mine_security'],
    },
  ],
  availableRecipes: [],
  recipeCatalog: [],
  equipmentInventory: [],
};

describe('gameStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGuildStore.getState().resetState();

    vi.mocked(guildApi.getSummary).mockResolvedValue(mockSummary);
    vi.mocked(guildApi.getRoster).mockResolvedValue(mockRoster);
    vi.mocked(guildApi.getActivity).mockResolvedValue(mockActivity);
    vi.mocked(guildApi.getWorldState).mockResolvedValue(mockWorldState);
    vi.mocked(guildApi.upgradeFacility).mockResolvedValue({ summary: mockSummary, worldState: mockWorldState });
    vi.mocked(guildApi.craftRecipe).mockResolvedValue({ summary: mockSummary, worldState: mockWorldState });
    vi.mocked(guildApi.equipInventoryItem).mockResolvedValue({ roster: mockRoster, worldState: mockWorldState });
    vi.mocked(guildApi.unequipInventoryItem).mockResolvedValue({ roster: mockRoster, worldState: mockWorldState });
    vi.mocked(guildApi.retireAdventurer).mockResolvedValue({ summary: mockSummary, roster: mockRoster, worldState: mockWorldState });
    vi.mocked(guildApi.getQuestBoard).mockResolvedValue(mockQuestBoard);
    vi.mocked(guildApi.assignQuest).mockResolvedValue({
      ...mockQuestBoard,
      activeQuests: [{ ...mockQuest, status: 'active', assignedAdventurers: [mockAdventurer.id] }],
      availableQuests: [],
    });
    vi.mocked(guildApi.resolveQuest).mockResolvedValue({
      summary: {
        ...mockSummary,
        gold: 1150,
        reputation: 35,
        activeQuestCount: 0,
        completedQuestCount: 1,
      },
      roster: {
        adventurers: [{ ...mockAdventurer, status: 'available', experience: 75, questsCompleted: 2 }],
        recruits: [],
      },
      quests: {
        availableQuests: [],
        activeQuests: [],
        completedQuests: [mockQuest.id],
        campaignProgress: [],
      },
    });
    vi.mocked(guildApi.saveSlot).mockResolvedValue(undefined);
    vi.mocked(guildApi.loadSlot).mockResolvedValue(undefined);
    vi.mocked(guildApi.listSaveSlots).mockResolvedValue([]);
  });

  it('hydrates guild state from the backend', async () => {
    await useGuildStore.getState().hydrate();

    const state = useGuildStore.getState();
    expect(state.gold).toBe(1000);
    expect(state.reputation).toBe(20);
    expect(state.level).toBe(3);
    expect(state.adventurers).toHaveLength(1);
    expect(state.availableQuests).toHaveLength(1);
    expect(state.activityEntries).toHaveLength(1);
    expect(state.factions).toHaveLength(1);
    expect(state.facilities).toHaveLength(1);
    expect(state.materialCatalog).toHaveLength(1);
    expect(state.hasHydrated).toBe(true);
  });

  it('starts a quest through the backend and refreshes the store', async () => {
    await useGuildStore.getState().hydrate();
    await useGuildStore.getState().startQuest(mockQuest.id, [mockAdventurer.id]);

    expect(guildApi.assignQuest).toHaveBeenCalledWith(mockQuest.id, [mockAdventurer.id]);
    expect(guildApi.getSummary).toHaveBeenCalledTimes(2);
    expect(guildApi.getQuestBoard).toHaveBeenCalledTimes(2);
    expect(guildApi.getWorldState).toHaveBeenCalledTimes(2);
  });

  it('resolves a quest through the backend payload', async () => {
    await useGuildStore.getState().completeQuest(mockQuest.id);

    const state = useGuildStore.getState();
    expect(guildApi.resolveQuest).toHaveBeenCalledWith(mockQuest.id);
    expect(guildApi.getActivity).toHaveBeenCalled();
    expect(state.gold).toBe(1150);
    expect(state.completedQuests).toContain(mockQuest.id);
    expect(state.activeQuests).toHaveLength(0);
  });

  it('formats numbers through the shared formatter', () => {
    const { formatNumber } = useGuildStore.getState();

    expect(formatNumber(500)).toBe('500');
    expect(formatNumber(1500)).toBe('1.5K');
  });

  it('resets state when requested', () => {
    useGuildStore.setState({ gold: 999 });

    useGuildStore.getState().resetState();

    expect(useGuildStore.getState().gold).toBe(0);
    expect(useGuildStore.getState().availableQuests).toHaveLength(0);
    expect(useGuildStore.getState().activityEntries).toHaveLength(0);
  });

  it('equips and unequips items through the backend payload', async () => {
    await useGuildStore.getState().equipInventoryItem(mockAdventurer.id, 'item_1');
    expect(guildApi.equipInventoryItem).toHaveBeenCalledWith(mockAdventurer.id, 'item_1');

    await useGuildStore.getState().unequipInventoryItem(mockAdventurer.id, 'weapon');
    expect(guildApi.unequipInventoryItem).toHaveBeenCalledWith(mockAdventurer.id, 'weapon');
  });

  it('retires adventurers through the backend payload', async () => {
    await useGuildStore.getState().retireAdventurer(mockAdventurer.id);
    expect(guildApi.retireAdventurer).toHaveBeenCalledWith(mockAdventurer.id, undefined);
  });
});
