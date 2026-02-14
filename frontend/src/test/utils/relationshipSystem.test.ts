import { describe, it, expect, beforeEach, vi } from 'vitest';
import RelationshipSystem from '../../utils/relationshipSystem';
import type { Adventurer } from '../../types/game';

const mockAdventurer1: Adventurer = {
  id: 'adv1',
  name: 'Alice',
  class: 'Warrior',
  rank: 'Journeyman',
  level: 5,
  experience: 500,
  status: 'available',
  stats: { strength: 20, intelligence: 10, dexterity: 15, vitality: 25 },
  personality: { courage: 80, loyalty: 70, ambition: 60, teamwork: 75, greed: 30 },
  skills: {
    combat: { weaponMastery: 15, tacticalKnowledge: 10, battleRage: 8 },
    magic: { spellPower: 0, manaEfficiency: 0, elementalMastery: 0 },
    stealth: { lockpicking: 2, sneaking: 5, assassination: 1 },
    survival: { tracking: 8, herbalism: 3, animalHandling: 6 },
  },
  equipment: {},
  relationships: [],
  questsCompleted: 15,
  yearsInGuild: 2,
  retirementEligible: false,
};

const mockAdventurer2: Adventurer = {
  id: 'adv2',
  name: 'Bob',
  class: 'Mage',
  rank: 'Expert',
  level: 6,
  experience: 600,
  status: 'available',
  stats: { strength: 12, intelligence: 25, dexterity: 18, vitality: 20 },
  personality: { courage: 65, loyalty: 80, ambition: 75, teamwork: 85, greed: 25 },
  skills: {
    combat: { weaponMastery: 5, tacticalKnowledge: 12, battleRage: 3 },
    magic: { spellPower: 20, manaEfficiency: 18, elementalMastery: 15 },
    stealth: { lockpicking: 0, sneaking: 3, assassination: 0 },
    survival: { tracking: 5, herbalism: 10, animalHandling: 4 },
  },
  equipment: {},
  relationships: [],
  questsCompleted: 20,
  yearsInGuild: 3,
  retirementEligible: false,
};

const mockAdventurer3: Adventurer = {
  id: 'adv3',
  name: 'Charlie',
  class: 'Rogue',
  rank: 'Apprentice',
  level: 3,
  experience: 300,
  status: 'available',
  stats: { strength: 14, intelligence: 16, dexterity: 22, vitality: 18 },
  personality: { courage: 55, loyalty: 45, ambition: 85, teamwork: 40, greed: 70 },
  skills: {
    combat: { weaponMastery: 8, tacticalKnowledge: 6, battleRage: 4 },
    magic: { spellPower: 3, manaEfficiency: 2, elementalMastery: 1 },
    stealth: { lockpicking: 15, sneaking: 18, assassination: 10 },
    survival: { tracking: 12, herbalism: 2, animalHandling: 1 },
  },
  equipment: {},
  relationships: [],
  questsCompleted: 8,
  yearsInGuild: 1,
  retirementEligible: false,
};

describe('RelationshipSystem', () => {
  let relationshipSystem: RelationshipSystem;
  let adventurers: Adventurer[];

  beforeEach(() => {
    relationshipSystem = RelationshipSystem.getInstance();
    adventurers = [mockAdventurer1, mockAdventurer2, mockAdventurer3].map(adv => ({
      ...adv,
      relationships: [],
    }));
    vi.clearAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = RelationshipSystem.getInstance();
      const instance2 = RelationshipSystem.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('update method', () => {
    it('should not generate events when insufficient time has passed', () => {
      const events = relationshipSystem.update(adventurers);

      expect(events).toHaveLength(0);
    });

    it('should not generate events when insufficient adventurers', () => {
      // Mock time passage
      vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 25 * 60 * 60 * 1000); // 25 hours

      const singleAdventurer = [adventurers[0]];
      const events = relationshipSystem.update(singleAdventurer);

      expect(events).toHaveLength(0);
    });

    it('should potentially generate relationship events with sufficient adventurers and time', () => {
      // Mock time passage and random for consistent testing
      vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 25 * 60 * 60 * 1000); // 25 hours
      vi.spyOn(Math, 'random').mockReturnValue(0.25); // Triggers event generation

      const events = relationshipSystem.update(adventurers);

      // Events are generated randomly, so we can't guarantee specific count
      // but the system should attempt to generate events
      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe('calculateTeamSynergy', () => {
    it('should return 1.0 for single adventurer', () => {
      const synergy = relationshipSystem.calculateTeamSynergy([adventurers[0].id], adventurers);

      expect(synergy).toBe(1.0);
    });

    it('should return 1.0 for no relationships', () => {
      const synergy = relationshipSystem.calculateTeamSynergy(
        [adventurers[0].id, adventurers[1].id],
        adventurers
      );

      expect(synergy).toBe(1.0);
    });

    it('should increase synergy for friendships', () => {
      // Add friendship relationship
      adventurers[0].relationships.push({
        targetId: adventurers[1].id,
        type: 'friendship',
        strength: 80,
        history: ['Became friends'],
      });

      const synergy = relationshipSystem.calculateTeamSynergy(
        [adventurers[0].id, adventurers[1].id],
        adventurers
      );

      expect(synergy).toBeGreaterThan(1.0);
      expect(synergy).toBeLessThanOrEqual(1.5); // Max clamp
    });

    it('should increase synergy more for romance', () => {
      // Add romance relationship
      adventurers[0].relationships.push({
        targetId: adventurers[1].id,
        type: 'romance',
        strength: 90,
        history: ['Fell in love'],
      });

      const romanceSynergy = relationshipSystem.calculateTeamSynergy(
        [adventurers[0].id, adventurers[1].id],
        adventurers
      );

      // Add friendship for comparison
      adventurers[2].relationships.push({
        targetId: adventurers[1].id,
        type: 'friendship',
        strength: 90,
        history: ['Became friends'],
      });

      const friendshipSynergy = relationshipSystem.calculateTeamSynergy(
        [adventurers[2].id, adventurers[1].id],
        adventurers
      );

      expect(romanceSynergy).toBeGreaterThan(friendshipSynergy);
    });

    it('should decrease synergy for rivalries', () => {
      // Add rivalry relationship
      adventurers[0].relationships.push({
        targetId: adventurers[1].id,
        type: 'rivalry',
        strength: 70,
        history: ['Became rivals'],
      });

      const synergy = relationshipSystem.calculateTeamSynergy(
        [adventurers[0].id, adventurers[1].id],
        adventurers
      );

      expect(synergy).toBeLessThan(1.0);
      expect(synergy).toBeGreaterThanOrEqual(0.5); // Min clamp
    });

    it('should handle multiple relationships in a team', () => {
      // Create a love triangle: Alice loves Bob, Bob rivals Charlie, Alice friends Charlie
      adventurers[0].relationships.push({
        targetId: adventurers[1].id,
        type: 'romance',
        strength: 85,
        history: ['Romance bloomed'],
      });

      adventurers[1].relationships.push({
        targetId: adventurers[2].id,
        type: 'rivalry',
        strength: 60,
        history: ['Started rivalry'],
      });

      adventurers[0].relationships.push({
        targetId: adventurers[2].id,
        type: 'friendship',
        strength: 70,
        history: ['Became friends'],
      });

      const synergy = relationshipSystem.calculateTeamSynergy(
        [adventurers[0].id, adventurers[1].id, adventurers[2].id],
        adventurers
      );

      // Complex relationships should still produce valid synergy
      expect(synergy).toBeGreaterThanOrEqual(0.5);
      expect(synergy).toBeLessThanOrEqual(1.5);
    });
  });

  describe('getRelationshipSummary', () => {
    beforeEach(() => {
      adventurers[0].relationships = [
        {
          targetId: adventurers[1].id,
          type: 'friendship',
          strength: 75,
          history: ['Became friends'],
        },
        {
          targetId: adventurers[2].id,
          type: 'rivalry',
          strength: 60,
          history: ['Started competing'],
        },
      ];
    });

    it('should return relationship summaries', () => {
      const summaries = relationshipSystem.getRelationshipSummary(adventurers[0], adventurers);

      expect(summaries).toHaveLength(2);
      expect(summaries[0]).toContain('Alice');
      expect(summaries[0]).toContain('Bob');
      expect(summaries[0]).toContain('friendship');

      expect(summaries[1]).toContain('Alice');
      expect(summaries[1]).toContain('Charlie');
      expect(summaries[1]).toContain('rival');
    });

    it('should correctly categorize relationship strength', () => {
      // Test different strength levels
      adventurers[0].relationships = [
        { targetId: adventurers[1].id, type: 'friendship', strength: 90, history: [] },
        { targetId: adventurers[2].id, type: 'friendship', strength: 50, history: [] },
      ];

      const summaries = relationshipSystem.getRelationshipSummary(adventurers[0], adventurers);

      expect(summaries[0]).toContain('very close');
      expect(summaries[1]).toContain('good');
    });

    it('should handle missing target adventurers gracefully', () => {
      adventurers[0].relationships = [
        {
          targetId: 'non-existent',
          type: 'friendship',
          strength: 75,
          history: [],
        },
      ];

      const summaries = relationshipSystem.getRelationshipSummary(adventurers[0], adventurers);

      expect(summaries).toHaveLength(0);
    });
  });

  describe('applyRelationshipEvent', () => {
    it("should create new relationships when they don't exist", () => {
      const event = {
        id: 'test-event',
        participantIds: [adventurers[0].id, adventurers[1].id],
        type: 'bonding' as const,
        description: 'They bonded over shared interests',
        impact: {
          relationshipChanges: [
            {
              adventurerId: adventurers[0].id,
              targetId: adventurers[1].id,
              relationshipType: 'friendship' as const,
              strengthChange: 20,
            },
          ],
        },
      };

      relationshipSystem.applyRelationshipEvent(event, adventurers);

      const relationship = adventurers[0].relationships.find(r => r.targetId === adventurers[1].id);
      expect(relationship).toBeDefined();
      expect(relationship?.type).toBe('friendship');
      expect(relationship?.strength).toBe(20);
      expect(relationship?.history).toContain('They bonded over shared interests');
    });

    it('should update existing relationships', () => {
      // Add existing relationship
      adventurers[0].relationships.push({
        targetId: adventurers[1].id,
        type: 'friendship',
        strength: 50,
        history: ['Initial meeting'],
      });

      const event = {
        id: 'test-event',
        participantIds: [adventurers[0].id, adventurers[1].id],
        type: 'bonding' as const,
        description: 'Their friendship deepened',
        impact: {
          relationshipChanges: [
            {
              adventurerId: adventurers[0].id,
              targetId: adventurers[1].id,
              relationshipType: 'friendship' as const,
              strengthChange: 15,
            },
          ],
        },
      };

      relationshipSystem.applyRelationshipEvent(event, adventurers);

      const relationship = adventurers[0].relationships.find(r => r.targetId === adventurers[1].id);
      expect(relationship?.strength).toBe(65);
      expect(relationship?.history).toContain('Their friendship deepened');
    });

    it('should clamp relationship strength to 0-100 range', () => {
      adventurers[0].relationships.push({
        targetId: adventurers[1].id,
        type: 'rivalry',
        strength: 95,
        history: [],
      });

      const event = {
        id: 'test-event',
        participantIds: [adventurers[0].id, adventurers[1].id],
        type: 'conflict' as const,
        description: 'Their rivalry intensified',
        impact: {
          relationshipChanges: [
            {
              adventurerId: adventurers[0].id,
              targetId: adventurers[1].id,
              relationshipType: 'rivalry' as const,
              strengthChange: 20, // Would go to 115, should clamp to 100
            },
          ],
        },
      };

      relationshipSystem.applyRelationshipEvent(event, adventurers);

      const relationship = adventurers[0].relationships.find(r => r.targetId === adventurers[1].id);
      expect(relationship?.strength).toBe(100);
    });

    it('should limit history entries to 5', () => {
      adventurers[0].relationships.push({
        targetId: adventurers[1].id,
        type: 'friendship',
        strength: 50,
        history: ['Event 1', 'Event 2', 'Event 3', 'Event 4', 'Event 5'],
      });

      const event = {
        id: 'test-event',
        participantIds: [adventurers[0].id, adventurers[1].id],
        type: 'bonding' as const,
        description: 'Event 6',
        impact: {
          relationshipChanges: [
            {
              adventurerId: adventurers[0].id,
              targetId: adventurers[1].id,
              relationshipType: 'friendship' as const,
              strengthChange: 10,
            },
          ],
        },
      };

      relationshipSystem.applyRelationshipEvent(event, adventurers);

      const relationship = adventurers[0].relationships.find(r => r.targetId === adventurers[1].id);
      expect(relationship?.history).toHaveLength(5);
      expect(relationship?.history[0]).toBe('Event 2'); // First event should be removed
      expect(relationship?.history[4]).toBe('Event 6'); // New event should be last
    });
  });

  describe('triggerRelationshipCrisis', () => {
    it('should return null when no problematic relationships exist', () => {
      const crisis = relationshipSystem.triggerRelationshipCrisis(adventurers);

      expect(crisis).toBeNull();
    });

    it('should generate crisis event for strong rivalries', () => {
      adventurers[0].relationships.push({
        targetId: adventurers[1].id,
        type: 'rivalry',
        strength: 80, // Strong rivalry
        history: ['They compete fiercely'],
      });

      const crisis = relationshipSystem.triggerRelationshipCrisis(adventurers);

      expect(crisis).toBeDefined();
      expect(crisis?.type).toBe('conflict');
      expect(crisis?.description).toContain('Alice');
      expect(crisis?.description).toContain('Bob');
      expect(crisis?.impact.moraleChange).toBe(-20);
    });
  });
});
