import { Adventurer, RetiredAdventurer, Recruit, PersonalityTraits, SkillTree } from '../types/game';

export interface RetirementEvent {
  id: string;
  adventurerId: string;
  reason: 'age' | 'injury' | 'achievement' | 'relationship' | 'wealth' | 'voluntary';
  description: string;
  benefits: RetiredAdventurer['benefits'];
  farewellMessage: string;
}

export interface RetirementOption {
  role: RetiredAdventurer['role'];
  name: string;
  description: string;
  requirements: {
    minLevel?: number;
    minQuestsCompleted?: number;
    specificSkills?: Array<{ skill: string; minValue: number }>;
    personality?: Array<{ trait: keyof PersonalityTraits; minValue: number }>;
  };
  benefits: RetiredAdventurer['benefits'];
}

export const retirementRoles: RetirementOption[] = [
  {
    role: 'trainer',
    name: 'Guild Trainer',
    description: 'Share knowledge and skills with new recruits, helping them grow faster.',
    requirements: {
      minLevel: 5,
      minQuestsCompleted: 20,
      specificSkills: [
        { skill: 'combat.weaponMastery', minValue: 20 },
        { skill: 'magic.spellPower', minValue: 15 }
      ]
    },
    benefits: {
      trainingBonus: 25 // 25% faster skill growth for new adventurers
    }
  },
  {
    role: 'advisor',
    name: 'Strategic Advisor',
    description: 'Provide wisdom and counsel for difficult quests and guild decisions.',
    requirements: {
      minLevel: 6,
      minQuestsCompleted: 30,
      specificSkills: [
        { skill: 'combat.tacticalKnowledge', minValue: 20 }
      ],
      personality: [
        { trait: 'loyalty', minValue: 70 },
        { trait: 'ambition', minValue: 60 }
      ]
    },
    benefits: {
      questAdvice: true // Provides tactical advice that improves success rates
    }
  },
  {
    role: 'recruiter',
    name: 'Talent Scout',
    description: 'Use connections and experience to find better recruits for the guild.',
    requirements: {
      minLevel: 4,
      minQuestsCompleted: 25,
      personality: [
        { trait: 'teamwork', minValue: 60 }
      ]
    },
    benefits: {
      recruitCostReduction: 30 // 30% reduction in recruit costs
    }
  },
  {
    role: 'quartermaster',
    name: 'Guild Quartermaster',
    description: 'Manage guild resources and equipment with experienced efficiency.',
    requirements: {
      minLevel: 5,
      minQuestsCompleted: 15,
      personality: [
        { trait: 'loyalty', minValue: 80 },
        { trait: 'greed', minValue: 30 }
      ]
    },
    benefits: {
      questAdvice: true // Helps optimize resource allocation
    }
  }
];

export class RetirementSystem {
  private static instance: RetirementSystem;

  public static getInstance(): RetirementSystem {
    if (!RetirementSystem.instance) {
      RetirementSystem.instance = new RetirementSystem();
    }
    return RetirementSystem.instance;
  }

  public checkForRetirementEligibility(adventurer: Adventurer): boolean {
    // Base retirement conditions
    const ageRetirement = adventurer.yearsInGuild >= 8;
    const achievementRetirement = adventurer.level >= 10 && adventurer.questsCompleted >= 50;
    const voluntaryRetirement = adventurer.level >= 6 && adventurer.questsCompleted >= 25;

    return ageRetirement || achievementRetirement || voluntaryRetirement;
  }

  public generateRetirementEvent(adventurer: Adventurer): RetirementEvent {
    const reason = this.determineRetirementReason(adventurer);
    const availableRole = this.getBestRetirementRole(adventurer);

    return {
      id: `retirement_${adventurer.id}_${Date.now()}`,
      adventurerId: adventurer.id,
      reason,
      description: this.getRetirementDescription(adventurer, reason),
      benefits: availableRole?.benefits || {},
      farewellMessage: this.generateFarewellMessage(adventurer, reason)
    };
  }

  private determineRetirementReason(adventurer: Adventurer): RetirementEvent['reason'] {
    // Check various conditions
    if (adventurer.yearsInGuild >= 10) return 'age';
    if (adventurer.level >= 10 && adventurer.questsCompleted >= 50) return 'achievement';
    if (adventurer.status === 'injured') return 'injury';

    // Check personality-based retirement
    if (adventurer.personality.greed >= 80) return 'wealth';
    if (adventurer.relationships.some(rel => rel.type === 'romance' && rel.strength >= 90)) {
      return 'relationship';
    }

    return 'voluntary';
  }

  private getRetirementDescription(adventurer: Adventurer, reason: RetirementEvent['reason']): string {
    switch (reason) {
      case 'age':
        return `${adventurer.name} feels the weight of years of adventuring and wishes to settle into a quieter role within the guild.`;
      case 'injury':
        return `${adventurer.name} has sustained injuries that prevent them from continuing active duty, but they wish to serve the guild in other ways.`;
      case 'achievement':
        return `${adventurer.name} has achieved legendary status and wants to pass on their knowledge to the next generation.`;
      case 'relationship':
        return `${adventurer.name} has found love and wishes to start a family while remaining connected to the guild.`;
      case 'wealth':
        return `${adventurer.name} has accumulated enough wealth from adventuring to live comfortably, but wants to give back to the guild.`;
      default:
        return `${adventurer.name} has decided it's time to step back from active adventuring and take on a supporting role.`;
    }
  }

  private generateFarewellMessage(adventurer: Adventurer, reason: RetirementEvent['reason']): string {
    const messages = {
      age: [
        `"My bones creak like old floorboards, but my spirit remains with this guild forever."`,
        `"I may be stepping down, but I'll always be here if you need guidance."`,
        `"Time to let younger heroes take the spotlight - I'll be cheering from the sidelines."`
      ],
      injury: [
        `"This body may be broken, but my dedication to this guild is unbreakable."`,
        `"I can't swing a sword anymore, but I can still train others to swing theirs better."`
      ],
      achievement: [
        `"I've climbed every mountain there is to climb. Now I want to help others reach those same peaks."`,
        `"They say legends never die - I plan to live on through the adventurers I train."`
      ],
      relationship: [
        `"Adventure called to me once, but now love calls louder. I'll serve the guild in new ways."`,
        `"Starting a family doesn't mean ending my loyalty to this guild."`
      ],
      wealth: [
        `"I have enough gold to last several lifetimes. Time to invest in the guild's future instead."`,
        `"Riches are meaningless without purpose. My purpose is helping this guild thrive."`
      ],
      voluntary: [
        `"It's been an honor serving alongside all of you. Time for the next chapter."`,
        `"I'm not leaving - just changing how I contribute to our shared mission."`
      ]
    };

    const categoryMessages = messages[reason] || messages.voluntary;
    return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
  }

  public getBestRetirementRole(adventurer: Adventurer): RetirementOption | null {
    const eligibleRoles = retirementRoles.filter(role =>
      this.meetsRequirements(adventurer, role.requirements)
    );

    if (eligibleRoles.length === 0) return null;

    // Sort by how well the adventurer fits the role
    eligibleRoles.sort((a, b) => {
      const scoreA = this.calculateRoleFitness(adventurer, a);
      const scoreB = this.calculateRoleFitness(adventurer, b);
      return scoreB - scoreA;
    });

    return eligibleRoles[0];
  }

  private meetsRequirements(adventurer: Adventurer, requirements: RetirementOption['requirements']): boolean {
    if (requirements.minLevel && adventurer.level < requirements.minLevel) return false;
    if (requirements.minQuestsCompleted && adventurer.questsCompleted < requirements.minQuestsCompleted) return false;

    if (requirements.specificSkills) {
      for (const skillReq of requirements.specificSkills) {
        const skillValue = this.getSkillValue(adventurer.skills, skillReq.skill);
        if (skillValue < skillReq.minValue) return false;
      }
    }

    if (requirements.personality) {
      for (const personalityReq of requirements.personality) {
        if (adventurer.personality[personalityReq.trait] < personalityReq.minValue) return false;
      }
    }

    return true;
  }

  private calculateRoleFitness(adventurer: Adventurer, role: RetirementOption): number {
    let score = 0;

    // Base score from level and quests
    score += adventurer.level * 2;
    score += adventurer.questsCompleted;

    // Bonus for exceeding requirements
    if (role.requirements.specificSkills) {
      role.requirements.specificSkills.forEach(skillReq => {
        const skillValue = this.getSkillValue(adventurer.skills, skillReq.skill);
        score += Math.max(0, skillValue - skillReq.minValue);
      });
    }

    if (role.requirements.personality) {
      role.requirements.personality.forEach(personalityReq => {
        const personalityValue = adventurer.personality[personalityReq.trait];
        score += Math.max(0, personalityValue - personalityReq.minValue);
      });
    }

    return score;
  }

  private getSkillValue(skills: SkillTree, skillPath: string): number {
    const parts = skillPath.split('.');
    if (parts.length !== 2) return 0;

    const [category, skill] = parts;
    const skillCategory = skills[category as keyof SkillTree];
    if (!skillCategory || typeof skillCategory !== 'object') return 0;

    return (skillCategory as Record<string, number>)[skill] || 0;
  }

  public processRetirement(adventurer: Adventurer): RetiredAdventurer {
    const retirementEvent = this.generateRetirementEvent(adventurer);
    const role = this.getBestRetirementRole(adventurer);

    return {
      id: `retired_${adventurer.id}`,
      originalAdventurer: adventurer,
      retirementDate: Date.now(),
      role: role?.role || 'advisor',
      benefits: retirementEvent.benefits
    };
  }

  public generateDescendantRecruit(retiredAdventurer: RetiredAdventurer): Recruit {
    const parent = retiredAdventurer.originalAdventurer;
    const descendantNames = [
      `${parent.name} Jr.`,
      `${this.getDescendantFirstName()} ${parent.name.split(' ').pop()}`,
      `${parent.name.split(' ')[0]} the Younger`
    ];

    const descendantName = descendantNames[Math.floor(Math.random() * descendantNames.length)];

    // Inherit some traits from parent but with variation
    const inheritedPersonality: PersonalityTraits = {
      courage: Math.min(100, Math.max(0, parent.personality.courage + (Math.random() - 0.5) * 30)),
      loyalty: Math.min(100, Math.max(0, parent.personality.loyalty + (Math.random() - 0.5) * 20)),
      ambition: Math.min(100, Math.max(0, parent.personality.ambition + (Math.random() - 0.5) * 40)),
      teamwork: Math.min(100, Math.max(0, parent.personality.teamwork + (Math.random() - 0.5) * 25)),
      greed: Math.min(100, Math.max(0, parent.personality.greed + (Math.random() - 0.5) * 35))
    };

    // Inherit class preference (80% chance) or get random class
    const inheritedClass = Math.random() < 0.8 ? parent.class :
      (['Warrior', 'Mage', 'Rogue', 'Archer'] as const)[Math.floor(Math.random() * 4)];

    const baseLevel = Math.max(1, Math.floor(parent.level * 0.3) + Math.floor(Math.random() * 3));

    // Inherit some skill potential from parent
    const potentialSkills: { [skillType: string]: number } = {};
    Object.keys(parent.skills).forEach(category => {
      const skillCategory = parent.skills[category as keyof SkillTree];
      if (typeof skillCategory === 'object') {
        Object.keys(skillCategory).forEach(skill => {
          const parentValue = (skillCategory as Record<string, number>)[skill];
          const inheritedValue = Math.floor(parentValue * 0.2 + Math.random() * 5);
          if (inheritedValue > 0) {
            potentialSkills[`${category}.${skill}`] = inheritedValue;
          }
        });
      }
    });

    return {
      id: `descendant_${parent.id}_${Date.now()}`,
      name: descendantName,
      level: baseLevel,
      class: inheritedClass,
      cost: Math.floor((300 + baseLevel * 50) * 0.8), // 20% discount for descendants
      personality: inheritedPersonality,
      potentialSkills,
      descendantOf: parent.id
    };
  }

  private getDescendantFirstName(): string {
    const names = [
      'Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage',
      'Rowan', 'River', 'Phoenix', 'Skylar', 'Ember', 'Aspen', 'Wren', 'Kai',
      'Nova', 'Orion', 'Luna', 'Aria', 'Zara', 'Felix', 'Iris', 'Leo'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  public getRetirementBenefits(retiredAdventurers: RetiredAdventurer[]): {
    trainingBonus: number;
    recruitCostReduction: number;
    questAdvice: boolean;
  } {
    const benefits = {
      trainingBonus: 0,
      recruitCostReduction: 0,
      questAdvice: false
    };

    retiredAdventurers.forEach(retired => {
      if (retired.benefits.trainingBonus) {
        benefits.trainingBonus += retired.benefits.trainingBonus;
      }
      if (retired.benefits.recruitCostReduction) {
        benefits.recruitCostReduction += retired.benefits.recruitCostReduction;
      }
      if (retired.benefits.questAdvice) {
        benefits.questAdvice = true;
      }
    });

    return benefits;
  }

  public generateRetirementParty(adventurer: Adventurer): {
    cost: number;
    description: string;
    benefits: {
      moraleBonus: number;
      reputationGain: number;
      guildLoyalty: number;
    };
  } {
    const baseCost = 200 + adventurer.level * 50;

    return {
      cost: baseCost,
      description: `Throw a grand retirement party for ${adventurer.name} to celebrate their years of service to the guild.`,
      benefits: {
        moraleBonus: 15 + adventurer.level * 2,
        reputationGain: 20 + adventurer.questsCompleted,
        guildLoyalty: 25 // Improves loyalty of all remaining adventurers
      }
    };
  }
}

export default RetirementSystem;