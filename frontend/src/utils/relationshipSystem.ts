import { Adventurer, AdventurerRelationship, PersonalityTraits } from '../types/game';

export type RelationshipEvent = {
  id: string;
  participantIds: string[];
  type: 'conflict' | 'bonding' | 'romance' | 'rivalry_start' | 'friendship_deepens';
  description: string;
  impact: {
    relationshipChanges: Array<{
      adventurerId: string;
      targetId: string;
      relationshipType: 'friendship' | 'rivalry' | 'romance';
      strengthChange: number;
    }>;
    moraleChange?: number;
    skillBonuses?: Array<{
      adventurerId: string;
      skillType: string;
      bonus: number;
      duration: number; // in days
    }>;
  };
};

export class RelationshipSystem {
  private static instance: RelationshipSystem;
  private lastUpdate: number = Date.now();
  private updateInterval: number = 24 * 60 * 60 * 1000; // Update daily

  public static getInstance(): RelationshipSystem {
    if (!RelationshipSystem.instance) {
      RelationshipSystem.instance = new RelationshipSystem();
    }
    return RelationshipSystem.instance;
  }

  public update(adventurers: Adventurer[]): RelationshipEvent[] {
    const now = Date.now();
    if (now - this.lastUpdate < this.updateInterval) {
      return [];
    }

    this.lastUpdate = now;
    const events: RelationshipEvent[] = [];

    // Check for new relationship events
    const availableAdventurers = adventurers.filter((adv) => adv.status === 'available');

    // Generate random relationship events
    if (availableAdventurers.length >= 2 && Math.random() < 0.3) {
      const event = this.generateRelationshipEvent(availableAdventurers);
      if (event) {
        events.push(event);
      }
    }

    // Check for existing relationships that might evolve
    availableAdventurers.forEach((adventurer) => {
      adventurer.relationships.forEach((relationship) => {
        if (Math.random() < 0.15) {
          // 15% chance for existing relationship to evolve
          const evolutionEvent = this.evolveRelationship(adventurer, relationship, adventurers);
          if (evolutionEvent) {
            events.push(evolutionEvent);
          }
        }
      });
    });

    return events;
  }

  private generateRelationshipEvent(adventurers: Adventurer[]): RelationshipEvent | null {
    if (adventurers.length < 2) return null;

    // Select two random adventurers
    const adventurer1 = adventurers[Math.floor(Math.random() * adventurers.length)];
    let adventurer2 = adventurers[Math.floor(Math.random() * adventurers.length)];

    // Ensure they're different adventurers
    while (adventurer2.id === adventurer1.id && adventurers.length > 1) {
      adventurer2 = adventurers[Math.floor(Math.random() * adventurers.length)];
    }

    // Check if they already have a relationship
    const existingRelationship = adventurer1.relationships.find(
      (rel) => rel.targetId === adventurer2.id
    );
    if (existingRelationship && existingRelationship.strength > 70) {
      return null; // Skip if they already have a strong relationship
    }

    // Determine event type based on personalities
    const eventType = this.determineEventType(adventurer1.personality, adventurer2.personality);

    return this.createRelationshipEvent(adventurer1, adventurer2, eventType);
  }

  private determineEventType(
    personality1: PersonalityTraits,
    personality2: PersonalityTraits
  ): RelationshipEvent['type'] {
    // High teamwork personalities tend to bond
    if (personality1.teamwork > 70 && personality2.teamwork > 70) {
      return Math.random() < 0.7 ? 'bonding' : 'friendship_deepens';
    }

    // Ambitious personalities might clash or compete
    if (personality1.ambition > 75 && personality2.ambition > 75) {
      return Math.random() < 0.6 ? 'rivalry_start' : 'conflict';
    }

    // Loyal and high teamwork with courage can lead to romance
    if (
      personality1.loyalty > 60 &&
      personality2.loyalty > 60 &&
      personality1.courage > 50 &&
      personality2.courage > 50
    ) {
      return Math.random() < 0.3 ? 'romance' : 'bonding';
    }

    // Default to bonding or minor conflict
    return Math.random() < 0.7 ? 'bonding' : 'conflict';
  }

  private createRelationshipEvent(
    adventurer1: Adventurer,
    adventurer2: Adventurer,
    eventType: RelationshipEvent['type']
  ): RelationshipEvent {
    const eventId = `relationship_${Date.now()}_${Math.random()}`;

    switch (eventType) {
      case 'bonding':
        return {
          id: eventId,
          participantIds: [adventurer1.id, adventurer2.id],
          type: 'bonding',
          description: `${adventurer1.name} and ${adventurer2.name} shared stories over a campfire, growing closer as friends.`,
          impact: {
            relationshipChanges: [
              {
                adventurerId: adventurer1.id,
                targetId: adventurer2.id,
                relationshipType: 'friendship',
                strengthChange: 15,
              },
              {
                adventurerId: adventurer2.id,
                targetId: adventurer1.id,
                relationshipType: 'friendship',
                strengthChange: 15,
              },
            ],
          },
        };

      case 'romance':
        return {
          id: eventId,
          participantIds: [adventurer1.id, adventurer2.id],
          type: 'romance',
          description: `${adventurer1.name} and ${adventurer2.name} have developed romantic feelings for each other.`,
          impact: {
            relationshipChanges: [
              {
                adventurerId: adventurer1.id,
                targetId: adventurer2.id,
                relationshipType: 'romance',
                strengthChange: 25,
              },
              {
                adventurerId: adventurer2.id,
                targetId: adventurer1.id,
                relationshipType: 'romance',
                strengthChange: 25,
              },
            ],
            skillBonuses: [
              {
                adventurerId: adventurer1.id,
                skillType: 'teamwork',
                bonus: 10,
                duration: 30,
              },
              {
                adventurerId: adventurer2.id,
                skillType: 'teamwork',
                bonus: 10,
                duration: 30,
              },
            ],
          },
        };

      case 'rivalry_start':
        return {
          id: eventId,
          participantIds: [adventurer1.id, adventurer2.id],
          type: 'rivalry_start',
          description: `${adventurer1.name} and ${adventurer2.name} have developed a competitive rivalry, constantly trying to outdo each other.`,
          impact: {
            relationshipChanges: [
              {
                adventurerId: adventurer1.id,
                targetId: adventurer2.id,
                relationshipType: 'rivalry',
                strengthChange: 20,
              },
              {
                adventurerId: adventurer2.id,
                targetId: adventurer1.id,
                relationshipType: 'rivalry',
                strengthChange: 20,
              },
            ],
            skillBonuses: [
              {
                adventurerId: adventurer1.id,
                skillType: 'combat.battleRage',
                bonus: 5,
                duration: 14,
              },
              {
                adventurerId: adventurer2.id,
                skillType: 'combat.battleRage',
                bonus: 5,
                duration: 14,
              },
            ],
          },
        };

      case 'conflict':
        return {
          id: eventId,
          participantIds: [adventurer1.id, adventurer2.id],
          type: 'conflict',
          description: `${adventurer1.name} and ${adventurer2.name} had a heated argument about quest tactics, straining their relationship.`,
          impact: {
            relationshipChanges: [
              {
                adventurerId: adventurer1.id,
                targetId: adventurer2.id,
                relationshipType: 'rivalry',
                strengthChange: -10,
              },
              {
                adventurerId: adventurer2.id,
                targetId: adventurer1.id,
                relationshipType: 'rivalry',
                strengthChange: -10,
              },
            ],
            moraleChange: -5,
          },
        };

      default:
        return this.createRelationshipEvent(adventurer1, adventurer2, 'bonding');
    }
  }

  private evolveRelationship(
    adventurer: Adventurer,
    relationship: AdventurerRelationship,
    allAdventurers: Adventurer[]
  ): RelationshipEvent | null {
    const target = allAdventurers.find((adv) => adv.id === relationship.targetId);
    if (!target) return null;

    const eventId = `evolve_${Date.now()}_${Math.random()}`;

    // Friendships can evolve to romance
    if (relationship.type === 'friendship' && relationship.strength > 60 && Math.random() < 0.2) {
      return {
        id: eventId,
        participantIds: [adventurer.id, target.id],
        type: 'romance',
        description: `${adventurer.name} and ${target.name}'s friendship has blossomed into something deeper.`,
        impact: {
          relationshipChanges: [
            {
              adventurerId: adventurer.id,
              targetId: target.id,
              relationshipType: 'romance',
              strengthChange: 20,
            },
          ],
        },
      };
    }

    // Rivalries can intensify or resolve
    if (relationship.type === 'rivalry') {
      if (relationship.strength > 80 && Math.random() < 0.3) {
        return {
          id: eventId,
          participantIds: [adventurer.id, target.id],
          type: 'conflict',
          description: `The rivalry between ${adventurer.name} and ${target.name} has reached a breaking point, causing tension in the guild.`,
          impact: {
            relationshipChanges: [
              {
                adventurerId: adventurer.id,
                targetId: target.id,
                relationshipType: 'rivalry',
                strengthChange: 10,
              },
            ],
            moraleChange: -10,
          },
        };
      } else if (relationship.strength < 30 && Math.random() < 0.4) {
        return {
          id: eventId,
          participantIds: [adventurer.id, target.id],
          type: 'friendship_deepens',
          description: `${adventurer.name} and ${target.name} have resolved their differences and are becoming friends.`,
          impact: {
            relationshipChanges: [
              {
                adventurerId: adventurer.id,
                targetId: target.id,
                relationshipType: 'friendship',
                strengthChange: 25,
              },
            ],
          },
        };
      }
    }

    return null;
  }

  public applyRelationshipEvent(event: RelationshipEvent, adventurers: Adventurer[]): void {
    event.impact.relationshipChanges.forEach((change) => {
      const adventurer = adventurers.find((adv) => adv.id === change.adventurerId);
      if (!adventurer) return;

      let relationship = adventurer.relationships.find((rel) => rel.targetId === change.targetId);

      if (!relationship) {
        // Create new relationship
        relationship = {
          targetId: change.targetId,
          type: change.relationshipType,
          strength: 0,
          history: [],
        };
        adventurer.relationships.push(relationship);
      }

      // Update relationship
      relationship.type = change.relationshipType;
      relationship.strength = Math.max(
        0,
        Math.min(100, relationship.strength + change.strengthChange)
      );
      relationship.history.push(event.description);

      // Keep only last 5 history entries
      if (relationship.history.length > 5) {
        relationship.history.shift();
      }
    });
  }

  public calculateTeamSynergy(adventurerIds: string[], allAdventurers: Adventurer[]): number {
    if (adventurerIds.length < 2) return 1.0;

    let totalSynergy = 0;
    let pairCount = 0;

    for (let i = 0; i < adventurerIds.length - 1; i++) {
      for (let j = i + 1; j < adventurerIds.length; j++) {
        const adventurer1 = allAdventurers.find((adv) => adv.id === adventurerIds[i]);
        const adventurer2 = allAdventurers.find((adv) => adv.id === adventurerIds[j]);

        if (!adventurer1 || !adventurer2) continue;

        const relationship = adventurer1.relationships.find(
          (rel) => rel.targetId === adventurer2.id
        );

        if (relationship) {
          switch (relationship.type) {
            case 'friendship':
              totalSynergy += (relationship.strength / 100) * 0.2; // Max 20% bonus per friendship
              break;
            case 'romance':
              totalSynergy += (relationship.strength / 100) * 0.3; // Max 30% bonus per romance
              break;
            case 'rivalry':
              totalSynergy -= (relationship.strength / 100) * 0.1; // Max 10% penalty per rivalry
              break;
          }
        }

        pairCount++;
      }
    }

    const averageSynergy = pairCount > 0 ? totalSynergy / pairCount : 0;
    return Math.max(0.5, Math.min(1.5, 1.0 + averageSynergy)); // Clamp between 0.5x and 1.5x
  }

  public getRelationshipSummary(adventurer: Adventurer, allAdventurers: Adventurer[]): string[] {
    const summaries: string[] = [];

    adventurer.relationships.forEach((relationship) => {
      const target = allAdventurers.find((adv) => adv.id === relationship.targetId);
      if (!target) return;

      let relationshipLevel = 'acquaintance';
      if (relationship.strength >= 80) relationshipLevel = 'very close';
      else if (relationship.strength >= 60) relationshipLevel = 'close';
      else if (relationship.strength >= 40) relationshipLevel = 'good';
      else if (relationship.strength >= 20) relationshipLevel = 'casual';

      const typeDescription =
        relationship.type === 'friendship'
          ? 'friend'
          : relationship.type === 'romance'
            ? 'romantic partner'
            : 'rival';

      summaries.push(
        `${adventurer.name} has a ${relationshipLevel} ${typeDescription}ship with ${target.name}.`
      );
    });

    return summaries;
  }

  public triggerRelationshipCrisis(adventurers: Adventurer[]): RelationshipEvent | null {
    // Find adventurers with strong negative relationships
    const problematicPairs: Array<{
      adv1: Adventurer;
      adv2: Adventurer;
      relationship: AdventurerRelationship;
    }> = [];

    adventurers.forEach((adventurer) => {
      adventurer.relationships.forEach((relationship) => {
        if (relationship.type === 'rivalry' && relationship.strength > 70) {
          const target = adventurers.find((adv) => adv.id === relationship.targetId);
          if (target) {
            problematicPairs.push({ adv1: adventurer, adv2: target, relationship });
          }
        }
      });
    });

    if (problematicPairs.length === 0) return null;

    const pair = problematicPairs[Math.floor(Math.random() * problematicPairs.length)];

    return {
      id: `crisis_${Date.now()}`,
      participantIds: [pair.adv1.id, pair.adv2.id],
      type: 'conflict',
      description: `The intense rivalry between ${pair.adv1.name} and ${pair.adv2.name} is causing major disruption in the guild. Some adventurers are taking sides!`,
      impact: {
        relationshipChanges: [
          {
            adventurerId: pair.adv1.id,
            targetId: pair.adv2.id,
            relationshipType: 'rivalry',
            strengthChange: 15,
          },
        ],
        moraleChange: -20,
      },
    };
  }
}

export default RelationshipSystem;
