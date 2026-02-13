import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGuildStore } from '../../stores/gameStore';
import { initialAdventurers } from '../../data/adventurers';
import { guildConstants } from '../../constants/gameConstants';
import { questData } from '../../data/quests';

// Mock data
const mockAdventurer = {
  id: 'test-adventurer-1',
  name: 'Test Hero',
  class: 'Warrior' as const,
  rank: 'Novice',
  level: 1,
  experience: 0,
  status: 'available' as const,
  stats: {
    strength: 15,
    intelligence: 10,
    dexterity: 12,
    vitality: 18
  },
  personality: {
    courage: 70,
    loyalty: 60,
    ambition: 50,
    teamwork: 65,
    greed: 30
  },
  skills: {
    combat: { weaponMastery: 5, tacticalKnowledge: 3, battleRage: 2 },
    magic: { spellPower: 0, manaEfficiency: 0, elementalMastery: 0 },
    stealth: { lockpicking: 0, sneaking: 1, assassination: 0 },
    survival: { tracking: 2, herbalism: 1, animalHandling: 3 }
  },
  equipment: {},
  relationships: [],
  questsCompleted: 0,
  yearsInGuild: 0,
  retirementEligible: false
};

const mockRecruit = {
  id: 'test-recruit-1',
  name: 'Test Recruit',
  level: 2,
  class: 'Mage' as const,
  cost: 240,
  personality: {
    courage: 50,
    loyalty: 55,
    ambition: 65,
    teamwork: 60,
    greed: 40
  },
  potentialSkills: {
    'magic.spellPower': 10,
    'magic.elementalMastery': 8,
    'combat.tacticalKnowledge': 5
  }
};

const mockQuest = questData[0];

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGuildStore.setState({
      gold: 1000,
      reputation: 0,
      level: 1,
      adventurers: [...initialAdventurers],
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
      currentSeason: 'spring',
      seasonalQuests: [],
      generation: 1,
      legacyBonuses: {
        experienceMultiplier: 1,
        goldMultiplier: 1,
        reputationMultiplier: 1,
      },
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useGuildStore.getState();

      expect(state.gold).toBe(1000);
      expect(state.reputation).toBe(0);
      expect(state.level).toBe(1);
      expect(state.adventurers).toHaveLength(initialAdventurers.length);
      expect(state.activeQuests).toHaveLength(0);
      expect(state.completedQuests).toHaveLength(0);
      expect(state.recruits).toHaveLength(0);
    });

    it('should have initial adventurers from data', () => {
      const state = useGuildStore.getState();

      expect(state.adventurers[0].name).toBe('Thrain Ironfist');
      expect(state.adventurers[0].class).toBe('Warrior');
      expect(state.adventurers[1].name).toBe('Elara Stormweaver');
      expect(state.adventurers[1].class).toBe('Mage');
    });
  });

  describe('gold management', () => {
    it('should add gold correctly', () => {
      const { addGold } = useGuildStore.getState();

      addGold(500);

      expect(useGuildStore.getState().gold).toBe(1500);
    });

    it('should spend gold when sufficient funds available', () => {
      const { spendGold } = useGuildStore.getState();

      const success = spendGold(300);

      expect(success).toBe(true);
      expect(useGuildStore.getState().gold).toBe(700);
    });

    it('should not spend gold when insufficient funds', () => {
      const { spendGold } = useGuildStore.getState();

      const success = spendGold(1500);

      expect(success).toBe(false);
      expect(useGuildStore.getState().gold).toBe(1000);
    });
  });

  describe('adventurer hiring', () => {
    beforeEach(() => {
      // Add a recruit to hire
      useGuildStore.setState({
        recruits: [mockRecruit]
      });
    });

    it('should hire adventurer when conditions are met', () => {
      const { hireAdventurer } = useGuildStore.getState();

      hireAdventurer(mockRecruit.id);

      const state = useGuildStore.getState();
      expect(state.adventurers).toHaveLength(initialAdventurers.length + 1);
      expect(state.gold).toBe(1000 - mockRecruit.cost);
      expect(state.recruits).toHaveLength(0);

      const hiredAdventurer = state.adventurers.find(adv => adv.id === mockRecruit.id);
      expect(hiredAdventurer).toBeDefined();
      expect(hiredAdventurer?.name).toBe(mockRecruit.name);
      expect(hiredAdventurer?.class).toBe(mockRecruit.class);
      expect(hiredAdventurer?.status).toBe('available');
    });

    it('should not hire adventurer when at maximum capacity', () => {
      // Fill up to max capacity
      const maxAdventurers = Array.from({ length: guildConstants.MAX_ADVENTURERS - initialAdventurers.length + 1 }, (_, i) => ({
        ...mockAdventurer,
        id: `extra-${i}`,
        name: `Extra ${i}`
      }));

      useGuildStore.setState({
        adventurers: [...initialAdventurers, ...maxAdventurers]
      });

      const { hireAdventurer } = useGuildStore.getState();
      const initialCount = useGuildStore.getState().adventurers.length;

      hireAdventurer(mockRecruit.id);

      expect(useGuildStore.getState().adventurers).toHaveLength(initialCount);
      expect(useGuildStore.getState().gold).toBe(1000); // No gold spent
    });

    it('should not hire adventurer when insufficient gold', () => {
      useGuildStore.setState({ gold: 100 }); // Less than recruit cost

      const { hireAdventurer } = useGuildStore.getState();

      hireAdventurer(mockRecruit.id);

      expect(useGuildStore.getState().adventurers).toHaveLength(initialAdventurers.length);
      expect(useGuildStore.getState().gold).toBe(100);
    });
  });

  describe('quest management', () => {
    it('should start quest with available adventurers', () => {
      const { startQuest } = useGuildStore.getState();
      const adventurerId = initialAdventurers[0].id;

      startQuest(mockQuest.id, [adventurerId]);

      const state = useGuildStore.getState();
      expect(state.activeQuests).toHaveLength(1);

      const activeQuest = state.activeQuests[0];
      expect(activeQuest.id).toBe(mockQuest.id);
      expect(activeQuest.assignedAdventurers).toContain(adventurerId);
      expect(activeQuest.status).toBe('active');

      const adventurer = state.adventurers.find(adv => adv.id === adventurerId);
      expect(adventurer?.status).toBe('on quest');
    });

    it('should complete quest and reward adventurers', () => {
      // First start a quest
      const { startQuest, completeQuest } = useGuildStore.getState();
      const adventurerId = initialAdventurers[0].id;

      startQuest(mockQuest.id, [adventurerId]);

      const initialGold = useGuildStore.getState().gold;
      const initialReputation = useGuildStore.getState().reputation;

      completeQuest(mockQuest.id);

      const state = useGuildStore.getState();
      expect(state.activeQuests).toHaveLength(0);
      expect(state.completedQuests).toContain(mockQuest.id);
      expect(state.gold).toBeGreaterThan(initialGold);
      expect(state.reputation).toBeGreaterThan(initialReputation);

      const adventurer = state.adventurers.find(adv => adv.id === adventurerId);
      expect(adventurer?.status).toBe('available');
      expect(adventurer?.experience).toBeGreaterThan(0);
    });
  });

  describe('recruit refresh', () => {
    it('should refresh recruits when sufficient gold', () => {
      const { refreshRecruits } = useGuildStore.getState();
      const initialGold = useGuildStore.getState().gold;

      refreshRecruits();

      const state = useGuildStore.getState();
      expect(state.recruits).toHaveLength(3);
      expect(state.gold).toBe(initialGold - guildConstants.RECRUIT_REFRESH_COST);

      state.recruits.forEach(recruit => {
        expect(recruit.id).toMatch(/^recruit_\d+_\d+$/);
        expect(['Warrior', 'Mage', 'Rogue', 'Archer']).toContain(recruit.class);
        expect(recruit.level).toBeGreaterThanOrEqual(1);
        expect(recruit.level).toBeLessThanOrEqual(5);
        expect(recruit.cost).toBeGreaterThan(0);
      });
    });

    it('should not refresh recruits when insufficient gold', () => {
      useGuildStore.setState({ gold: 25 }); // Less than refresh cost

      const { refreshRecruits } = useGuildStore.getState();

      refreshRecruits();

      const state = useGuildStore.getState();
      expect(state.recruits).toHaveLength(0);
      expect(state.gold).toBe(25);
    });
  });

  describe('calculations', () => {
    it('should calculate recruit cost correctly', () => {
      const { calculateRecruitCost } = useGuildStore.getState();

      expect(calculateRecruitCost(1)).toBe(guildConstants.RECRUIT_BASE_COST);
      expect(calculateRecruitCost(2)).toBe(Math.floor(guildConstants.RECRUIT_BASE_COST * guildConstants.RECRUIT_COST_MULTIPLIER));
      expect(calculateRecruitCost(3)).toBe(Math.floor(guildConstants.RECRUIT_BASE_COST * Math.pow(guildConstants.RECRUIT_COST_MULTIPLIER, 2)));
    });

    it('should calculate quest reward correctly', () => {
      const { calculateQuestReward } = useGuildStore.getState();

      const easyReward = calculateQuestReward({ ...mockQuest, difficulty: 'Easy' });
      const mediumReward = calculateQuestReward({ ...mockQuest, difficulty: 'Medium' });
      const hardReward = calculateQuestReward({ ...mockQuest, difficulty: 'Hard' });

      expect(mediumReward).toBeGreaterThan(easyReward);
      expect(hardReward).toBeGreaterThan(mediumReward);
    });

    it('should get available adventurers correctly', () => {
      const { getAvailableAdventurers } = useGuildStore.getState();

      const available = getAvailableAdventurers();
      expect(available).toHaveLength(initialAdventurers.length);

      // Start a quest to make one unavailable
      const { startQuest } = useGuildStore.getState();
      startQuest(mockQuest.id, [available[0].id]);

      const availableAfterQuest = getAvailableAdventurers();
      expect(availableAfterQuest).toHaveLength(initialAdventurers.length - 1);
    });
  });

  describe('save functionality', () => {
    it('should update last save timestamp', () => {
      const { saveGame } = useGuildStore.getState();
      const initialSaveTime = useGuildStore.getState().lastSave;

      // Wait a small amount to ensure timestamp difference
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      saveGame();

      const newSaveTime = useGuildStore.getState().lastSave;
      expect(newSaveTime).toBeGreaterThan(initialSaveTime);

      vi.useRealTimers();
    });
  });

  describe('formatNumber utility', () => {
    it('should format numbers correctly', () => {
      const { formatNumber } = useGuildStore.getState();

      expect(formatNumber(500)).toBe('500');
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(1500000)).toBe('1.5M');
    });
  });
});
