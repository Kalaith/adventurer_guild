export const guildConstants = {
  RECRUIT_REFRESH_COST: 50,
  MAX_ADVENTURERS: 25, // Increased for larger guilds
  QUEST_COMPLETION_XP: 100,
  RECRUIT_BASE_COST: 100,
  RECRUIT_COST_MULTIPLIER: 1.2,
  QUEST_TIME_MULTIPLIER: 1.0, // Base time multiplier for quest duration
  GOLD_PER_QUEST_LEVEL: 25, // Base gold reward per quest level
  EXPERIENCE_PER_QUEST_LEVEL: 50, // Base XP per quest level
  RECRUIT_CLASSES: ['Warrior', 'Mage', 'Rogue', 'Archer'] as const,
  QUEST_DIFFICULTIES: ['Easy', 'Medium', 'Hard', 'Epic'] as const,
  ADVENTURER_RANKS: ['Novice', 'Apprentice', 'Journeyman', 'Expert', 'Master', 'Legend'] as const,

  // New system constants
  SKILL_GROWTH_RATE: 1.0, // Base skill growth multiplier
  PERSONALITY_CHANGE_RATE: 0.1, // How much personality can change per quest
  RELATIONSHIP_DECAY_RATE: 0.95, // Weekly relationship strength decay
  RETIREMENT_AGE_THRESHOLD: 8, // Years in guild before retirement eligibility
  CRAFTING_SUCCESS_BASE_RATE: 0.8, // Base crafting success rate
  TERRITORY_INFLUENCE_DECAY: 0.98, // Weekly influence decay in territories
  FACTION_REPUTATION_DECAY: 0.99, // Weekly faction reputation decay
  LEGACY_BONUS_THRESHOLD: 1000, // Minimum total stats for legacy bonuses

  // Equipment rarity weights for procedural generation
  EQUIPMENT_RARITY_WEIGHTS: {
    common: 50,
    uncommon: 30,
    rare: 15,
    epic: 4,
    legendary: 1,
  },

  // Facility upgrade costs
  FACILITY_BASE_COSTS: {
    forge: 500,
    training_ground: 800,
    library: 600,
    barracks: 1000,
    treasury: 1200,
  },
};

// Skill categories and their base values
export const skillDefaults = {
  combat: {
    weaponMastery: 0,
    tacticalKnowledge: 0,
    battleRage: 0,
  },
  magic: {
    spellPower: 0,
    manaEfficiency: 0,
    elementalMastery: 0,
  },
  stealth: {
    lockpicking: 0,
    sneaking: 0,
    assassination: 0,
  },
  survival: {
    tracking: 0,
    herbalism: 0,
    animalHandling: 0,
  },
};

// Personality trait defaults
export const personalityDefaults = {
  courage: 50,
  loyalty: 50,
  ambition: 50,
  teamwork: 50,
  greed: 50,
};

// World event frequencies
export const worldEventFrequency = {
  COMMON: 0.15, // 15% chance per week
  UNCOMMON: 0.08, // 8% chance per week
  RARE: 0.03, // 3% chance per week
  LEGENDARY: 0.01, // 1% chance per week
};

// Legacy system constants
export const legacyConstants = {
  GENERATION_DURATION_MIN: 100, // Minimum quests before generation can end
  HEIRLOOM_ENHANCEMENT: 1.2, // Stat multiplier for heirloom items
  DESCENDANT_INHERITANCE: 0.3, // Percentage of parent stats inherited
  REPUTATION_INHERITANCE: 0.25, // Percentage of reputation carried over
  GOLD_INHERITANCE: 0.15, // Percentage of gold carried over
  MAX_HEIRLOOMS: 20, // Maximum heirloom items per generation
};
