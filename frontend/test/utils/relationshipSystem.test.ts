import { describe, it, expect, beforeEach } from 'vitest';
import RelationshipSystem from '../../src/utils/relationshipSystem';
import type { Adventurer } from '../../src/types/game';

const makeAdventurer = (id: string, name: string): Adventurer => ({
  id,
  name,
  class: 'Warrior',
  rank: 'Novice',
  level: 2,
  experience: 100,
  status: 'available',
  stats: { strength: 10, intelligence: 10, dexterity: 10, vitality: 10 },
  personality: { courage: 60, loyalty: 60, ambition: 60, teamwork: 60, greed: 40 },
  skills: {
    combat: { weaponMastery: 5, tacticalKnowledge: 5, battleRage: 5 },
    magic: { spellPower: 0, manaEfficiency: 0, elementalMastery: 0 },
    stealth: { lockpicking: 0, sneaking: 0, assassination: 0 },
    survival: { tracking: 0, herbalism: 0, animalHandling: 0 },
  },
  equipment: {},
  relationships: [],
  questsCompleted: 0,
  yearsInGuild: 0,
  retirementEligible: false,
});

describe('RelationshipSystem', () => {
  let system: RelationshipSystem;
  let adventurers: Adventurer[];

  beforeEach(() => {
    system = RelationshipSystem.getInstance();
    adventurers = [
      makeAdventurer('adv-1', 'Alice'),
      makeAdventurer('adv-2', 'Bob'),
      makeAdventurer('adv-3', 'Cara'),
    ];
  });

  it('uses a singleton instance', () => {
    expect(RelationshipSystem.getInstance()).toBe(RelationshipSystem.getInstance());
  });

  it('returns neutral synergy for no relationships', () => {
    const synergy = system.calculateTeamSynergy(['adv-1', 'adv-2'], adventurers);
    expect(synergy).toBe(1);
  });

  it('increases synergy for friendship', () => {
    adventurers[0].relationships.push({
      targetId: 'adv-2',
      type: 'friendship',
      strength: 80,
      history: [],
    });

    const synergy = system.calculateTeamSynergy(['adv-1', 'adv-2'], adventurers);
    expect(synergy).toBeGreaterThan(1);
  });

  it('decreases synergy for rivalry', () => {
    adventurers[0].relationships.push({
      targetId: 'adv-2',
      type: 'rivalry',
      strength: 80,
      history: [],
    });

    const synergy = system.calculateTeamSynergy(['adv-1', 'adv-2'], adventurers);
    expect(synergy).toBeLessThan(1);
  });

  it('applies relationship events and updates history', () => {
    system.applyRelationshipEvent(
      {
        id: 'evt-1',
        participantIds: ['adv-1', 'adv-2'],
        type: 'bonding',
        description: 'Shared victory',
        impact: {
          relationshipChanges: [
            {
              adventurerId: 'adv-1',
              targetId: 'adv-2',
              relationshipType: 'friendship',
              strengthChange: 15,
            },
          ],
        },
      },
      adventurers
    );

    const rel = adventurers[0].relationships.find(r => r.targetId === 'adv-2');
    expect(rel).toBeDefined();
    expect(rel?.type).toBe('friendship');
    expect(rel?.strength).toBe(15);
    expect(rel?.history.at(-1)).toBe('Shared victory');
  });

  it('can produce a crisis for strong rivalry', () => {
    adventurers[0].relationships.push({
      targetId: 'adv-2',
      type: 'rivalry',
      strength: 85,
      history: ['Bad blood'],
    });

    const crisis = system.triggerRelationshipCrisis(adventurers);
    expect(crisis).not.toBeNull();
    expect(crisis?.type).toBe('conflict');
  });
});
