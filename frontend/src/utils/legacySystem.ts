import { Adventurer, RetiredAdventurer, GuildState, Quest, EquipmentItem } from '../types/game';

export interface LegacyBonus {
  id: string;
  name: string;
  description: string;
  type: 'experience' | 'gold' | 'reputation' | 'skill' | 'quest_access' | 'recruitment';
  value: number; // multiplier or flat bonus
  unlockCondition: {
    generation?: number;
    totalQuestsCompleted?: number;
    totalGoldEarned?: number;
    totalReputationGained?: number;
    legendaryItemsObtained?: number;
    retiredAdventurers?: number;
  };
  persistent: boolean; // whether bonus carries over between generations
}

export interface GuildLegacy {
  totalGenerations: number;
  totalQuestsCompleted: number;
  totalGoldEarned: number;
  totalReputationGained: number;
  legendaryAdventurers: Array<{
    name: string;
    class: string;
    achievements: string[];
    generation: number;
  }>;
  famousQuests: Array<{
    questName: string;
    completedBy: string[];
    generation: number;
    legendary: boolean;
  }>;
  heirloomItems: EquipmentItem[];
  activeBonuses: LegacyBonus[];
  guildChronicles: Array<{
    generation: number;
    majorEvents: string[];
    notableAchievements: string[];
    finalStats: {
      level: number;
      reputation: number;
      gold: number;
      adventurers: number;
    };
  }>;
}

export interface GenerationTransition {
  reason: 'time_passed' | 'catastrophic_event' | 'voluntary_succession' | 'guild_dissolution';
  description: string;
  survivingElements: {
    heirloomItems: EquipmentItem[];
    retiredAdventurersAsNPCs: RetiredAdventurer[];
    legacyKnowledge: string[];
    territoryInfluence: { [territoryId: string]: number };
  };
  newGeneration: {
    startingBonuses: { [key: string]: number };
    inheritedReputation: number;
    inheritedGold: number;
    specialStartingAdventurers: Adventurer[];
  };
}

const toLegacyBonuses = (startingBonuses: {
  [key: string]: number;
}): GuildState['legacyBonuses'] => {
  return {
    experienceMultiplier: startingBonuses.experience ?? 1,
    goldMultiplier: startingBonuses.gold ?? 1,
    reputationMultiplier: startingBonuses.reputation ?? 1,
  };
};

export const legacyBonuses: LegacyBonus[] = [
  {
    id: 'founding_wisdom',
    name: 'Founding Wisdom',
    description: "The wisdom of your guild's founders guides new generations.",
    type: 'experience',
    value: 1.1, // 10% experience bonus
    unlockCondition: { generation: 2 },
    persistent: true,
  },
  {
    id: 'golden_legacy',
    name: 'Golden Legacy',
    description: "Your guild's reputation for success attracts better paying clients.",
    type: 'gold',
    value: 1.15, // 15% gold bonus
    unlockCondition: { totalGoldEarned: 50000 },
    persistent: true,
  },
  {
    id: 'heroic_reputation',
    name: 'Heroic Reputation',
    description: "Stories of your guild's heroic deeds spread far and wide.",
    type: 'reputation',
    value: 1.2, // 20% reputation bonus
    unlockCondition: { totalQuestsCompleted: 200 },
    persistent: true,
  },
  {
    id: 'master_trainers',
    name: 'Master Trainers',
    description: 'Retired masters provide exceptional training for new recruits.',
    type: 'skill',
    value: 1.25, // 25% skill growth bonus
    unlockCondition: { retiredAdventurers: 10 },
    persistent: true,
  },
  {
    id: 'legendary_connections',
    name: 'Legendary Connections',
    description: 'Access to exclusive quests through legendary connections.',
    type: 'quest_access',
    value: 1, // unlocks special quest line
    unlockCondition: { totalReputationGained: 5000 },
    persistent: true,
  },
  {
    id: 'renowned_guild',
    name: 'Renowned Guild',
    description: "Your guild's fame attracts higher quality recruits.",
    type: 'recruitment',
    value: 1.3, // 30% better recruit stats
    unlockCondition: { generation: 3, totalQuestsCompleted: 300 },
    persistent: true,
  },
  {
    id: 'ancient_knowledge',
    name: 'Ancient Knowledge',
    description: 'Accumulated knowledge from multiple generations provides wisdom.',
    type: 'experience',
    value: 1.5, // 50% experience bonus
    unlockCondition: { generation: 5, legendaryItemsObtained: 10 },
    persistent: true,
  },
  {
    id: 'dynasty_power',
    name: 'Dynasty Power',
    description: 'The power of a true guild dynasty affects all operations.',
    type: 'gold',
    value: 2.0, // 100% gold bonus
    unlockCondition: { generation: 10, totalGoldEarned: 500000 },
    persistent: true,
  },
];

export class LegacySystem {
  private static instance: LegacySystem;

  public static getInstance(): LegacySystem {
    if (!LegacySystem.instance) {
      LegacySystem.instance = new LegacySystem();
    }
    return LegacySystem.instance;
  }

  public initializeGuildLegacy(): GuildLegacy {
    return {
      totalGenerations: 1,
      totalQuestsCompleted: 0,
      totalGoldEarned: 0,
      totalReputationGained: 0,
      legendaryAdventurers: [],
      famousQuests: [],
      heirloomItems: [],
      activeBonuses: [],
      guildChronicles: [],
    };
  }

  public checkForLegacyBonuses(legacy: GuildLegacy): LegacyBonus[] {
    const newBonuses: LegacyBonus[] = [];

    legacyBonuses.forEach((bonus) => {
      // Skip if already active
      if (legacy.activeBonuses.some((active) => active.id === bonus.id)) {
        return;
      }

      // Check unlock conditions
      if (this.meetsUnlockConditions(bonus.unlockCondition, legacy)) {
        newBonuses.push(bonus);
      }
    });

    return newBonuses;
  }

  private meetsUnlockConditions(
    condition: LegacyBonus['unlockCondition'],
    legacy: GuildLegacy
  ): boolean {
    if (condition.generation && legacy.totalGenerations < condition.generation) return false;
    if (
      condition.totalQuestsCompleted &&
      legacy.totalQuestsCompleted < condition.totalQuestsCompleted
    )
      return false;
    if (condition.totalGoldEarned && legacy.totalGoldEarned < condition.totalGoldEarned)
      return false;
    if (
      condition.totalReputationGained &&
      legacy.totalReputationGained < condition.totalReputationGained
    )
      return false;
    if (
      condition.legendaryItemsObtained &&
      legacy.heirloomItems.filter((item) => item.rarity === 'legendary').length <
        condition.legendaryItemsObtained
    )
      return false;
    if (
      condition.retiredAdventurers &&
      legacy.legendaryAdventurers.length < condition.retiredAdventurers
    )
      return false;

    return true;
  }

  public recordLegendaryAdventurer(
    adventurer: Adventurer,
    _generation: number,
    _achievements: string[]
  ): void {
    // Only record truly exceptional adventurers
    if (adventurer.level < 8 || adventurer.questsCompleted < 30) return;

    // const legacyRecord = {
    //   name: adventurer.name,
    //   class: adventurer.class,
    //   achievements,
    //   generation
    // };

    // This would be called from the game state management
    // legacy.legendaryAdventurers.push(legacyRecord);
  }

  public recordFamousQuest(
    quest: Quest,
    completedBy: string[],
    generation: number,
    _legendary: boolean = false
  ): void {
    // const questRecord = {
    //   questName: quest.name,
    //   completedBy,
    //   generation,
    //   legendary
    // };
    // This would be called from the game state management
    // legacy.famousQuests.push(questRecord);
  }

  public createHeirloomItem(
    originalItem: EquipmentItem,
    adventurer: Adventurer,
    generation: number
  ): EquipmentItem {
    const heirloomNames = [
      `${adventurer.name}'s ${originalItem.name}`,
      `Legacy ${originalItem.name}`,
      `Ancestral ${originalItem.name}`,
      `${originalItem.name} of the ${generation}${this.getOrdinalSuffix(generation)} Generation`,
    ];

    const heirloomName = heirloomNames[Math.floor(Math.random() * heirloomNames.length)];

    // Enhance the original item's stats
    const enhancedStats = { ...originalItem.stats };
    Object.keys(enhancedStats).forEach((stat) => {
      enhancedStats[stat as keyof typeof enhancedStats] = Math.floor(
        (enhancedStats[stat as keyof typeof enhancedStats] || 0) * 1.2
      );
    });

    // Upgrade rarity if possible
    const rarityUpgrade: { [key: string]: typeof originalItem.rarity } = {
      common: 'uncommon',
      uncommon: 'rare',
      rare: 'epic',
      epic: 'legendary',
      legendary: 'legendary',
    };

    return {
      ...originalItem,
      id: `heirloom_${originalItem.id}_gen${generation}`,
      name: heirloomName,
      rarity: rarityUpgrade[originalItem.rarity] || originalItem.rarity,
      stats: enhancedStats,
      crafted: false,
    };
  }

  private getOrdinalSuffix(num: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  }

  public planGenerationTransition(
    currentState: GuildState,
    legacy: GuildLegacy,
    reason: GenerationTransition['reason']
  ): GenerationTransition {
    // Create heirloom items from legendary equipment
    const heirloomItems: EquipmentItem[] = [];
    currentState.adventurers.forEach((adventurer) => {
      if (
        adventurer.equipment.weapon?.rarity === 'legendary' ||
        adventurer.equipment.weapon?.rarity === 'epic'
      ) {
        if (adventurer.equipment.weapon) {
          heirloomItems.push(
            this.createHeirloomItem(
              adventurer.equipment.weapon,
              adventurer,
              legacy.totalGenerations
            )
          );
        }
      }
      if (
        adventurer.equipment.armor?.rarity === 'legendary' ||
        adventurer.equipment.armor?.rarity === 'epic'
      ) {
        if (adventurer.equipment.armor) {
          heirloomItems.push(
            this.createHeirloomItem(adventurer.equipment.armor, adventurer, legacy.totalGenerations)
          );
        }
      }
    });

    // Determine surviving elements
    const survivingElements = {
      heirloomItems: [...legacy.heirloomItems, ...heirloomItems].slice(0, 20), // Max 20 heirlooms
      retiredAdventurersAsNPCs: currentState.retiredAdventurers.slice(0, 10), // Max 10 NPCs
      legacyKnowledge: this.generateLegacyKnowledge(currentState, legacy),
      territoryInfluence: this.calculateInheritedTerritoryInfluence(currentState.territories),
    };

    // Calculate new generation bonuses
    const inheritedReputation = Math.floor(currentState.reputation * 0.3); // 30% of reputation carries over
    const inheritedGold = Math.floor(currentState.gold * 0.2); // 20% of gold carries over

    const startingBonuses: { [key: string]: number } = {};
    legacy.activeBonuses.forEach((bonus) => {
      if (bonus.persistent) {
        startingBonuses[bonus.type] = bonus.value;
      }
    });

    // Generate special starting adventurers (descendants)
    const specialStartingAdventurers = this.generateDescendantAdventurers(
      currentState.adventurers,
      currentState.retiredAdventurers,
      legacy.totalGenerations + 1
    );

    const descriptions = {
      time_passed:
        "Many years have passed, and a new generation has taken over the guild's operations.",
      catastrophic_event:
        'A great catastrophe has befallen the land, forcing the guild to rebuild with new leadership.',
      voluntary_succession:
        'The guild leadership has voluntarily passed the torch to the next generation of adventurers.',
      guild_dissolution:
        'The old guild has disbanded, but its legacy lives on in a new organization founded by former members.',
    };

    return {
      reason,
      description: descriptions[reason],
      survivingElements,
      newGeneration: {
        startingBonuses,
        inheritedReputation,
        inheritedGold,
        specialStartingAdventurers,
      },
    };
  }

  private generateLegacyKnowledge(currentState: GuildState, legacy: GuildLegacy): string[] {
    const knowledge: string[] = [];

    // Knowledge from completed campaigns
    currentState.campaigns.forEach((campaign) => {
      if (campaign.completed) {
        knowledge.push(
          `Campaign Mastery: ${campaign.name} - Provides insight into similar future challenges.`
        );
      }
    });

    // Knowledge from world events
    currentState.worldEvents.forEach((event) => {
      if (event.active) {
        knowledge.push(
          `Event Experience: ${event.name} - Understanding of how to handle similar crises.`
        );
      }
    });

    // Knowledge from legendary adventurers
    legacy.legendaryAdventurers.forEach((hero) => {
      knowledge.push(
        `${hero.name}'s Wisdom - Specialized knowledge in ${hero.class} tactics and ${hero.achievements.join(', ')}.`
      );
    });

    return knowledge.slice(0, 15); // Max 15 pieces of legacy knowledge
  }

  private calculateInheritedTerritoryInfluence(territories: GuildState['territories']): {
    [territoryId: string]: number;
  } {
    const inherited: { [territoryId: string]: number } = {};

    territories.forEach((territory) => {
      if (territory.controlled && territory.influenceLevel > 50) {
        // Influence decreases but doesn't disappear completely
        inherited[territory.id] = Math.floor(territory.influenceLevel * 0.4);
      }
    });

    return inherited;
  }

  private generateDescendantAdventurers(
    currentAdventurers: Adventurer[],
    retiredAdventurers: RetiredAdventurer[],
    newGeneration: number
  ): Adventurer[] {
    const descendants: Adventurer[] = [];

    // Create descendants from legendary adventurers
    const legendaryAdventurers = currentAdventurers
      .filter((adv) => adv.level >= 8 && adv.questsCompleted >= 25)
      .concat(retiredAdventurers.map((ret) => ret.originalAdventurer));

    legendaryAdventurers.slice(0, 3).forEach((ancestor, index) => {
      const descendantName = this.generateDescendantName(ancestor.name, newGeneration);

      const descendant: Adventurer = {
        id: `descendant_${ancestor.id}_gen${newGeneration}`,
        name: descendantName,
        class: ancestor.class,
        rank: 'Heir',
        level: Math.max(1, Math.floor(ancestor.level * 0.4) + index),
        experience: 0,
        status: 'available',
        stats: {
          strength: Math.floor(ancestor.stats.strength * 0.6),
          intelligence: Math.floor(ancestor.stats.intelligence * 0.6),
          dexterity: Math.floor(ancestor.stats.dexterity * 0.6),
          vitality: Math.floor(ancestor.stats.vitality * 0.6),
        },
        personality: this.inheritPersonality(ancestor.personality),
        skills: this.inheritSkills(ancestor.skills),
        equipment: {}, // Start with basic equipment
        relationships: [],
        questsCompleted: 0,
        yearsInGuild: 0,
        retirementEligible: false,
        descendantOf: ancestor.id,
      };

      descendants.push(descendant);
    });

    return descendants;
  }

  private generateDescendantName(ancestorName: string, generation: number): string {
    const firstName = ancestorName.split(' ')[0];
    const lastName = ancestorName.split(' ').slice(1).join(' ');

    const generationSuffixes = [
      'the Second',
      'the Third',
      'the Fourth',
      'the Fifth',
      'the Sixth',
      'the Seventh',
      'the Eighth',
      'the Ninth',
      'the Tenth',
    ];

    if (Math.random() < 0.6) {
      // Direct lineage naming
      const suffix = generationSuffixes[Math.min(generation - 2, generationSuffixes.length - 1)];
      return `${firstName} ${suffix}`;
    } else {
      // Related naming
      const newFirstNames = [
        'Alex',
        'Morgan',
        'Casey',
        'Riley',
        'Jordan',
        'Sage',
        'Phoenix',
        'River',
      ];
      const newFirstName = newFirstNames[Math.floor(Math.random() * newFirstNames.length)];
      return lastName ? `${newFirstName} ${lastName}` : `${newFirstName} ${firstName}son`;
    }
  }

  private inheritPersonality(
    ancestorPersonality: Adventurer['personality']
  ): Adventurer['personality'] {
    return {
      courage: Math.min(100, Math.max(0, ancestorPersonality.courage + (Math.random() - 0.5) * 20)),
      loyalty: Math.min(100, Math.max(0, ancestorPersonality.loyalty + (Math.random() - 0.5) * 15)),
      ambition: Math.min(
        100,
        Math.max(0, ancestorPersonality.ambition + (Math.random() - 0.5) * 30)
      ),
      teamwork: Math.min(
        100,
        Math.max(0, ancestorPersonality.teamwork + (Math.random() - 0.5) * 20)
      ),
      greed: Math.min(100, Math.max(0, ancestorPersonality.greed + (Math.random() - 0.5) * 25)),
    };
  }

  private inheritSkills(ancestorSkills: Adventurer['skills']): Adventurer['skills'] {
    const inheritedSkills: Adventurer['skills'] = {
      combat: {
        weaponMastery: Math.floor(ancestorSkills.combat.weaponMastery * 0.3),
        tacticalKnowledge: Math.floor(ancestorSkills.combat.tacticalKnowledge * 0.3),
        battleRage: Math.floor(ancestorSkills.combat.battleRage * 0.3),
      },
      magic: {
        spellPower: Math.floor(ancestorSkills.magic.spellPower * 0.3),
        manaEfficiency: Math.floor(ancestorSkills.magic.manaEfficiency * 0.3),
        elementalMastery: Math.floor(ancestorSkills.magic.elementalMastery * 0.3),
      },
      stealth: {
        lockpicking: Math.floor(ancestorSkills.stealth.lockpicking * 0.3),
        sneaking: Math.floor(ancestorSkills.stealth.sneaking * 0.3),
        assassination: Math.floor(ancestorSkills.stealth.assassination * 0.3),
      },
      survival: {
        tracking: Math.floor(ancestorSkills.survival.tracking * 0.3),
        herbalism: Math.floor(ancestorSkills.survival.herbalism * 0.3),
        animalHandling: Math.floor(ancestorSkills.survival.animalHandling * 0.3),
      },
    };

    return inheritedSkills;
  }

  public executeGenerationTransition(
    currentState: GuildState,
    legacy: GuildLegacy,
    transition: GenerationTransition
  ): { newState: Partial<GuildState>; updatedLegacy: GuildLegacy } {
    // Record current generation in chronicles
    const chronicle = {
      generation: legacy.totalGenerations,
      majorEvents: this.generateMajorEvents(currentState, legacy),
      notableAchievements: this.generateNotableAchievements(currentState),
      finalStats: {
        level: currentState.level,
        reputation: currentState.reputation,
        gold: currentState.gold,
        adventurers: currentState.adventurers.length,
      },
    };

    // Update legacy
    const updatedLegacy: GuildLegacy = {
      ...legacy,
      totalGenerations: legacy.totalGenerations + 1,
      totalQuestsCompleted: legacy.totalQuestsCompleted + currentState.completedQuests.length,
      totalGoldEarned: legacy.totalGoldEarned + currentState.gold,
      totalReputationGained: legacy.totalReputationGained + currentState.reputation,
      heirloomItems: transition.survivingElements.heirloomItems,
      guildChronicles: [...legacy.guildChronicles, chronicle],
    };

    // Check for new legacy bonuses
    const newBonuses = this.checkForLegacyBonuses(updatedLegacy);
    updatedLegacy.activeBonuses = [...legacy.activeBonuses, ...newBonuses];

    // Create new guild state
    const newState: Partial<GuildState> = {
      gold: transition.newGeneration.inheritedGold,
      reputation: transition.newGeneration.inheritedReputation,
      level: 1, // Start over but with bonuses
      adventurers: transition.newGeneration.specialStartingAdventurers,
      activeQuests: [],
      completedQuests: [],
      recruits: [],
      generation: legacy.totalGenerations + 1,
      legacyBonuses: toLegacyBonuses(transition.newGeneration.startingBonuses),
      materials: {}, // Reset materials
      facilities: [], // Reset facilities but keep some benefits through bonuses
      campaigns: [], // Reset campaigns
      worldEvents: [], // Reset world events
      rivalGuilds: [], // Reset rival guilds
      territories: [], // Reset territories but apply inherited influence later
      activeVotes: [],
      retiredAdventurers: [],
      currentSeason: 'spring',
      seasonalQuests: [],
    };

    return { newState, updatedLegacy };
  }

  private generateMajorEvents(currentState: GuildState, _legacy: GuildLegacy): string[] {
    const events: string[] = [];

    // Completed campaigns are major events
    currentState.campaigns.forEach((campaign) => {
      if (campaign.completed) {
        events.push(`Completed the legendary ${campaign.name} campaign`);
      }
    });

    // High-level adventurers are notable
    currentState.adventurers.forEach((adventurer) => {
      if (adventurer.level >= 8) {
        events.push(`${adventurer.name} reached legendary status as a ${adventurer.class}`);
      }
    });

    // Controlled territories
    currentState.territories.forEach((territory) => {
      if (territory.controlled) {
        events.push(`Established control over ${territory.name}`);
      }
    });

    return events.slice(0, 10); // Max 10 major events per generation
  }

  private generateNotableAchievements(currentState: GuildState): string[] {
    const achievements: string[] = [];

    if (currentState.gold > 10000) achievements.push('Accumulated vast wealth');
    if (currentState.reputation > 500) achievements.push('Achieved legendary reputation');
    if (currentState.level > 8) achievements.push('Reached master guild status');
    if (currentState.completedQuests.length > 100) achievements.push('Completed over 100 quests');
    if (currentState.adventurers.length > 15) achievements.push('Built a large adventuring force');

    return achievements;
  }

  public calculateLegacyMultipliers(legacy: GuildLegacy): {
    experienceMultiplier: number;
    goldMultiplier: number;
    reputationMultiplier: number;
    skillMultiplier: number;
    recruitmentMultiplier: number;
  } {
    let experienceMultiplier = 1;
    let goldMultiplier = 1;
    let reputationMultiplier = 1;
    let skillMultiplier = 1;
    let recruitmentMultiplier = 1;

    legacy.activeBonuses.forEach((bonus) => {
      switch (bonus.type) {
        case 'experience':
          experienceMultiplier *= bonus.value;
          break;
        case 'gold':
          goldMultiplier *= bonus.value;
          break;
        case 'reputation':
          reputationMultiplier *= bonus.value;
          break;
        case 'skill':
          skillMultiplier *= bonus.value;
          break;
        case 'recruitment':
          recruitmentMultiplier *= bonus.value;
          break;
      }
    });

    return {
      experienceMultiplier,
      goldMultiplier,
      reputationMultiplier,
      skillMultiplier,
      recruitmentMultiplier,
    };
  }
}

export default LegacySystem;
