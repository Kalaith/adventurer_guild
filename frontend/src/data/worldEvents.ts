import { WorldEvent, Quest } from '../types/game';

export const WORLD_EVENTS: WorldEvent[] = [
  {
    id: 'merchant_festival',
    name: 'Grand Merchant Festival',
    description: 'Traders from across the realm have gathered for the annual merchant festival. Gold flows freely and opportunities abound.',
    active: false,
    duration: 7, // 7 days
    effects: {
      questRewardMultiplier: 1.5,
      adventurerMoraleBonus: 20,
      specialQuestsAvailable: ['festival_guard_duty', 'merchant_escort', 'festival_entertainment']
    }
  },
  {
    id: 'arcane_surge',
    name: 'Arcane Surge',
    description: 'Magical energies surge throughout the land, empowering spellcasters but creating dangerous magical anomalies.',
    active: false,
    duration: 5,
    effects: {
      questRewardMultiplier: 1.3,
      specialQuestsAvailable: ['magical_anomaly', 'arcane_research', 'unstable_portal']
    }
  },
  {
    id: 'goblin_uprising',
    name: 'Goblin Uprising',
    description: 'Goblin tribes across the region have united under a powerful warlord, launching coordinated attacks on settlements.',
    active: false,
    duration: 10,
    effects: {
      questRewardMultiplier: 1.8,
      adventurerMoraleBonus: -10,
      specialQuestsAvailable: ['goblin_raid_defense', 'warlord_hunt', 'supply_line_disruption']
    }
  },
  {
    id: 'harvest_moon',
    name: 'Harvest Moon Blessing',
    description: 'The harvest moon brings prosperity to the land. Crops grow bountifully and spirits are high.',
    active: false,
    duration: 3,
    effects: {
      questRewardMultiplier: 1.2,
      adventurerMoraleBonus: 15,
      specialQuestsAvailable: ['harvest_protection', 'moon_ritual', 'abundant_gathering']
    }
  },
  {
    id: 'planar_rift',
    name: 'Planar Rift Crisis',
    description: 'A tear in reality has opened, allowing creatures from other planes to pour through. The very fabric of existence is at stake.',
    active: false,
    duration: 14,
    effects: {
      questRewardMultiplier: 2.5,
      adventurerMoraleBonus: -20,
      specialQuestsAvailable: ['rift_sealing', 'planar_creature_hunt', 'reality_anchor']
    }
  },
  {
    id: 'dragon_migration',
    name: 'Dragon Migration',
    description: 'Ancient dragons are migrating across the skies, their presence both terrifying and awe-inspiring.',
    active: false,
    duration: 6,
    effects: {
      questRewardMultiplier: 2.0,
      specialQuestsAvailable: ['dragon_sighting', 'scale_collection', 'dragon_negotiation']
    }
  },
  {
    id: 'bards_convention',
    name: 'Grand Bards\' Convention',
    description: 'Storytellers and musicians gather to share tales and songs, inspiring all who hear them.',
    active: false,
    duration: 4,
    effects: {
      questRewardMultiplier: 1.1,
      adventurerMoraleBonus: 25,
      specialQuestsAvailable: ['tale_collection', 'musical_quest', 'inspiration_spreading']
    }
  },
  {
    id: 'undead_plague',
    name: 'Undead Plague',
    description: 'Dark necromancy has raised the dead across multiple graveyards. The living must band together against this threat.',
    active: false,
    duration: 12,
    effects: {
      questRewardMultiplier: 2.2,
      adventurerMoraleBonus: -15,
      specialQuestsAvailable: ['graveyard_cleansing', 'necromancer_hunt', 'holy_blessing']
    }
  }
];

export const WORLD_EVENT_QUESTS: { [eventId: string]: Quest[] } = {
  'merchant_festival': [
    {
      id: 'festival_guard_duty',
      name: 'Festival Security',
      description: 'The merchant festival needs security to prevent theft and maintain order among the crowds.',
      reward: 150,
      duration: 1,
      requirements: {
        minLevel: 1,
        preferredClasses: ['Warrior', 'Archer']
      },
      difficulty: 'Easy',
      status: 'available',
      questType: 'world_event',
      worldEvent: 'merchant_festival',
      experienceReward: 30,
      skillRewards: {
        'combat.tacticalKnowledge': 3
      }
    },
    {
      id: 'merchant_escort',
      name: 'VIP Merchant Escort',
      description: 'A wealthy merchant needs protection while transporting valuable goods to the festival.',
      reward: 300,
      duration: 3,
      requirements: {
        minLevel: 3,
        preferredClasses: ['Warrior', 'Rogue']
      },
      difficulty: 'Medium',
      status: 'available',
      questType: 'world_event',
      worldEvent: 'merchant_festival',
      experienceReward: 60,
      skillRewards: {
        'combat.weaponMastery': 5,
        'survival.tracking': 3
      }
    }
  ],

  'arcane_surge': [
    {
      id: 'magical_anomaly',
      name: 'Magical Anomaly Investigation',
      description: 'Strange magical phenomena are occurring throughout the city. Investigate and contain these anomalies.',
      reward: 250,
      duration: 2,
      requirements: {
        minLevel: 3,
        preferredClasses: ['Mage'],
        skillRequirements: {
          'magic.spellPower': 15
        }
      },
      difficulty: 'Medium',
      status: 'available',
      questType: 'world_event',
      worldEvent: 'arcane_surge',
      experienceReward: 50,
      skillRewards: {
        'magic.spellPower': 8,
        'magic.elementalMastery': 5
      }
    },
    {
      id: 'unstable_portal',
      name: 'Unstable Portal Closure',
      description: 'An unstable magical portal has opened in the town square. Close it before something dangerous comes through.',
      reward: 500,
      duration: 4,
      requirements: {
        minLevel: 5,
        preferredClasses: ['Mage'],
        skillRequirements: {
          'magic.spellPower': 20,
          'magic.elementalMastery': 15
        }
      },
      difficulty: 'Hard',
      status: 'available',
      questType: 'world_event',
      worldEvent: 'arcane_surge',
      experienceReward: 100,
      skillRewards: {
        'magic.spellPower': 12,
        'magic.elementalMastery': 10
      }
    }
  ],

  'goblin_uprising': [
    {
      id: 'goblin_raid_defense',
      name: 'Village Defense',
      description: 'A village is under attack by organized goblin raiders. Defend the innocent and drive off the attackers.',
      reward: 400,
      duration: 2,
      requirements: {
        minLevel: 4,
        preferredClasses: ['Warrior', 'Archer'],
        personalityRequirements: {
          'courage': { min: 60 }
        }
      },
      difficulty: 'Hard',
      status: 'available',
      questType: 'world_event',
      worldEvent: 'goblin_uprising',
      experienceReward: 80,
      skillRewards: {
        'combat.weaponMastery': 8,
        'combat.battleRage': 6
      }
    },
    {
      id: 'warlord_hunt',
      name: 'Hunt the Goblin Warlord',
      description: 'Track down and eliminate the goblin warlord who has united the tribes. End this uprising at its source.',
      reward: 800,
      duration: 7,
      requirements: {
        minLevel: 7,
        preferredClasses: ['Warrior', 'Archer', 'Rogue'],
        skillRequirements: {
          'combat.weaponMastery': 20,
          'survival.tracking': 15
        },
        personalityRequirements: {
          'courage': { min: 80 },
          'teamwork': { min: 70 }
        }
      },
      difficulty: 'Epic',
      status: 'available',
      questType: 'world_event',
      worldEvent: 'goblin_uprising',
      experienceReward: 160,
      skillRewards: {
        'combat.weaponMastery': 15,
        'combat.battleRage': 12,
        'survival.tracking': 10
      }
    }
  ],

  'planar_rift': [
    {
      id: 'rift_sealing',
      name: 'Planar Rift Sealing',
      description: 'Use powerful magic to seal tears in reality before more dangerous creatures emerge.',
      reward: 1000,
      duration: 6,
      requirements: {
        minLevel: 8,
        preferredClasses: ['Mage'],
        skillRequirements: {
          'magic.spellPower': 25,
          'magic.elementalMastery': 20,
          'magic.manaEfficiency': 15
        },
        personalityRequirements: {
          'courage': { min: 85 }
        }
      },
      difficulty: 'Epic',
      status: 'available',
      questType: 'world_event',
      worldEvent: 'planar_rift',
      experienceReward: 200,
      skillRewards: {
        'magic.spellPower': 20,
        'magic.elementalMastery': 15,
        'magic.manaEfficiency': 10
      }
    },
    {
      id: 'planar_creature_hunt',
      name: 'Otherworldly Beast Hunt',
      description: 'Hunt down the dangerous creatures that have escaped through the planar rifts before they can establish territory.',
      reward: 600,
      duration: 5,
      requirements: {
        minLevel: 6,
        preferredClasses: ['Warrior', 'Archer'],
        skillRequirements: {
          'combat.weaponMastery': 18,
          'survival.tracking': 12
        }
      },
      difficulty: 'Hard',
      status: 'available',
      questType: 'world_event',
      worldEvent: 'planar_rift',
      experienceReward: 120,
      skillRewards: {
        'combat.weaponMastery': 10,
        'survival.tracking': 8,
        'combat.battleRage': 6
      }
    }
  ]
};

export function getActiveWorldEvents(): WorldEvent[] {
  return WORLD_EVENTS.filter(event => event.active);
}

export function getWorldEventById(eventId: string): WorldEvent | undefined {
  return WORLD_EVENTS.find(event => event.id === eventId);
}

export function getWorldEventQuests(eventId: string): Quest[] {
  return WORLD_EVENT_QUESTS[eventId] || [];
}

export function getAllActiveWorldEventQuests(): Quest[] {
  const activeEvents = getActiveWorldEvents();
  const quests: Quest[] = [];

  activeEvents.forEach(event => {
    const eventQuests = getWorldEventQuests(event.id);
    quests.push(...eventQuests);
  });

  return quests;
}

export function activateRandomWorldEvent(): WorldEvent | null {
  const inactiveEvents = WORLD_EVENTS.filter(event => !event.active);
  if (inactiveEvents.length === 0) return null;

  const randomEvent = inactiveEvents[Math.floor(Math.random() * inactiveEvents.length)];
  randomEvent.active = true;

  return randomEvent;
}

export function deactivateWorldEvent(eventId: string): void {
  const event = getWorldEventById(eventId);
  if (event) {
    event.active = false;
  }
}