import { Quest, EquipmentItem, Recruit } from '../types/game';

export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter' | 'festival';

export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  season: SeasonType;
  duration: number; // days
  rewards: {
    goldBonus: number;
    experienceBonus: number;
    specialItems: EquipmentItem[];
  };
  quests: Quest[];
  specialRecruits?: Recruit[];
  unlockConditions?: {
    guildLevel?: number;
    reputation?: number;
    completedQuests?: string[];
  };
}

export const seasonalEvents: SeasonalEvent[] = [
  {
    id: 'spring_awakening',
    name: 'Spring Awakening Festival',
    description:
      'Nature blooms anew and magical energies flow freely. Ancient spirits awaken from winter slumber.',
    season: 'spring',
    duration: 10,
    rewards: {
      goldBonus: 1.2,
      experienceBonus: 1.3,
      specialItems: [
        {
          id: 'bloom_staff',
          name: 'Staff of Eternal Bloom',
          type: 'weapon',
          rarity: 'epic',
          stats: { intelligence: 25, vitality: 15, dexterity: 10 },
          crafted: false,
        },
        {
          id: 'nature_crown',
          name: "Crown of Nature's Favor",
          type: 'accessory',
          rarity: 'rare',
          stats: { intelligence: 18, vitality: 12 },
          crafted: false,
        },
      ],
    },
    quests: [
      {
        id: 'awaken_grove',
        name: 'Awaken the Sacred Grove',
        description:
          'Help the forest spirits perform the ritual of spring awakening in the ancient sacred grove.',
        reward: 300,
        duration: 4,
        requirements: {
          minLevel: 3,
          preferredClasses: ['Mage', 'Archer'],
          skillRequirements: {
            'magic.elementalMastery': 12,
            'survival.herbalism': 10,
          },
          personalityRequirements: {
            ambition: { min: 40 },
          },
        },
        difficulty: 'Medium',
        status: 'available',
        questType: 'seasonal',
        seasonalEvent: 'spring_awakening',
        experienceReward: 80,
        skillRewards: {
          'magic.elementalMastery': 10,
          'survival.herbalism': 8,
        },
      },
      {
        id: 'flower_festival',
        name: 'Flower Festival Guardian',
        description:
          "Protect the flower festival from creatures corrupted by winter's lingering darkness.",
        reward: 200,
        duration: 2,
        requirements: {
          minLevel: 2,
          preferredClasses: ['Warrior', 'Rogue'],
        },
        difficulty: 'Easy',
        status: 'available',
        questType: 'seasonal',
        seasonalEvent: 'spring_awakening',
        experienceReward: 50,
        skillRewards: {
          'combat.weaponMastery': 6,
        },
      },
    ],
    specialRecruits: [
      {
        id: 'spring_druid',
        name: 'Grove Keeper Elara',
        level: 4,
        class: 'Mage',
        cost: 400,
        personality: {
          courage: 60,
          loyalty: 85,
          ambition: 45,
          teamwork: 80,
          greed: 20,
        },
        potentialSkills: {
          'magic.elementalMastery': 20,
          'survival.herbalism': 18,
          'magic.spellPower': 15,
        },
      },
    ],
  },

  {
    id: 'summer_solstice',
    name: 'Midsummer Fire Festival',
    description:
      'The sun reaches its peak power, and fire elementals dance in celebration. Heroes test their courage against trials of flame.',
    season: 'summer',
    duration: 7,
    rewards: {
      goldBonus: 1.5,
      experienceBonus: 1.2,
      specialItems: [
        {
          id: 'solar_blade',
          name: 'Sword of Solar Flare',
          type: 'weapon',
          rarity: 'legendary',
          stats: { strength: 30, intelligence: 15, vitality: 20 },
          crafted: false,
        },
        {
          id: 'flame_cloak',
          name: 'Cloak of Dancing Flames',
          type: 'armor',
          rarity: 'epic',
          stats: { vitality: 20, intelligence: 18, dexterity: 12 },
          crafted: false,
        },
      ],
    },
    quests: [
      {
        id: 'trials_of_flame',
        name: 'Trials of the Eternal Flame',
        description:
          'Prove your worth by completing the ancient fire trials that test courage, strength, and wisdom.',
        reward: 500,
        duration: 6,
        requirements: {
          minLevel: 5,
          preferredClasses: ['Warrior', 'Mage'],
          skillRequirements: {
            'combat.battleRage': 15,
            'magic.elementalMastery': 18,
          },
          personalityRequirements: {
            courage: { min: 75 },
          },
        },
        difficulty: 'Hard',
        status: 'available',
        questType: 'seasonal',
        seasonalEvent: 'summer_solstice',
        experienceReward: 120,
        skillRewards: {
          'combat.battleRage': 12,
          'magic.elementalMastery': 10,
        },
      },
      {
        id: 'fire_elemental_pact',
        name: 'Forge a Fire Elemental Pact',
        description:
          'Negotiate with powerful fire elementals to secure their blessing for your guild.',
        reward: 400,
        duration: 3,
        requirements: {
          minLevel: 6,
          preferredClasses: ['Mage'],
          skillRequirements: {
            'magic.elementalMastery': 20,
            'magic.spellPower': 22,
          },
          personalityRequirements: {
            ambition: { min: 70 },
          },
        },
        difficulty: 'Hard',
        status: 'available',
        questType: 'seasonal',
        seasonalEvent: 'summer_solstice',
        experienceReward: 100,
        skillRewards: {
          'magic.elementalMastery': 15,
          'magic.spellPower': 12,
        },
      },
    ],
    unlockConditions: {
      guildLevel: 3,
      reputation: 150,
    },
  },

  {
    id: 'harvest_moon',
    name: 'Harvest Moon Celebration',
    description:
      'The autumn harvest brings abundance, but also awakens creatures that feed on the bounty.',
    season: 'autumn',
    duration: 8,
    rewards: {
      goldBonus: 1.8,
      experienceBonus: 1.1,
      specialItems: [
        {
          id: 'harvest_scythe',
          name: 'Moonlit Harvest Scythe',
          type: 'weapon',
          rarity: 'epic',
          stats: { strength: 22, dexterity: 18, vitality: 15 },
          crafted: false,
        },
        {
          id: 'bounty_pouch',
          name: 'Endless Bounty Pouch',
          type: 'accessory',
          rarity: 'rare',
          stats: { vitality: 15, intelligence: 12, strength: 8 },
          crafted: false,
        },
      ],
    },
    quests: [
      {
        id: 'protect_harvest',
        name: 'Protect the Great Harvest',
        description:
          'Guard the village harvest from ravenous creatures drawn by the abundance of food.',
        reward: 350,
        duration: 5,
        requirements: {
          minLevel: 4,
          preferredClasses: ['Warrior', 'Archer'],
          skillRequirements: {
            'combat.weaponMastery': 16,
            'survival.tracking': 12,
          },
        },
        difficulty: 'Medium',
        status: 'available',
        questType: 'seasonal',
        seasonalEvent: 'harvest_moon',
        experienceReward: 85,
        skillRewards: {
          'combat.weaponMastery': 8,
          'survival.tracking': 6,
        },
      },
      {
        id: 'moon_ritual',
        name: 'Harvest Moon Blessing Ritual',
        description:
          'Participate in the sacred ritual to bless the harvest and ensure prosperity for the coming winter.',
        reward: 250,
        duration: 3,
        requirements: {
          minLevel: 3,
          preferredClasses: ['Mage'],
          skillRequirements: {
            'magic.elementalMastery': 14,
          },
          personalityRequirements: {
            teamwork: { min: 60 },
          },
        },
        difficulty: 'Medium',
        status: 'available',
        questType: 'seasonal',
        seasonalEvent: 'harvest_moon',
        experienceReward: 65,
        skillRewards: {
          'magic.elementalMastery': 8,
          'magic.manaEfficiency': 6,
        },
      },
    ],
  },

  {
    id: 'winter_solstice',
    name: 'Longest Night Festival',
    description:
      'On the longest night of the year, ancient ice spirits emerge and the veil between worlds grows thin.',
    season: 'winter',
    duration: 12,
    rewards: {
      goldBonus: 1.3,
      experienceBonus: 1.4,
      specialItems: [
        {
          id: 'frost_crown',
          name: 'Crown of Eternal Winter',
          type: 'accessory',
          rarity: 'legendary',
          stats: { intelligence: 35, vitality: 25, dexterity: 20 },
          crafted: false,
        },
        {
          id: 'ice_blade',
          name: 'Blade of Frozen Tears',
          type: 'weapon',
          rarity: 'epic',
          stats: { strength: 25, dexterity: 20, intelligence: 15 },
          crafted: false,
        },
      ],
    },
    quests: [
      {
        id: 'ice_palace',
        name: 'Explore the Ice Palace',
        description: 'Venture into the mystical ice palace that appears only on the longest night.',
        reward: 600,
        duration: 8,
        requirements: {
          minLevel: 7,
          preferredClasses: ['Mage', 'Warrior'],
          skillRequirements: {
            'magic.elementalMastery': 25,
            'combat.tacticalKnowledge': 20,
          },
          personalityRequirements: {
            courage: { min: 80 },
            ambition: { min: 65 },
          },
        },
        difficulty: 'Epic',
        status: 'available',
        questType: 'seasonal',
        seasonalEvent: 'winter_solstice',
        experienceReward: 150,
        skillRewards: {
          'magic.elementalMastery': 18,
          'combat.tacticalKnowledge': 15,
        },
      },
      {
        id: 'winter_spirit',
        name: 'Commune with Winter Spirits',
        description:
          "Seek wisdom from the ancient spirits of winter who remember the world's earliest days.",
        reward: 400,
        duration: 4,
        requirements: {
          minLevel: 5,
          preferredClasses: ['Mage'],
          skillRequirements: {
            'magic.spellPower': 18,
            'magic.manaEfficiency': 15,
          },
          personalityRequirements: {
            loyalty: { min: 70 },
          },
        },
        difficulty: 'Hard',
        status: 'available',
        questType: 'seasonal',
        seasonalEvent: 'winter_solstice',
        experienceReward: 95,
        skillRewards: {
          'magic.spellPower': 12,
          'magic.manaEfficiency': 10,
        },
      },
    ],
    unlockConditions: {
      guildLevel: 4,
      reputation: 200,
    },
  },

  {
    id: 'dragons_return',
    name: "Festival of the Dragon's Return",
    description:
      'Ancient legends speak of dragons returning to bless worthy guilds. Only the most accomplished adventurers may witness this event.',
    season: 'festival',
    duration: 5,
    rewards: {
      goldBonus: 2.0,
      experienceBonus: 2.0,
      specialItems: [
        {
          id: 'dragon_heart_amulet',
          name: 'Dragon Heart Amulet',
          type: 'accessory',
          rarity: 'legendary',
          stats: { strength: 25, intelligence: 25, dexterity: 25, vitality: 25 },
          crafted: false,
        },
        {
          id: 'dragonscale_armor',
          name: 'True Dragonscale Armor',
          type: 'armor',
          rarity: 'legendary',
          stats: { vitality: 40, strength: 20, intelligence: 15 },
          crafted: false,
        },
      ],
    },
    quests: [
      {
        id: 'dragon_trial',
        name: 'Trial of the Ancient Dragon',
        description:
          "Face the ultimate test as an ancient dragon evaluates your guild's worthiness.",
        reward: 1000,
        duration: 10,
        requirements: {
          minLevel: 10,
          preferredClasses: ['Warrior', 'Mage'],
          skillRequirements: {
            'combat.weaponMastery': 30,
            'magic.spellPower': 30,
            'combat.battleRage': 25,
            'magic.elementalMastery': 25,
          },
          personalityRequirements: {
            courage: { min: 90 },
            loyalty: { min: 85 },
            teamwork: { min: 80 },
          },
        },
        difficulty: 'Epic',
        status: 'available',
        questType: 'seasonal',
        seasonalEvent: 'dragons_return',
        experienceReward: 250,
        skillRewards: {
          'combat.weaponMastery': 20,
          'magic.spellPower': 20,
          'combat.battleRage': 15,
          'magic.elementalMastery': 15,
        },
      },
    ],
    unlockConditions: {
      guildLevel: 8,
      reputation: 500,
      completedQuests: ['dragon_03_awakening'], // Must complete dragon campaign first
    },
  },
];

export function getCurrentSeason(): SeasonType {
  const now = new Date();
  const month = now.getMonth(); // 0-11

  if (month >= 2 && month <= 4) return 'spring'; // March-May
  if (month >= 5 && month <= 7) return 'summer'; // June-August
  if (month >= 8 && month <= 10) return 'autumn'; // September-November
  return 'winter'; // December-February
}

export function getAvailableSeasonalEvents(
  guildLevel: number,
  reputation: number,
  completedQuests: string[]
): SeasonalEvent[] {
  const currentSeason = getCurrentSeason();

  return seasonalEvents.filter(event => {
    // Check if it's the right season or a special festival
    const seasonMatch = event.season === currentSeason || event.season === 'festival';
    if (!seasonMatch) return false;

    // Check unlock conditions
    if (event.unlockConditions) {
      if (event.unlockConditions.guildLevel && guildLevel < event.unlockConditions.guildLevel) {
        return false;
      }
      if (event.unlockConditions.reputation && reputation < event.unlockConditions.reputation) {
        return false;
      }
      if (event.unlockConditions.completedQuests) {
        const hasRequiredQuests = event.unlockConditions.completedQuests.every(questId =>
          completedQuests.includes(questId)
        );
        if (!hasRequiredQuests) return false;
      }
    }

    return true;
  });
}

export function getSeasonalEventById(eventId: string): SeasonalEvent | undefined {
  return seasonalEvents.find(event => event.id === eventId);
}

export function getSeasonalQuests(eventId: string): Quest[] {
  const event = getSeasonalEventById(eventId);
  return event ? event.quests : [];
}

export function getSeasonalRecruits(eventId: string): Recruit[] {
  const event = getSeasonalEventById(eventId);
  return event?.specialRecruits || [];
}

export function isSeasonalEventActive(eventId: string, activeEvents: string[]): boolean {
  return activeEvents.includes(eventId);
}

// Simulate seasonal event activation based on calendar
export function checkForNewSeasonalEvents(
  lastCheckTime: number,
  guildLevel: number,
  reputation: number,
  completedQuests: string[]
): SeasonalEvent[] {
  const now = Date.now();
  const daysSinceLastCheck = Math.floor((now - lastCheckTime) / (1000 * 60 * 60 * 24));

  if (daysSinceLastCheck < 1) return []; // Check at most once per day

  const availableEvents = getAvailableSeasonalEvents(guildLevel, reputation, completedQuests);
  const newEvents: SeasonalEvent[] = [];

  availableEvents.forEach(event => {
    // Random chance for seasonal events to trigger
    const triggerChance = event.season === 'festival' ? 0.05 : 0.15; // 5% for festivals, 15% for seasons

    if (Math.random() < triggerChance) {
      newEvents.push(event);
    }
  });

  return newEvents;
}
