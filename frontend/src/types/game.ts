export interface PersonalityTraits {
  courage: number; // 0-100, affects quest preference for dangerous missions
  loyalty: number; // 0-100, affects likelihood to leave guild
  ambition: number; // 0-100, affects experience gain and leadership desires
  teamwork: number; // 0-100, affects team synergy bonuses
  greed: number; // 0-100, affects gold quest preferences
}

export interface SkillTree {
  combat: {
    weaponMastery: number;
    tacticalKnowledge: number;
    battleRage: number;
  };
  magic: {
    spellPower: number;
    manaEfficiency: number;
    elementalMastery: number;
  };
  stealth: {
    lockpicking: number;
    sneaking: number;
    assassination: number;
  };
  survival: {
    tracking: number;
    herbalism: number;
    animalHandling: number;
  };
}

export interface Equipment {
  weapon?: EquipmentItem;
  armor?: EquipmentItem;
  accessory?: EquipmentItem;
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats: {
    strength?: number;
    intelligence?: number;
    dexterity?: number;
    vitality?: number;
  };
  crafted?: boolean;
  materials?: string[];
}

export interface AdventurerRelationship {
  targetId: string;
  type: 'friendship' | 'rivalry' | 'romance';
  strength: number; // 0-100
  history: string[];
}

export interface Adventurer {
  id: string;
  name: string;
  class: 'Warrior' | 'Mage' | 'Rogue' | 'Archer';
  rank: string;
  level: number;
  experience: number;
  status: 'available' | 'on quest' | 'retired' | 'injured';
  stats: {
    strength: number;
    intelligence: number;
    dexterity: number;
    vitality: number;
  };
  personality: PersonalityTraits;
  skills: SkillTree;
  equipment: Equipment;
  relationships: AdventurerRelationship[];
  questsCompleted: number;
  yearsInGuild: number;
  retirementEligible: boolean;
  descendantOf?: string; // ID of ancestor adventurer
}

export interface QuestRequirements {
  minLevel: number;
  preferredClasses: string[];
  skillRequirements?: {
    [skillType: string]: number;
  };
  personalityRequirements?: {
    [trait: string]: { min?: number; max?: number };
  };
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  reward: number;
  duration: number;
  requirements: QuestRequirements;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Epic';
  assignedAdventurers?: string[];
  status: 'available' | 'active' | 'completed' | 'failed';
  questType: 'standard' | 'campaign' | 'world_event' | 'seasonal';
  campaignId?: string;
  seasonalEvent?: string;
  worldEvent?: string;
  procedural?: boolean;
  lootTable?: EquipmentItem[];
  experienceReward: number;
  skillRewards?: {
    [skillType: string]: number;
  };
}

export interface CraftingMaterial {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  sources: string[]; // quest types where this material can be found
}

export interface CraftingRecipe {
  id: string;
  name: string;
  result: EquipmentItem;
  materials: { [materialId: string]: number };
  goldCost: number;
  requiredFacilityLevel: number;
}

export interface Recruit {
  id: string;
  name: string;
  level: number;
  class: 'Warrior' | 'Mage' | 'Rogue' | 'Archer';
  cost: number;
  personality: PersonalityTraits;
  potentialSkills: {
    [skillType: string]: number; // starting skill values
  };
  descendantOf?: string; // if recruit is descendant of retired adventurer
}

export interface Faction {
  id: string;
  name: string;
  reputation: number;
  description: string;
  questModifiers: {
    rewardMultiplier: number;
    availableQuestTypes: string[];
  };
}

export interface GuildFacility {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  cost: number;
  benefits: {
    [key: string]: number;
  };
  description: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  questIds: string[];
  currentQuestIndex: number;
  completed: boolean;
  rewards: {
    gold: number;
    reputation: number;
    items?: EquipmentItem[];
  };
}

export interface WorldEvent {
  id: string;
  name: string;
  description: string;
  active: boolean;
  duration: number; // in days
  effects: {
    questRewardMultiplier?: number;
    adventurerMoraleBonus?: number;
    specialQuestsAvailable?: string[];
  };
}

export interface RivalGuild {
  id: string;
  name: string;
  level: number;
  reputation: number;
  adventurerCount: number;
  competitionLevel: number; // affects how often they compete for quests
}

export interface Territory {
  id: string;
  name: string;
  controlled: boolean;
  influenceLevel: number; // 0-100
  benefits: {
    goldBonus?: number;
    questAccess?: string[];
    recruitAccess?: boolean;
  };
  cost: number;
}

export interface GuildVote {
  id: string;
  topic: string;
  description: string;
  options: string[];
  votes: { [adventurerId: string]: number };
  deadline: number;
  passed?: boolean;
}

export interface RetiredAdventurer {
  id: string;
  originalAdventurer: Adventurer;
  retirementDate: number;
  role: 'trainer' | 'advisor' | 'recruiter' | 'quartermaster';
  benefits: {
    trainingBonus?: number;
    recruitCostReduction?: number;
    questAdvice?: boolean;
  };
}

export interface GuildState {
  gold: number;
  reputation: number;
  level: number;
  adventurers: Adventurer[];
  activeQuests: Quest[];
  completedQuests: string[];
  recruits: Recruit[];
  lastSave: number;

  // New features
  factions: Faction[];
  facilities: GuildFacility[];
  campaigns: Campaign[];
  worldEvents: WorldEvent[];
  rivalGuilds: RivalGuild[];
  territories: Territory[];
  activeVotes: GuildVote[];
  retiredAdventurers: RetiredAdventurer[];

  // Crafting system
  materials: { [materialId: string]: number };
  availableRecipes: string[];

  // Seasonal events
  currentSeason: string;
  seasonalQuests: Quest[];

  // Legacy system
  generation: number;
  legacyBonuses: {
    experienceMultiplier: number;
    goldMultiplier: number;
    reputationMultiplier: number;
  };
}
