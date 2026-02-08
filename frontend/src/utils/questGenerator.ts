import { Quest, QuestRequirements, EquipmentItem } from '../types/game';

interface QuestTemplate {
  nameTemplates: string[];
  descriptionTemplates: string[];
  questType: 'combat' | 'exploration' | 'diplomatic' | 'crafting' | 'rescue';
  baseReward: number;
  baseDuration: number;
  difficultyModifiers: {
    [key in 'Easy' | 'Medium' | 'Hard' | 'Epic']: {
      rewardMultiplier: number;
      durationMultiplier: number;
      levelMultiplier: number;
    };
  };
}

const QUEST_TEMPLATES: QuestTemplate[] = [
  {
    nameTemplates: [
      'Goblin Raiders in {location}',
      'Bandit Assault on {location}',
      'Orc Warband Threat',
      'Wolf Pack Elimination'
    ],
    descriptionTemplates: [
      'A group of {enemy} has been terrorizing the {location}. The local authorities have posted a bounty for their elimination.',
      'Merchants report attacks by {enemy} near {location}. Brave adventurers needed to restore safe passage.',
      'The {enemy} have been growing bolder in their attacks. Time to show them the might of our guild!'
    ],
    questType: 'combat',
    baseReward: 100,
    baseDuration: 2,
    difficultyModifiers: {
      'Easy': { rewardMultiplier: 1, durationMultiplier: 1, levelMultiplier: 1 },
      'Medium': { rewardMultiplier: 1.5, durationMultiplier: 1.2, levelMultiplier: 1.5 },
      'Hard': { rewardMultiplier: 2.5, durationMultiplier: 1.5, levelMultiplier: 2 },
      'Epic': { rewardMultiplier: 4, durationMultiplier: 2, levelMultiplier: 3 }
    }
  },
  {
    nameTemplates: [
      'Ancient Ruins of {location}',
      'Lost Temple Discovery',
      'Forgotten Catacombs',
      'Mysterious Cave System'
    ],
    descriptionTemplates: [
      'Ancient ruins have been discovered in {location}. Scholars seek brave explorers to map and investigate the site.',
      'A lost temple has been found containing unknown treasures. Adventurers needed for careful exploration.',
      'Deep underground passages have been uncovered. What secrets do they hold?'
    ],
    questType: 'exploration',
    baseReward: 150,
    baseDuration: 3,
    difficultyModifiers: {
      'Easy': { rewardMultiplier: 1, durationMultiplier: 1, levelMultiplier: 1 },
      'Medium': { rewardMultiplier: 1.4, durationMultiplier: 1.3, levelMultiplier: 1.5 },
      'Hard': { rewardMultiplier: 2.2, durationMultiplier: 1.6, levelMultiplier: 2 },
      'Epic': { rewardMultiplier: 3.5, durationMultiplier: 2.2, levelMultiplier: 3 }
    }
  },
  {
    nameTemplates: [
      'Peace Negotiations with {faction}',
      'Trade Agreement Mediation',
      'Diplomatic Mission to {location}',
      'Alliance Building Initiative'
    ],
    descriptionTemplates: [
      'Tensions are rising between local factions. Skilled diplomats needed to prevent conflict.',
      'A trade dispute threatens regional stability. Mediators required to find common ground.',
      'An important diplomatic mission requires representatives who can navigate complex political waters.'
    ],
    questType: 'diplomatic',
    baseReward: 200,
    baseDuration: 4,
    difficultyModifiers: {
      'Easy': { rewardMultiplier: 1, durationMultiplier: 1, levelMultiplier: 1 },
      'Medium': { rewardMultiplier: 1.3, durationMultiplier: 1.1, levelMultiplier: 1.5 },
      'Hard': { rewardMultiplier: 2, durationMultiplier: 1.4, levelMultiplier: 2 },
      'Epic': { rewardMultiplier: 3, durationMultiplier: 1.8, levelMultiplier: 3 }
    }
  },
  {
    nameTemplates: [
      'Missing Person: {name}',
      'Kidnapped Noble',
      'Lost Caravan Rescue',
      'Trapped Miners'
    ],
    descriptionTemplates: [
      '{name} has gone missing in the {location}. Their family offers a substantial reward for their safe return.',
      'A caravan has disappeared while traveling through dangerous territory. Rescue mission urgently needed.',
      'Miners trapped in a collapsed tunnel need immediate rescue. Time is of the essence!'
    ],
    questType: 'rescue',
    baseReward: 180,
    baseDuration: 1,
    difficultyModifiers: {
      'Easy': { rewardMultiplier: 1, durationMultiplier: 1, levelMultiplier: 1 },
      'Medium': { rewardMultiplier: 1.6, durationMultiplier: 1.2, levelMultiplier: 1.5 },
      'Hard': { rewardMultiplier: 2.8, durationMultiplier: 1.8, levelMultiplier: 2 },
      'Epic': { rewardMultiplier: 4.5, durationMultiplier: 2.5, levelMultiplier: 3 }
    }
  }
];

const LOCATIONS = [
  'Whispering Woods', 'Crystal Caves', 'Sunken Valley', 'Frost Peak Mountains',
  'Goldstream Village', 'Iron Hills', 'Shadowmere Swamp', 'Dragon\'s Rest',
  'Merchant\'s Road', 'Ancient Bridge', 'Mystic Grove', 'Thunder Rapids'
];

const ENEMIES = [
  'goblins', 'bandits', 'orcs', 'wolves', 'undead', 'cultists',
  'raiders', 'brigands', 'wild beasts', 'corrupted spirits'
];

const FACTIONS = [
  'Merchant\'s Guild', 'Temple of Light', 'Forest Druids', 'Mountain Clans',
  'Royal Guard', 'Thieves\' Brotherhood', 'Mage Circle', 'Artisan League'
];

const PERSON_NAMES = [
  'Elena Brightblade', 'Marcus Goldweaver', 'Sara Nightwhisper', 'Tom Ironforge',
  'Lady Catherine', 'Sir Roderick', 'Merchant Aldwin', 'Scholar Lysander'
];

function getRandomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function replacePlaceholders(template: string, _guildLevel: number): string {
  return template
    .replace('{location}', getRandomElement(LOCATIONS))
    .replace('{enemy}', getRandomElement(ENEMIES))
    .replace('{faction}', getRandomElement(FACTIONS))
    .replace('{name}', getRandomElement(PERSON_NAMES));
}

function generateQuestRequirements(
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Epic',
  questType: string,
  guildLevel: number
): QuestRequirements {
  const difficultyLevelMap = { 'Easy': 1, 'Medium': 3, 'Hard': 5, 'Epic': 8 };
  const baseLevel = Math.max(1, guildLevel - 2 + difficultyLevelMap[difficulty]);

  const requirements: QuestRequirements = {
    minLevel: baseLevel,
    preferredClasses: []
  };

  // Add class preferences based on quest type
  switch (questType) {
    case 'combat':
      requirements.preferredClasses = ['Warrior', 'Archer'];
      break;
    case 'exploration':
      requirements.preferredClasses = ['Rogue', 'Archer'];
      break;
    case 'diplomatic':
      requirements.preferredClasses = ['Mage'];
      break;
    case 'rescue':
      requirements.preferredClasses = ['Warrior', 'Rogue'];
      break;
  }

  // Add skill requirements for higher difficulties
  if (difficulty !== 'Easy') {
    requirements.skillRequirements = {};
    switch (questType) {
      case 'combat':
        requirements.skillRequirements['combat.weaponMastery'] = baseLevel * 2;
        break;
      case 'exploration':
        requirements.skillRequirements['survival.tracking'] = baseLevel * 2;
        break;
      case 'diplomatic':
        requirements.skillRequirements['magic.spellPower'] = baseLevel * 2;
        break;
      case 'rescue':
        requirements.skillRequirements['stealth.sneaking'] = baseLevel * 2;
        break;
    }
  }

  // Add personality requirements
  if (difficulty === 'Hard' || difficulty === 'Epic') {
    requirements.personalityRequirements = {};
    switch (questType) {
      case 'combat':
        requirements.personalityRequirements['courage'] = { min: 60 };
        break;
      case 'exploration':
        requirements.personalityRequirements['ambition'] = { min: 50 };
        break;
      case 'diplomatic':
        requirements.personalityRequirements['loyalty'] = { min: 70 };
        break;
      case 'rescue':
        requirements.personalityRequirements['courage'] = { min: 80 };
        break;
    }
  }

  return requirements;
}

function generateLootTable(difficulty: 'Easy' | 'Medium' | 'Hard' | 'Epic', questType: string): EquipmentItem[] {
  const loot: EquipmentItem[] = [];
  const rarityMap = {
    'Easy': ['common', 'uncommon'],
    'Medium': ['uncommon', 'rare'],
    'Hard': ['rare', 'epic'],
    'Epic': ['epic', 'legendary']
  };

  const availableRarities = rarityMap[difficulty] as Array<'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'>;
  const rarity = getRandomElement(availableRarities);

  // Generate a random equipment item
  const equipmentTypes = ['weapon', 'armor', 'accessory'] as const;
  const equipmentType = getRandomElement(equipmentTypes);

  const item: EquipmentItem = {
    id: `generated_${Date.now()}_${Math.random()}`,
    name: generateEquipmentName(equipmentType, rarity),
    type: equipmentType,
    rarity,
    stats: generateEquipmentStats(rarity, questType),
    crafted: false
  };

  loot.push(item);
  return loot;
}

function generateEquipmentName(type: 'weapon' | 'armor' | 'accessory', rarity: string): string {
  const prefixes = {
    common: ['Simple', 'Basic', 'Plain'],
    uncommon: ['Fine', 'Quality', 'Improved'],
    rare: ['Masterwork', 'Superior', 'Excellent'],
    epic: ['Enchanted', 'Mystical', 'Legendary'],
    legendary: ['Godforged', 'Artifact', 'Divine']
  };

  const weaponNames = ['Sword', 'Axe', 'Bow', 'Staff', 'Dagger'];
  const armorNames = ['Chainmail', 'Plate', 'Robes', 'Leather Armor', 'Scale Mail'];
  const accessoryNames = ['Ring', 'Amulet', 'Cloak', 'Belt', 'Boots'];

  const names = type === 'weapon' ? weaponNames : type === 'armor' ? armorNames : accessoryNames;
  const prefix = getRandomElement(prefixes[rarity as keyof typeof prefixes]);
  const baseName = getRandomElement(names);

  return `${prefix} ${baseName}`;
}

function generateEquipmentStats(rarity: string, questType: string) {
  const rarityMultiplier = {
    common: 1, uncommon: 1.5, rare: 2.5, epic: 4, legendary: 6
  };

  const multiplier = rarityMultiplier[rarity as keyof typeof rarityMultiplier];
  const baseStats = { strength: 0, intelligence: 0, dexterity: 0, vitality: 0 };

  // Assign stats based on quest type
  switch (questType) {
    case 'combat':
      baseStats.strength = Math.floor(5 * multiplier);
      baseStats.vitality = Math.floor(3 * multiplier);
      break;
    case 'exploration':
      baseStats.dexterity = Math.floor(5 * multiplier);
      baseStats.vitality = Math.floor(3 * multiplier);
      break;
    case 'diplomatic':
      baseStats.intelligence = Math.floor(5 * multiplier);
      baseStats.dexterity = Math.floor(3 * multiplier);
      break;
    case 'rescue':
      baseStats.strength = Math.floor(3 * multiplier);
      baseStats.dexterity = Math.floor(5 * multiplier);
      break;
  }

  return baseStats;
}

export function generateProceduralQuest(guildLevel: number, difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Epic'): Quest {
  const template = getRandomElement(QUEST_TEMPLATES);
  const questDifficulty = difficulty || getRandomElement(['Easy', 'Medium', 'Hard', 'Epic'] as const);
  const modifier = template.difficultyModifiers[questDifficulty];

  const name = replacePlaceholders(getRandomElement(template.nameTemplates), guildLevel);
  const description = replacePlaceholders(getRandomElement(template.descriptionTemplates), guildLevel);

  const baseReward = template.baseReward * modifier.rewardMultiplier * (guildLevel * 0.5 + 1);
  const baseDuration = Math.ceil(template.baseDuration * modifier.durationMultiplier);

  return {
    id: `procedural_${Date.now()}_${Math.random()}`,
    name,
    description,
    reward: Math.floor(baseReward),
    duration: baseDuration,
    requirements: generateQuestRequirements(questDifficulty, template.questType, guildLevel),
    difficulty: questDifficulty,
    status: 'available',
    questType: 'standard',
    procedural: true,
    lootTable: generateLootTable(questDifficulty, template.questType),
    experienceReward: Math.floor(baseReward / 10),
    skillRewards: {
      [`${template.questType === 'combat' ? 'combat' : template.questType === 'exploration' ? 'survival' : template.questType === 'diplomatic' ? 'magic' : 'stealth'}.${template.questType === 'combat' ? 'weaponMastery' : template.questType === 'exploration' ? 'tracking' : template.questType === 'diplomatic' ? 'spellPower' : 'sneaking'}`]: Math.floor(modifier.levelMultiplier * 2)
    }
  };
}

export function generateMultipleQuests(guildLevel: number, count: number = 5): Quest[] {
  const quests: Quest[] = [];
  for (let i = 0; i < count; i++) {
    quests.push(generateProceduralQuest(guildLevel));
  }
  return quests;
}
