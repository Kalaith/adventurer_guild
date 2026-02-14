import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

// Mock implementations for common utilities
export const createMockAdventurer = (overrides = {}) => ({
  id: 'test-adventurer',
  name: 'Test Hero',
  class: 'Warrior',
  rank: 'Novice',
  level: 1,
  experience: 0,
  status: 'available',
  stats: {
    strength: 15,
    intelligence: 10,
    dexterity: 12,
    vitality: 18,
  },
  personality: {
    courage: 50,
    loyalty: 50,
    ambition: 50,
    teamwork: 50,
    greed: 50,
  },
  skills: {
    combat: { weaponMastery: 0, tacticalKnowledge: 0, battleRage: 0 },
    magic: { spellPower: 0, manaEfficiency: 0, elementalMastery: 0 },
    stealth: { lockpicking: 0, sneaking: 0, assassination: 0 },
    survival: { tracking: 0, herbalism: 0, animalHandling: 0 },
  },
  equipment: {},
  relationships: [],
  questsCompleted: 0,
  yearsInGuild: 0,
  retirementEligible: false,
  ...overrides,
});

export const createMockQuest = (overrides = {}) => ({
  id: 'test-quest',
  name: 'Test Quest',
  description: 'A test quest for testing purposes',
  reward: 100,
  duration: 2,
  requirements: {
    minLevel: 1,
    preferredClasses: ['Warrior'],
  },
  difficulty: 'Easy',
  status: 'available',
  questType: 'standard',
  experienceReward: 50,
  skillRewards: {
    'combat.weaponMastery': 5,
  },
  ...overrides,
});

export const createMockRecruit = (overrides = {}) => ({
  id: 'test-recruit',
  name: 'Test Recruit',
  level: 1,
  class: 'Warrior',
  cost: 120,
  personality: {
    courage: 50,
    loyalty: 50,
    ambition: 50,
    teamwork: 50,
    greed: 50,
  },
  potentialSkills: {
    'combat.weaponMastery': 5,
  },
  ...overrides,
});

// Mock store states
export const createMockGameState = (overrides = {}) => ({
  gold: 1000,
  reputation: 0,
  level: 1,
  adventurers: [],
  activeQuests: [],
  completedQuests: [],
  recruits: [],
  lastSave: Date.now(),
  ...overrides,
});

export const createMockUIState = (overrides = {}) => ({
  activeTab: 'adventurers',
  selectedQuest: null,
  modalOpen: false,
  notifications: [],
  ...overrides,
});

// Mock store actions
export const createMockGameActions = () => ({
  hireAdventurer: vi.fn(),
  startQuest: vi.fn(),
  completeQuest: vi.fn(),
  refreshRecruits: vi.fn(),
  addGold: vi.fn(),
  spendGold: vi.fn(),
  calculateRecruitCost: vi.fn(),
  calculateQuestReward: vi.fn(),
  getAvailableAdventurers: vi.fn(() => []),
  getActiveQuests: vi.fn(() => []),
  formatNumber: vi.fn((num: number) => num.toString()),
  saveGame: vi.fn(),
});

export const createMockUIActions = () => ({
  setActiveTab: vi.fn(),
  openModal: vi.fn(),
  closeModal: vi.fn(),
  showNotification: vi.fn(),
  clearNotifications: vi.fn(),
});

// Custom render function that includes providers if needed
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Utility functions for testing
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

export const simulateTimePassage = (milliseconds: number) => {
  vi.advanceTimersByTime(milliseconds);
};

// Mock data generators
export const generateMockAdventurers = (count: number) => {
  const classes = ['Warrior', 'Mage', 'Rogue', 'Archer'] as const;

  return Array.from({ length: count }, (_, i) =>
    createMockAdventurer({
      id: `adventurer-${i}`,
      name: `Hero ${i}`,
      class: classes[i % classes.length],
      level: Math.floor(Math.random() * 10) + 1,
    })
  );
};

export const generateMockQuests = (count: number) => {
  const difficulties = ['Easy', 'Medium', 'Hard', 'Epic'] as const;

  return Array.from({ length: count }, (_, i) =>
    createMockQuest({
      id: `quest-${i}`,
      name: `Quest ${i}`,
      difficulty: difficulties[i % difficulties.length],
      reward: (i + 1) * 100,
    })
  );
};

// Test helpers for specific scenarios
export const mockSuccessfulQuestCompletion = () => {
  return {
    reward: 200,
    experience: 50,
    reputation: 20,
    items: [],
  };
};

export const mockFailedQuestAttempt = () => {
  return {
    reason: 'insufficient_requirements',
    message: 'Adventurer does not meet quest requirements',
  };
};

// Performance testing utilities
export const measureRenderTime = (renderFn: () => void): number => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

// Accessibility testing helpers
export const checkAccessibilityAttributes = (element: HTMLElement) => {
  const checks = {
    hasAriaLabel: element.hasAttribute('aria-label'),
    hasAriaDescribedBy: element.hasAttribute('aria-describedby'),
    hasRole: element.hasAttribute('role'),
    hasTabIndex: element.hasAttribute('tabindex'),
  };

  return checks;
};
