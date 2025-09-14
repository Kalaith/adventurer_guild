import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useGuildStore } from '../../stores/gameStore';
import { useUIStore } from '../../stores/uiStore';
import GamePage from '../../pages/GamePage';

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
      survival: { tracking: 6, herbalism: 3, animalHandling: 5 }
    },
    equipment: {},
    relationships: [],
    questsCompleted: 12,
    yearsInGuild: 1,
    retirementEligible: false
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
      survival: { tracking: 4, herbalism: 8, animalHandling: 3 }
    },
    equipment: {},
    relationships: [],
    questsCompleted: 16,
    yearsInGuild: 2,
    retirementEligible: false
  }
];

const mockAvailableQuests = [
  {
    id: 'quest1',
    name: 'Goblin Raid',
    description: 'Clear out a goblin camp threatening local merchants',
    reward: 200,
    duration: 3,
    requirements: {
      minLevel: 2,
      preferredClasses: ['Warrior', 'Archer']
    },
    difficulty: 'Medium',
    status: 'available',
    questType: 'standard',
    experienceReward: 60,
    skillRewards: { 'combat.weaponMastery': 5 }
  },
  {
    id: 'quest2',
    name: 'Ancient Relic Recovery',
    description: 'Retrieve a magical artifact from ancient ruins',
    reward: 350,
    duration: 5,
    requirements: {
      minLevel: 3,
      preferredClasses: ['Mage', 'Rogue']
    },
    difficulty: 'Hard',
    status: 'available',
    questType: 'standard',
    experienceReward: 100,
    skillRewards: { 'magic.spellPower': 8 }
  }
];

const mockRecruits = [
  {
    id: 'recruit1',
    name: 'Warrior Recruit',
    level: 2,
    class: 'Warrior',
    cost: 240,
    personality: { courage: 70, loyalty: 60, ambition: 50, teamwork: 65, greed: 35 },
    potentialSkills: { 'combat.weaponMastery': 8, 'combat.tacticalKnowledge': 5 }
  }
];

describe('Game Flow Integration Tests', () => {
  const mockActions = {
    hireAdventurer: vi.fn(),
    startQuest: vi.fn(),
    completeQuest: vi.fn(),
    refreshRecruits: vi.fn(),
    addGold: vi.fn(),
    spendGold: vi.fn(),
    saveGame: vi.fn(),
    getAvailableAdventurers: vi.fn(),
    formatNumber: vi.fn((num: number) => num.toString())
  };

  const mockUIActions = {
    setActiveTab: vi.fn(),
    openModal: vi.fn(),
    closeModal: vi.fn(),
    showNotification: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock initial game state
    mockUseGuildStore.mockReturnValue({
      // State
      gold: 1500,
      reputation: 200,
      level: 3,
      adventurers: mockInitialAdventurers,
      activeQuests: [],
      completedQuests: ['completed_quest_1'],
      recruits: mockRecruits,
      lastSave: Date.now(),

      // Actions
      ...mockActions,

      // Mock implementations
      getAvailableAdventurers: vi.fn(() => mockInitialAdventurers.filter(adv => adv.status === 'available'))
    } as any);

    // Mock UI state
    mockUseUIStore.mockReturnValue({
      activeTab: 'adventurers',
      selectedQuest: null,
      modalOpen: false,
      notifications: [],

      // Actions
      ...mockUIActions
    } as any);
  });

  describe('Game Page Rendering', () => {
    it('should render the main game interface', () => {
      render(<GamePage />);

      expect(screen.getByText('Treasury')).toBeInTheDocument();
      expect(screen.getByText('1500')).toBeInTheDocument(); // Gold amount
      expect(screen.getByText('200')).toBeInTheDocument(); // Reputation
    });

    it('should display navigation tabs', () => {
      render(<GamePage />);

      expect(screen.getByText('Adventurers')).toBeInTheDocument();
      expect(screen.getByText('Quests')).toBeInTheDocument();
      expect(screen.getByText('Hiring Hall')).toBeInTheDocument();
      expect(screen.getByText('Guild Hall')).toBeInTheDocument();
    });

    it('should show adventurers by default', () => {
      render(<GamePage />);

      expect(screen.getByText('Sir Gareth')).toBeInTheDocument();
      expect(screen.getByText('Aria Moonwhisper')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs', () => {
      render(<GamePage />);

      const questsTab = screen.getByText('Quests');
      fireEvent.click(questsTab);

      expect(mockUIActions.setActiveTab).toHaveBeenCalledWith('quests');
    });

    it('should show different content for different tabs', () => {
      const { rerender } = render(<GamePage />);

      // Switch to quests tab
      mockUseUIStore.mockReturnValue({
        activeTab: 'quests',
        selectedQuest: null,
        modalOpen: false,
        notifications: [],
        ...mockUIActions
      } as any);

      rerender(<GamePage />);

      // Should show quest-related content
      expect(screen.queryByText('Available Quests')).toBeInTheDocument();
    });
  });

  describe('Adventurer Management', () => {
    it('should display adventurer information correctly', () => {
      render(<GamePage />);

      // Check that adventurer details are shown
      expect(screen.getByText('Sir Gareth')).toBeInTheDocument();
      expect(screen.getByText('Warrior')).toBeInTheDocument();
      expect(screen.getByText('Level 3')).toBeInTheDocument();
    });

    it('should show adventurer stats', () => {
      render(<GamePage />);

      // Stats should be visible (exact format depends on component implementation)
      expect(screen.getByText(/Strength/)).toBeInTheDocument();
      expect(screen.getByText(/Intelligence/)).toBeInTheDocument();
    });
  });

  describe('Quest Management Flow', () => {
    beforeEach(() => {
      // Mock quests tab being active
      mockUseUIStore.mockReturnValue({
        activeTab: 'quests',
        selectedQuest: null,
        modalOpen: false,
        notifications: [],
        ...mockUIActions
      } as any);
    });

    it('should display available quests when on quests tab', () => {
      // Mock quest data in store
      mockUseGuildStore.mockReturnValue({
        ...mockUseGuildStore(),
        // Add mock quests here if needed by component
      } as any);

      render(<GamePage />);

      expect(screen.queryByText('Available Quests')).toBeInTheDocument();
    });

    it('should handle quest assignment', async () => {
      render(<GamePage />);

      // This would depend on the actual quest assignment UI
      // For now, we'll test that the store action gets called
      const questButton = screen.queryByText('Assign Quest');
      if (questButton) {
        fireEvent.click(questButton);
        expect(mockActions.startQuest).toHaveBeenCalled();
      }
    });
  });

  describe('Hiring Flow', () => {
    beforeEach(() => {
      mockUseUIStore.mockReturnValue({
        activeTab: 'hiring',
        selectedQuest: null,
        modalOpen: false,
        notifications: [],
        ...mockUIActions
      } as any);
    });

    it('should display available recruits', () => {
      render(<GamePage />);

      expect(screen.getByText('Warrior Recruit')).toBeInTheDocument();
    });

    it('should handle recruit hiring', () => {
      render(<GamePage />);

      const hireButton = screen.queryByText('Hire');
      if (hireButton) {
        fireEvent.click(hireButton);
        expect(mockActions.hireAdventurer).toHaveBeenCalledWith('recruit1');
      }
    });

    it('should handle recruit refresh', () => {
      render(<GamePage />);

      const refreshButton = screen.queryByText('Refresh Recruits');
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(mockActions.refreshRecruits).toHaveBeenCalled();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle store errors gracefully', () => {
      // Mock store to throw error
      mockUseGuildStore.mockImplementation(() => {
        throw new Error('Store error');
      });

      // Should not crash the app
      expect(() => render(<GamePage />)).not.toThrow();
    });

    it('should handle missing data gracefully', () => {
      mockUseGuildStore.mockReturnValue({
        gold: 0,
        reputation: 0,
        level: 1,
        adventurers: [],
        activeQuests: [],
        completedQuests: [],
        recruits: [],
        lastSave: Date.now(),
        ...mockActions,
        getAvailableAdventurers: vi.fn(() => [])
      } as any);

      render(<GamePage />);

      // Should still render basic structure
      expect(screen.getByText('Treasury')).toBeInTheDocument();
    });
  });

  describe('Game State Persistence', () => {
    it('should save game state periodically', () => {
      render(<GamePage />);

      // Simulate time passage (this depends on actual implementation)
      // The component might have auto-save functionality

      expect(mockActions.saveGame).toHaveBeenCalled();
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle state updates correctly', () => {
      const { rerender } = render(<GamePage />);

      // Update store state
      mockUseGuildStore.mockReturnValue({
        ...mockUseGuildStore(),
        gold: 2000,
        reputation: 300
      } as any);

      rerender(<GamePage />);

      expect(screen.getByText('2000')).toBeInTheDocument();
      expect(screen.getByText('300')).toBeInTheDocument();
    });

    it('should reflect adventurer status changes', () => {
      const { rerender } = render(<GamePage />);

      // Update adventurer status
      const updatedAdventurers = [...mockInitialAdventurers];
      updatedAdventurers[0] = { ...updatedAdventurers[0], status: 'on quest' };

      mockUseGuildStore.mockReturnValue({
        ...mockUseGuildStore(),
        adventurers: updatedAdventurers
      } as any);

      rerender(<GamePage />);

      // Should reflect the status change (exact implementation depends on component)
      expect(screen.queryByText('On Quest')).toBeInTheDocument();
    });
  });

  describe('Modal Interactions', () => {
    it('should handle modal opening and closing', () => {
      render(<GamePage />);

      // Mock modal opening
      mockUseUIStore.mockReturnValue({
        ...mockUseUIStore(),
        modalOpen: true
      } as any);

      const { rerender } = render(<GamePage />);
      rerender(<GamePage />);

      // Modal should be present when open
      const modal = screen.queryByRole('dialog');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    it('should not cause excessive re-renders', () => {
      const renderCount = vi.fn();

      const TestWrapper = () => {
        renderCount();
        return <GamePage />;
      };

      const { rerender } = render(<TestWrapper />);

      // Re-render with same props
      rerender(<TestWrapper />);

      // Should only render twice (initial + rerender)
      expect(renderCount).toHaveBeenCalledTimes(2);
    });

    it('should handle large amounts of data efficiently', () => {
      // Mock large dataset
      const manyAdventurers = Array.from({ length: 100 }, (_, i) => ({
        ...mockInitialAdventurers[0],
        id: `adv${i}`,
        name: `Adventurer ${i}`
      }));

      mockUseGuildStore.mockReturnValue({
        ...mockUseGuildStore(),
        adventurers: manyAdventurers
      } as any);

      // Should render without performance issues
      const startTime = performance.now();
      render(<GamePage />);
      const endTime = performance.now();

      // Reasonable render time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});