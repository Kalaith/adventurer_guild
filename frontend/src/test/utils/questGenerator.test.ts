import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateProceduralQuest, generateMultipleQuests } from '../../utils/questGenerator';

// Mock Math.random for predictable tests
// const mockMath = Object.create(global.Math);

describe('Quest Generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateProceduralQuest', () => {
    it('should generate a quest with required properties', () => {
      const guildLevel = 3;
      const quest = generateProceduralQuest(guildLevel);

      expect(quest).toHaveProperty('id');
      expect(quest).toHaveProperty('name');
      expect(quest).toHaveProperty('description');
      expect(quest).toHaveProperty('reward');
      expect(quest).toHaveProperty('duration');
      expect(quest).toHaveProperty('requirements');
      expect(quest).toHaveProperty('difficulty');
      expect(quest).toHaveProperty('status', 'available');
      expect(quest).toHaveProperty('questType', 'standard');
      expect(quest).toHaveProperty('procedural', true);
      expect(quest).toHaveProperty('experienceReward');
      expect(quest).toHaveProperty('skillRewards');
      expect(quest).toHaveProperty('lootTable');
    });

    it('should have valid difficulty levels', () => {
      const validDifficulties = ['Easy', 'Medium', 'Hard', 'Epic'];

      for (let i = 0; i < 10; i++) {
        const quest = generateProceduralQuest(3);
        expect(validDifficulties).toContain(quest.difficulty);
      }
    });

    it('should scale rewards with guild level', () => {
      const lowLevelQuest = generateProceduralQuest(1);
      const highLevelQuest = generateProceduralQuest(10);

      expect(highLevelQuest.reward).toBeGreaterThan(lowLevelQuest.reward);
      expect(highLevelQuest.requirements.minLevel).toBeGreaterThanOrEqual(
        lowLevelQuest.requirements.minLevel
      );
    });

    it('should respect specified difficulty', () => {
      const easyQuest = generateProceduralQuest(5, 'Easy');
      const epicQuest = generateProceduralQuest(5, 'Epic');

      expect(easyQuest.difficulty).toBe('Easy');
      expect(epicQuest.difficulty).toBe('Epic');
      expect(epicQuest.reward).toBeGreaterThan(easyQuest.reward);
    });

    it('should generate appropriate requirements based on difficulty', () => {
      const easyQuest = generateProceduralQuest(5, 'Easy');
      const hardQuest = generateProceduralQuest(5, 'Hard');
      const epicQuest = generateProceduralQuest(5, 'Epic');

      expect(hardQuest.requirements.minLevel).toBeGreaterThan(easyQuest.requirements.minLevel);
      expect(epicQuest.requirements.minLevel).toBeGreaterThan(hardQuest.requirements.minLevel);

      // Hard and Epic quests should have skill requirements
      expect(hardQuest.requirements.skillRequirements).toBeDefined();
      expect(epicQuest.requirements.skillRequirements).toBeDefined();
      expect(epicQuest.requirements.personalityRequirements).toBeDefined();
    });

    it('should generate unique quest IDs', () => {
      const quest1 = generateProceduralQuest(3);
      const quest2 = generateProceduralQuest(3);

      expect(quest1.id).not.toBe(quest2.id);
      expect(quest1.id).toMatch(/^procedural_\d+_/);
      expect(quest2.id).toMatch(/^procedural_\d+_/);
    });

    it('should have appropriate loot table based on difficulty', () => {
      const easyQuest = generateProceduralQuest(3, 'Easy');
      const epicQuest = generateProceduralQuest(3, 'Epic');

      expect(easyQuest.lootTable).toBeDefined();
      expect(epicQuest.lootTable).toBeDefined();
      expect(easyQuest.lootTable ?? []).toHaveLength(1);
      expect(epicQuest.lootTable ?? []).toHaveLength(1);

      const easyLoot = easyQuest.lootTable?.[0];
      const epicLoot = epicQuest.lootTable?.[0];
      if (!easyLoot || !epicLoot) throw new Error('Expected quests to include a loot table item');

      expect(['common', 'uncommon']).toContain(easyLoot.rarity);
      expect(['epic', 'legendary']).toContain(epicLoot.rarity);
    });

    it('should generate appropriate skill rewards based on quest type', () => {
      // Generate multiple quests to test different types
      const quests = Array.from({ length: 20 }, () => generateProceduralQuest(3));

      quests.forEach((quest) => {
        expect(quest.skillRewards).toBeDefined();
        expect(Object.keys(quest.skillRewards!)).toHaveLength(1);

        const skillKey = Object.keys(quest.skillRewards!)[0];
        expect(skillKey).toMatch(/^(combat|magic|stealth|survival)\./);
      });
    });

    it('should generate rewards proportional to difficulty', () => {
      const easyQuest = generateProceduralQuest(5, 'Easy');
      const epicQuest = generateProceduralQuest(5, 'Epic');

      // Epic quests should have higher rewards than easy quests
      expect(epicQuest.reward).toBeGreaterThanOrEqual(easyQuest.reward);
      expect(epicQuest.experienceReward).toBeGreaterThanOrEqual(easyQuest.experienceReward);
    });

    it('should include location and entity placeholders in names and descriptions', () => {
      const quest = generateProceduralQuest(3);

      // Names should not contain placeholder braces
      expect(quest.name).not.toMatch(/\{|\}/);
      expect(quest.description).not.toMatch(/\{|\}/);

      // Should contain reasonable content
      expect(quest.name.length).toBeGreaterThan(5);
      expect(quest.description.length).toBeGreaterThan(20);
    });
  });

  describe('generateMultipleQuests', () => {
    it('should generate the requested number of quests', () => {
      const questCount = 5;
      const quests = generateMultipleQuests(3, questCount);

      expect(quests).toHaveLength(questCount);
    });

    it('should generate default number of quests when count not specified', () => {
      const quests = generateMultipleQuests(3);

      expect(quests).toHaveLength(5); // Default count
    });

    it('should generate unique quests', () => {
      const quests = generateMultipleQuests(3, 10);

      const questIds = quests.map((q) => q.id);
      const uniqueIds = new Set(questIds);

      expect(uniqueIds.size).toBe(questIds.length);
    });

    it('should generate quests with varied difficulties', () => {
      const quests = generateMultipleQuests(5, 20);

      const difficulties = quests.map((q) => q.difficulty);
      const uniqueDifficulties = new Set(difficulties);

      // Should have at least 2 different difficulty levels in 20 quests
      expect(uniqueDifficulties.size).toBeGreaterThanOrEqual(2);
    });

    it('should generate quests with varied quest types', () => {
      const quests = generateMultipleQuests(5, 30);

      const questNames = quests.map((q) => q.name);
      const uniqueNames = new Set(questNames);

      // Should have variety in quest names
      expect(uniqueNames.size).toBeGreaterThan(5);
    });

    it('should handle edge cases', () => {
      const zeroQuests = generateMultipleQuests(3, 0);
      expect(zeroQuests).toHaveLength(0);

      const singleQuest = generateMultipleQuests(3, 1);
      expect(singleQuest).toHaveLength(1);

      const manyQuests = generateMultipleQuests(3, 100);
      expect(manyQuests).toHaveLength(100);
    });
  });

  describe('quest template consistency', () => {
    it('should generate combat quests with appropriate classes', () => {
      // Generate many quests to find combat quests
      const quests = generateMultipleQuests(5, 50);
      const combatQuests = quests.filter(
        (q) =>
          q.requirements.preferredClasses.includes('Warrior') ||
          q.requirements.preferredClasses.includes('Archer')
      );

      expect(combatQuests.length).toBeGreaterThan(0);

      combatQuests.forEach((quest) => {
        // Combat quests should have at least one combat-appropriate class
        const hasCombatClass = quest.requirements.preferredClasses.some((cls) =>
          ['Warrior', 'Archer', 'Rogue'].includes(cls)
        );
        expect(hasCombatClass).toBe(true);
      });
    });

    it('should generate exploration quests with appropriate classes', () => {
      const quests = generateMultipleQuests(5, 50);
      const explorationQuests = quests.filter(
        (q) =>
          q.requirements.preferredClasses.includes('Rogue') &&
          q.requirements.preferredClasses.includes('Archer')
      );

      expect(explorationQuests.length).toBeGreaterThan(0);
    });

    it('should generate diplomatic quests with mage preference', () => {
      const quests = generateMultipleQuests(5, 50);
      const diplomaticQuests = quests.filter(
        (q) =>
          q.requirements.preferredClasses.includes('Mage') &&
          q.requirements.preferredClasses.length === 1
      );

      expect(diplomaticQuests.length).toBeGreaterThan(0);
    });
  });

  describe('equipment generation', () => {
    it('should generate equipment with appropriate stats for quest type', () => {
      const quest = generateProceduralQuest(5);
      const lootItem = quest.lootTable?.[0];
      if (!lootItem) throw new Error('Expected quest to include a loot table item');

      expect(lootItem.stats).toBeDefined();

      const totalStats = Object.values(lootItem.stats).reduce((sum, stat) => sum + (stat || 0), 0);
      expect(totalStats).toBeGreaterThan(0);
    });

    it('should generate equipment names that make sense', () => {
      const quest = generateProceduralQuest(5);
      const lootItem = quest.lootTable?.[0];
      if (!lootItem) throw new Error('Expected quest to include a loot table item');

      expect(lootItem.name).toMatch(
        /^(Simple|Basic|Plain|Fine|Quality|Improved|Masterwork|Superior|Excellent|Enchanted|Mystical|Legendary|Godforged|Artifact|Divine)/
      );
      expect(lootItem.name).toMatch(
        /(Sword|Axe|Bow|Staff|Dagger|Chainmail|Plate|Robes|Leather Armor|Scale Mail|Ring|Amulet|Cloak|Belt|Boots)$/
      );
    });

    it('should generate equipment with correct rarity distribution', () => {
      const quests = generateMultipleQuests(5, 100);
      const lootItems = quests.flatMap((q) => q.lootTable ?? []);

      const rarities = lootItems.map((item) => item.rarity);
      const rarityCounts = rarities.reduce(
        (counts, rarity) => {
          counts[rarity] = (counts[rarity] || 0) + 1;
          return counts;
        },
        {} as Record<string, number>
      );

      // Should have variety in rarities
      expect(Object.keys(rarityCounts).length).toBeGreaterThan(1);
    });
  });
});
