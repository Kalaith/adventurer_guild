// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { useGuildStore } from '../../src/stores/gameStore';
import { useUIStore } from '../../src/stores/uiStore';
import { useAuth } from '../../src/contexts/AuthContext';
import { GamePage } from '../../src/pages/GamePage';

vi.mock('../../src/stores/gameStore');
vi.mock('../../src/stores/uiStore');
vi.mock('../../src/contexts/AuthContext');

const mockUseGuildStore = vi.mocked(useGuildStore);
const mockUseUIStore = vi.mocked(useUIStore);
const mockUseAuth = vi.mocked(useAuth);

const mockAdventurers = [
  {
    id: 'adv1',
    name: 'Sir Gareth',
    class: 'Warrior',
    rank: 'Journeyman',
    level: 3,
    experience: 250,
    status: 'available',
    stats: { strength: 18, intelligence: 12, dexterity: 15, vitality: 20 },
    personality: { courage: 80, loyalty: 75, ambition: 60, teamwork: 70, greed: 30 },
    skills: {
      combat: { weaponMastery: 12, tacticalKnowledge: 8, battleRage: 6 },
      magic: { spellPower: 0, manaEfficiency: 0, elementalMastery: 0 },
      stealth: { lockpicking: 2, sneaking: 4, assassination: 1 },
      survival: { tracking: 6, herbalism: 3, animalHandling: 5 },
    },
    equipment: {},
    relationships: [],
    questsCompleted: 12,
    yearsInGuild: 1,
    retirementEligible: false,
  },
];

const mockQuests = [
  {
    id: 'quest1',
    name: 'Goblin Raid',
    description: 'Clear out a goblin camp threatening local merchants',
    reward: 200,
    duration: 1800000,
    requirements: {
      minLevel: 2,
      preferredClasses: ['Warrior', 'Archer'],
    },
    difficulty: 'Medium' as const,
    status: 'available' as const,
    questType: 'standard' as const,
    experienceReward: 60,
  },
];

const baseGuildState = {
  gold: 1500,
  reputation: 20,
  level: 2,
  adventurers: mockAdventurers,
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
  availableQuests: mockQuests,
  saveSlots: [],
  activityEntries: [
    {
      id: 1,
      eventType: 'guild_created',
      title: 'Guild established',
      description: 'A new guild was created.',
      metadata: {},
      createdAt: Date.now(),
    },
  ],
  isHydrating: false,
  isSaving: false,
  hasHydrated: true,
  error: null,
  hydrate: vi.fn().mockResolvedValue(undefined),
  startQuest: vi.fn().mockResolvedValue(undefined),
  completeQuest: vi.fn().mockResolvedValue(undefined),
  upgradeFacility: vi.fn().mockResolvedValue(undefined),
  craftRecipe: vi.fn().mockResolvedValue(undefined),
  equipInventoryItem: vi.fn().mockResolvedValue(undefined),
  unequipInventoryItem: vi.fn().mockResolvedValue(undefined),
  retireAdventurer: vi.fn().mockResolvedValue(undefined),
  saveSlot: vi.fn().mockResolvedValue(undefined),
  loadSlot: vi.fn().mockResolvedValue(undefined),
  clearError: vi.fn(),
  formatNumber: vi.fn((value: number) => String(value)),
  getAvailableAdventurers: vi.fn(() => mockAdventurers),
  getActiveQuests: vi.fn(() => []),
  resetState: vi.fn(),
};

afterEach(() => {
  cleanup();
});

describe('Game Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGuildStore.mockReturnValue(baseGuildState as ReturnType<typeof useGuildStore>);
    mockUseUIStore.mockReturnValue({ activeTab: 'guild-hall' } as ReturnType<typeof useUIStore>);
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      authMode: 'guest',
      user: {
        id: 'guest_test',
        username: 'guest',
        display_name: 'Guest Adventurer',
        email: '',
        role: 'guest',
        is_guest: true,
        auth_type: 'guest',
      },
      continueAsGuest: vi.fn(),
      loginWithRedirect: vi.fn(),
      getLinkAccountUrl: vi.fn(() => '/signup?guest_user_id=guest_test'),
      logout: vi.fn(),
    });
  });

  it('renders without crashing', () => {
    expect(() => render(<GamePage />)).not.toThrow();
  });

  it('contains the main game layout', () => {
    render(<GamePage />);

    expect(document.querySelector('.main-content')).toBeInTheDocument();
  });

  it('handles empty guild data gracefully', () => {
    mockUseGuildStore.mockReturnValue({
      ...baseGuildState,
      gold: 0,
      adventurers: [],
      activeQuests: [],
      completedQuests: [],
      recruits: [],
      availableQuests: [],
      activityEntries: [],
    } as ReturnType<typeof useGuildStore>);

    expect(() => render(<GamePage />)).not.toThrow();
  });
});
