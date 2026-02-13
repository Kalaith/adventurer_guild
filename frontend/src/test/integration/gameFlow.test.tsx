import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { useGuildStore } from '../../stores/gameStore';
import { useUIStore } from '../../stores/uiStore';
import { GamePage } from '../../pages/GamePage';

// Mock all external dependencies
vi.mock('../../stores/gameStore');
vi.mock('../../stores/uiStore');

const mockUseGuildStore = vi.mocked(useGuildStore);
const mockUseUIStore = vi.mocked(useUIStore);

// Mock data
const mockInitialAdventurers = [
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
  {
    id: 'adv2',
    name: 'Aria Moonwhisper',
    class: 'Mage',
    rank: 'Expert',
    level: 4,
    experience: 380,
    status: 'available',
    stats: { strength: 10, intelligence: 22, dexterity: 16, vitality: 18 },
    personality: { courage: 65, loyalty: 85, ambition: 70, teamwork: 80, greed: 25 },
    skills: {
      combat: { weaponMastery: 4, tacticalKnowledge: 10, battleRage: 2 },
      magic: { spellPower: 18, manaEfficiency: 15, elementalMastery: 12 },
      stealth: { lockpicking: 1, sneaking: 6, assassination: 0 },
      survival: { tracking: 4, herbalism: 8, animalHandling: 3 },
    },
    equipment: {},
    relationships: [],
    questsCompleted: 16,
    yearsInGuild: 2,
    retirementEligible: false,
  },
];

// const mockAvailableQuests = [
//   {
//     id: 'quest1',
//     name: 'Goblin Raid',
//     description: 'Clear out a goblin camp threatening local merchants',
//     reward: 200,
//     duration: 3,
//     requirements: {
//       minLevel: 2,
//       preferredClasses: ['Warrior', 'Archer']
//     },
//     difficulty: 'Medium',
//     status: 'available',
//     questType: 'standard',
//     experienceReward: 60,
//     skillRewards: { 'combat.weaponMastery': 5 }
//   },
//   {
//     id: 'quest2',
//     name: 'Ancient Relic Recovery',
//     description: 'Retrieve a magical artifact from ancient ruins',
//     reward: 350,
//     duration: 5,
//     requirements: {
//       minLevel: 3,
//       preferredClasses: ['Mage', 'Rogue']
//     },
//     difficulty: 'Hard',
//     status: 'available',
//     questType: 'standard',
//     experienceReward: 100,
//     skillRewards: { 'magic.spellPower': 8 }
//   }
// ];

const mockRecruits = [
  {
    id: 'recruit1',
    name: 'Warrior Recruit',
    level: 2,
    class: 'Warrior',
    cost: 240,
    personality: { courage: 70, loyalty: 60, ambition: 50, teamwork: 65, greed: 35 },
    potentialSkills: { 'combat.weaponMastery': 8, 'combat.tacticalKnowledge': 5 },
  },
];

interface MockGameState {
  gold: number;
  adventurers: typeof mockInitialAdventurers;
  activeQuests: unknown[];
  recruits: typeof mockRecruits;
  hireAdventurer: () => void;
  startQuest: () => void;
  completeQuest: () => void;
  refreshRecruits: () => void;
  spendGold: () => void;
}

describe('Game Flow Integration Tests', () => {
  const mockActions = {
    hireAdventurer: vi.fn(),
    startQuest: vi.fn(),
    completeQuest: vi.fn(),
    refreshRecruits: vi.fn(),
    spendGold: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock initial game state with simplified data
    mockUseGuildStore.mockReturnValue({
      // State
      gold: 1500,
      adventurers: mockInitialAdventurers.slice(0, 1), // Reduce data size
      activeQuests: [],
      recruits: mockRecruits.slice(0, 1), // Reduce data size

      // Actions
      ...mockActions,
    } as MockGameState);

    // Mock UI store as empty since GamePage doesn't seem to use it directly
    mockUseUIStore.mockReturnValue({} as Record<string, unknown>);
  });

  describe('Game Page Rendering', () => {
    it('should render without crashing', () => {
      expect(() => render(<GamePage />)).not.toThrow();
    });

    it('should contain main game elements', () => {
      render(<GamePage />);

      // Check for basic structure elements
      const mainContent = document.querySelector('.main-content');
      expect(mainContent).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing data gracefully', () => {
      mockUseGuildStore.mockReturnValue({
        gold: 0,
        adventurers: [],
        activeQuests: [],
        recruits: [],
        ...mockActions,
      } as MockGameState);

      expect(() => render(<GamePage />)).not.toThrow();
    });
  });
});
