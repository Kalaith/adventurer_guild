import { Territory, Quest, Adventurer } from '../types/game';

export interface TerritoryExpansion {
  id: string;
  targetTerritoryId: string;
  type: 'diplomatic' | 'military' | 'economic' | 'cultural';
  cost: number;
  duration: number; // days
  requirements: {
    minLevel: number;
    minReputation: number;
    requiredAdventurers: number;
    specificSkills?: Array<{ skill: string; minValue: number }>;
  };
  successChance: number; // 0-100
  consequences: {
    success: TerritoryExpansionResult;
    failure: TerritoryExpansionResult;
  };
}

export interface TerritoryExpansionResult {
  goldCost?: number;
  reputationChange?: number;
  influenceGain?: number;
  unlockBenefits?: Territory['benefits'];
  questsUnlocked?: Quest[];
  rivalGuildReaction?: 'hostile' | 'neutral' | 'cooperative';
}

export interface TerritoryConflict {
  id: string;
  territoryId: string;
  conflictType: 'rival_guild' | 'local_resistance' | 'faction_dispute' | 'monster_invasion';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  duration: number;
  effects: {
    influenceLoss: number;
    benefitReduction: number;
    questsBlocked?: string[];
  };
  resolutionOptions: Array<{
    type: 'military' | 'diplomatic' | 'economic';
    cost: number;
    successChance: number;
    description: string;
  }>;
}

export const availableTerritories: Territory[] = [
  {
    id: 'greenwood_village',
    name: 'Greenwood Village',
    controlled: false,
    influenceLevel: 0,
    benefits: {
      goldBonus: 0.1, // 10% gold bonus from village quests
      questAccess: ['forest_patrol', 'bandit_cleanup', 'harvest_protection'],
      recruitAccess: true,
    },
    cost: 500,
  },
  {
    id: 'iron_hills_mine',
    name: 'Iron Hills Mining District',
    controlled: false,
    influenceLevel: 0,
    benefits: {
      goldBonus: 0.15,
      questAccess: ['mine_security', 'ore_transport', 'underground_exploration'],
    },
    cost: 800,
  },
  {
    id: 'crystal_caves',
    name: 'Crystal Caves Network',
    controlled: false,
    influenceLevel: 0,
    benefits: {
      questAccess: ['crystal_harvesting', 'cave_mapping', 'monster_clearing'],
      goldBonus: 0.2,
    },
    cost: 1200,
  },
  {
    id: 'merchants_quarter',
    name: "Merchants' Quarter",
    controlled: false,
    influenceLevel: 0,
    benefits: {
      goldBonus: 0.25,
      recruitAccess: true,
      questAccess: ['trade_route_security', 'merchant_escort', 'market_investigation'],
    },
    cost: 1500,
  },
  {
    id: 'ancient_ruins',
    name: 'Ancient Ruins Complex',
    controlled: false,
    influenceLevel: 0,
    benefits: {
      questAccess: ['archaeological_expedition', 'relic_recovery', 'guardian_awakening'],
      goldBonus: 0.3,
    },
    cost: 2000,
  },
  {
    id: 'frontier_outpost',
    name: 'Frontier Outpost',
    controlled: false,
    influenceLevel: 0,
    benefits: {
      questAccess: ['wilderness_scout', 'monster_hunt', 'territory_expansion'],
      recruitAccess: true,
      goldBonus: 0.1,
    },
    cost: 1000,
  },
  {
    id: 'magical_academy',
    name: 'Arcane Academy District',
    controlled: false,
    influenceLevel: 0,
    benefits: {
      questAccess: ['magical_research', 'artifact_study', 'spell_component_gathering'],
      goldBonus: 0.15,
    },
    cost: 1800,
  },
  {
    id: 'port_district',
    name: 'Harbor Port District',
    controlled: false,
    influenceLevel: 0,
    benefits: {
      questAccess: ['pirate_hunting', 'cargo_protection', 'naval_exploration'],
      goldBonus: 0.2,
      recruitAccess: true,
    },
    cost: 1600,
  },
];

export const territoryQuests: { [territoryId: string]: Quest[] } = {
  greenwood_village: [
    {
      id: 'forest_patrol',
      name: 'Forest Patrol',
      description: 'Patrol the forest borders to keep monsters away from the village.',
      reward: 150,
      duration: 2,
      requirements: {
        minLevel: 2,
        preferredClasses: ['Archer', 'Rogue'],
      },
      difficulty: 'Easy',
      status: 'available',
      questType: 'standard',
      experienceReward: 30,
      skillRewards: {
        'survival.tracking': 5,
      },
    },
    {
      id: 'harvest_protection',
      name: 'Protect the Harvest',
      description: 'Guard the village harvest from wild animals and bandits.',
      reward: 200,
      duration: 3,
      requirements: {
        minLevel: 3,
        preferredClasses: ['Warrior', 'Archer'],
      },
      difficulty: 'Medium',
      status: 'available',
      questType: 'standard',
      experienceReward: 50,
      skillRewards: {
        'combat.weaponMastery': 6,
      },
    },
  ],

  iron_hills_mine: [
    {
      id: 'mine_security',
      name: 'Mine Security Detail',
      description: 'Secure the mining operations from underground threats.',
      reward: 250,
      duration: 4,
      requirements: {
        minLevel: 4,
        preferredClasses: ['Warrior', 'Mage'],
      },
      difficulty: 'Medium',
      status: 'available',
      questType: 'standard',
      experienceReward: 60,
      skillRewards: {
        'combat.weaponMastery': 7,
        'magic.spellPower': 5,
      },
    },
    {
      id: 'underground_exploration',
      name: 'Deep Tunnel Exploration',
      description: 'Explore newly discovered tunnels and map potential dangers.',
      reward: 400,
      duration: 6,
      requirements: {
        minLevel: 6,
        preferredClasses: ['Rogue', 'Archer'],
      },
      difficulty: 'Hard',
      status: 'available',
      questType: 'standard',
      experienceReward: 100,
      skillRewards: {
        'survival.tracking': 10,
        'stealth.sneaking': 8,
      },
    },
  ],

  crystal_caves: [
    {
      id: 'crystal_harvesting',
      name: 'Crystal Harvesting Expedition',
      description:
        'Harvest valuable crystals while protecting the mining teams from cave dwellers.',
      reward: 350,
      duration: 5,
      requirements: {
        minLevel: 5,
        preferredClasses: ['Mage', 'Warrior'],
      },
      difficulty: 'Medium',
      status: 'available',
      questType: 'standard',
      experienceReward: 80,
      skillRewards: {
        'magic.elementalMastery': 8,
        'survival.tracking': 6,
      },
    },
  ],
};

export class TerritoryControlSystem {
  private static instance: TerritoryControlSystem;

  public static getInstance(): TerritoryControlSystem {
    if (!TerritoryControlSystem.instance) {
      TerritoryControlSystem.instance = new TerritoryControlSystem();
    }
    return TerritoryControlSystem.instance;
  }

  public getAvailableTerritories(): Territory[] {
    return availableTerritories.filter((territory) => !territory.controlled);
  }

  public getControlledTerritories(): Territory[] {
    return availableTerritories.filter((territory) => territory.controlled);
  }

  public calculateExpansionCost(territory: Territory, guildLevel: number): number {
    const baseCost = territory.cost;
    const levelModifier = Math.max(0.5, 1 - guildLevel * 0.05); // Slight discount for higher level guilds
    return Math.floor(baseCost * levelModifier);
  }

  public createTerritoryExpansion(
    territory: Territory,
    expansionType: TerritoryExpansion['type'],
    guildLevel: number,
    guildReputation: number
  ): TerritoryExpansion {
    const baseCost = this.calculateExpansionCost(territory, guildLevel);

    const expansionData = {
      diplomatic: {
        costMultiplier: 1.0,
        duration: 7,
        baseSuccessChance: 70,
        requiredSkills: [{ skill: 'magic.spellPower', minValue: 15 }],
      },
      military: {
        costMultiplier: 1.2,
        duration: 5,
        baseSuccessChance: 60,
        requiredSkills: [{ skill: 'combat.weaponMastery', minValue: 20 }],
      },
      economic: {
        costMultiplier: 1.5,
        duration: 10,
        baseSuccessChance: 80,
        requiredSkills: [],
      },
      cultural: {
        costMultiplier: 0.8,
        duration: 14,
        baseSuccessChance: 50,
        requiredSkills: [{ skill: 'magic.spellPower', minValue: 12 }],
      },
    };

    const data = expansionData[expansionType];
    const adjustedSuccessChance = Math.min(
      95,
      data.baseSuccessChance + guildReputation / 20 + guildLevel * 2
    );

    return {
      id: `expansion_${territory.id}_${Date.now()}`,
      targetTerritoryId: territory.id,
      type: expansionType,
      cost: Math.floor(baseCost * data.costMultiplier),
      duration: data.duration,
      requirements: {
        minLevel: Math.max(1, Math.floor(baseCost / 500)),
        minReputation: Math.floor(baseCost / 10),
        requiredAdventurers: Math.max(2, Math.floor(baseCost / 800)),
        specificSkills: data.requiredSkills,
      },
      successChance: adjustedSuccessChance,
      consequences: {
        success: {
          influenceGain: 100,
          reputationChange: 50,
          unlockBenefits: territory.benefits,
          questsUnlocked: territoryQuests[territory.id] || [],
        },
        failure: {
          goldCost: Math.floor(baseCost * 0.3),
          reputationChange: -20,
          influenceGain: 25,
        },
      },
    };
  }

  public executeExpansion(
    expansion: TerritoryExpansion,
    assignedAdventurers: Adventurer[]
  ): { success: boolean; result: TerritoryExpansionResult; description: string } {
    // Calculate actual success chance based on assigned adventurers
    let actualSuccessChance = expansion.successChance;

    // Bonus for having more adventurers than required
    if (assignedAdventurers.length > expansion.requirements.requiredAdventurers) {
      const bonus = (assignedAdventurers.length - expansion.requirements.requiredAdventurers) * 5;
      actualSuccessChance = Math.min(95, actualSuccessChance + bonus);
    }

    // Bonus for adventurer levels
    const averageLevel =
      assignedAdventurers.reduce((sum, adv) => sum + adv.level, 0) / assignedAdventurers.length;
    const levelBonus = Math.max(0, (averageLevel - expansion.requirements.minLevel) * 3);
    actualSuccessChance = Math.min(95, actualSuccessChance + levelBonus);

    // Check skill bonuses
    expansion.requirements.specificSkills?.forEach((skillReq) => {
      const skillBonus = assignedAdventurers.reduce((bonus, adv) => {
        const skillValue = this.getSkillValue(adv, skillReq.skill);
        return bonus + Math.max(0, skillValue - skillReq.minValue);
      }, 0);
      actualSuccessChance = Math.min(95, actualSuccessChance + skillBonus);
    });

    const success = Math.random() * 100 < actualSuccessChance;
    const result = success ? expansion.consequences.success : expansion.consequences.failure;

    let description = '';
    if (success) {
      description = `Your ${expansion.type} expansion into ${expansion.targetTerritoryId} was successful! `;
      description += `The assigned adventurers have established strong influence in the region.`;
    } else {
      description = `The ${expansion.type} expansion attempt failed. `;
      description += `Despite the setback, your adventurers gained some experience and local recognition.`;
    }

    return { success, result, description };
  }

  private getSkillValue(adventurer: Adventurer, skillPath: string): number {
    const parts = skillPath.split('.');
    if (parts.length !== 2) return 0;

    const [category, skill] = parts;
    const skillCategory = adventurer.skills[category as keyof typeof adventurer.skills];
    if (!skillCategory || typeof skillCategory !== 'object') return 0;

    return (skillCategory as Record<string, number>)[skill] || 0;
  }

  public applyTerritoryControl(territoryId: string, influenceLevel: number): void {
    const territory = availableTerritories.find((t) => t.id === territoryId);
    if (territory) {
      territory.controlled = influenceLevel >= 100;
      territory.influenceLevel = Math.min(100, influenceLevel);
    }
  }

  public generateTerritoryConflict(controlledTerritories: Territory[]): TerritoryConflict | null {
    if (controlledTerritories.length === 0) return null;

    // Random chance for conflict
    if (Math.random() > 0.15) return null; // 15% chance per update

    const territory =
      controlledTerritories[Math.floor(Math.random() * controlledTerritories.length)];

    const conflictTypes: Array<{ type: TerritoryConflict['conflictType']; weight: number }> = [
      { type: 'rival_guild', weight: 30 },
      { type: 'local_resistance', weight: 25 },
      { type: 'faction_dispute', weight: 20 },
      { type: 'monster_invasion', weight: 25 },
    ];

    const totalWeight = conflictTypes.reduce((sum, type) => sum + type.weight, 0);
    let random = Math.random() * totalWeight;

    let selectedType: TerritoryConflict['conflictType'] = 'local_resistance';
    for (const conflictType of conflictTypes) {
      random -= conflictType.weight;
      if (random <= 0) {
        selectedType = conflictType.type;
        break;
      }
    }

    const severities: TerritoryConflict['severity'][] = ['minor', 'moderate', 'major', 'critical'];
    const severity = severities[Math.floor(Math.random() * severities.length)];

    const descriptions = {
      rival_guild: `A rival guild is challenging your control over ${territory.name}, claiming they have a better right to manage the territory.`,
      local_resistance: `Local inhabitants in ${territory.name} are resisting your guild's influence, preferring their traditional ways.`,
      faction_dispute: `Different factions within ${territory.name} are in conflict, and your guild's authority is being questioned.`,
      monster_invasion: `A group of dangerous monsters has moved into ${territory.name}, threatening the established order.`,
    };

    const severityMultipliers = { minor: 0.5, moderate: 1, major: 1.5, critical: 2 };
    const multiplier = severityMultipliers[severity];

    return {
      id: `conflict_${territory.id}_${Date.now()}`,
      territoryId: territory.id,
      conflictType: selectedType,
      severity,
      description: descriptions[selectedType],
      duration: Math.ceil((3 + Math.random() * 7) * multiplier), // 3-10 days based on severity
      effects: {
        influenceLoss: Math.ceil(10 * multiplier),
        benefitReduction: Math.ceil(20 * multiplier),
      },
      resolutionOptions: this.generateResolutionOptions(selectedType, severity),
    };
  }

  private generateResolutionOptions(
    conflictType: TerritoryConflict['conflictType'],
    severity: TerritoryConflict['severity']
  ): TerritoryConflict['resolutionOptions'] {
    const severityMultipliers = { minor: 0.7, moderate: 1, major: 1.3, critical: 1.6 };
    const multiplier = severityMultipliers[severity];

    const baseOptions = [
      {
        type: 'military' as const,
        cost: Math.floor(200 * multiplier),
        successChance: 70,
        description: 'Send armed forces to resolve the conflict through strength.',
      },
      {
        type: 'diplomatic' as const,
        cost: Math.floor(150 * multiplier),
        successChance: 60,
        description: 'Negotiate a peaceful resolution through dialogue.',
      },
      {
        type: 'economic' as const,
        cost: Math.floor(300 * multiplier),
        successChance: 80,
        description: 'Use gold and resources to resolve the situation.',
      },
    ];

    // Adjust success chances based on conflict type
    switch (conflictType) {
      case 'rival_guild':
        baseOptions[0].successChance = Math.floor(baseOptions[0].successChance * 1.2); // Military more effective
        baseOptions[1].successChance = Math.floor(baseOptions[1].successChance * 0.8); // Diplomacy less effective
        break;
      case 'local_resistance':
        baseOptions[1].successChance = Math.floor(baseOptions[1].successChance * 1.3); // Diplomacy more effective
        baseOptions[0].successChance = Math.floor(baseOptions[0].successChance * 0.7); // Military less effective
        break;
      case 'monster_invasion':
        baseOptions[0].successChance = Math.floor(baseOptions[0].successChance * 1.4); // Military very effective
        baseOptions[1].successChance = Math.floor(baseOptions[1].successChance * 0.3); // Diplomacy ineffective
        break;
    }

    return baseOptions;
  }

  public resolveConflict(
    conflict: TerritoryConflict,
    resolutionType: 'military' | 'diplomatic' | 'economic',
    assignedAdventurers: Adventurer[]
  ): { success: boolean; description: string; consequences: Record<string, unknown> } {
    const option = conflict.resolutionOptions.find((opt) => opt.type === resolutionType);
    if (!option) {
      return {
        success: false,
        description: 'Invalid resolution option selected.',
        consequences: {},
      };
    }

    // Calculate success chance with adventurer bonuses
    let actualSuccessChance = option.successChance;

    // Bonus for adventurer skills relevant to resolution type
    assignedAdventurers.forEach((adventurer) => {
      switch (resolutionType) {
        case 'military':
          actualSuccessChance += this.getSkillValue(adventurer, 'combat.weaponMastery') / 10;
          break;
        case 'diplomatic':
          actualSuccessChance += adventurer.personality.teamwork / 20;
          break;
        case 'economic':
          actualSuccessChance += adventurer.personality.ambition / 15;
          break;
      }
    });

    actualSuccessChance = Math.min(95, actualSuccessChance);
    const success = Math.random() * 100 < actualSuccessChance;

    let description = '';
    const consequences: Record<string, unknown> = { goldCost: option.cost };

    if (success) {
      description = `The ${resolutionType} approach successfully resolved the ${conflict.conflictType} in ${conflict.territoryId}.`;
      consequences.influenceRestored = conflict.effects.influenceLoss;
      consequences.reputationGain = 20;
    } else {
      description = `The ${resolutionType} approach failed to resolve the conflict. The situation remains tense.`;
      consequences.influenceLoss = Math.floor(conflict.effects.influenceLoss / 2);
      consequences.reputationLoss = 10;
    }

    return { success, description, consequences };
  }

  public calculateTerritoryBenefits(controlledTerritories: Territory[]): {
    totalGoldBonus: number;
    availableQuests: Quest[];
    specialRecruits: boolean;
  } {
    let totalGoldBonus = 0;
    const availableQuests: Quest[] = [];
    let specialRecruits = false;

    controlledTerritories.forEach((territory) => {
      if (territory.benefits.goldBonus) {
        totalGoldBonus += territory.benefits.goldBonus * (territory.influenceLevel / 100);
      }

      if (territory.benefits.questAccess) {
        const territoryQuests = territoryQuests[territory.id] || [];
        availableQuests.push(...territoryQuests);
      }

      if (territory.benefits.recruitAccess) {
        specialRecruits = true;
      }
    });

    return { totalGoldBonus, availableQuests, specialRecruits };
  }

  public getTerritoryById(territoryId: string): Territory | undefined {
    return availableTerritories.find((t) => t.id === territoryId);
  }

  public getExpansionRequirements(
    territory: Territory,
    expansionType: TerritoryExpansion['type']
  ): string[] {
    const expansion = this.createTerritoryExpansion(territory, expansionType, 1, 0);
    const requirements: string[] = [];

    requirements.push(`Cost: ${expansion.cost} gold`);
    requirements.push(`Duration: ${expansion.duration} days`);
    requirements.push(`Min Guild Level: ${expansion.requirements.minLevel}`);
    requirements.push(`Min Reputation: ${expansion.requirements.minReputation}`);
    requirements.push(`Required Adventurers: ${expansion.requirements.requiredAdventurers}`);

    expansion.requirements.specificSkills?.forEach((skill) => {
      requirements.push(`Required Skill: ${skill.skill} (${skill.minValue}+)`);
    });

    return requirements;
  }
}

export default TerritoryControlSystem;
