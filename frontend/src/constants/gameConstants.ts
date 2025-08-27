export const GUILD_CONSTANTS = {
  RECRUIT_REFRESH_COST: 50,
  MAX_ADVENTURERS: 10,
  QUEST_COMPLETION_XP: 100,
  RECRUIT_BASE_COST: 100,
  RECRUIT_COST_MULTIPLIER: 1.2,
  QUEST_TIME_MULTIPLIER: 1.0, // Base time multiplier for quest duration
  GOLD_PER_QUEST_LEVEL: 25, // Base gold reward per quest level
  EXPERIENCE_PER_QUEST_LEVEL: 50, // Base XP per quest level
  RECRUIT_CLASSES: ['Warrior', 'Mage', 'Rogue', 'Archer'] as const,
  QUEST_DIFFICULTIES: ['Easy', 'Medium', 'Hard'] as const,
  ADVENTURER_RANKS: ['Novice', 'Apprentice', 'Journeyman', 'Expert', 'Master'] as const,
};
