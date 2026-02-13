import { Campaign, Quest } from '../types/game';

export const campaignQuests: { [campaignId: string]: Quest[] } = {
  dragon_threat: [
    {
      id: 'dragon_01_scouts',
      name: 'Dragon Cult Scouts',
      description:
        'Reports have come in of strange hooded figures scouting the countryside. They bear the mark of an ancient dragon cult. Investigate their activities and gather intelligence.',
      reward: 200,
      duration: 2,
      requirements: {
        minLevel: 2,
        preferredClasses: ['Rogue', 'Archer'],
        skillRequirements: {
          'stealth.sneaking': 10,
        },
      },
      difficulty: 'Medium',
      status: 'available',
      questType: 'campaign',
      campaignId: 'dragon_threat',
      experienceReward: 50,
      skillRewards: {
        'stealth.sneaking': 5,
        'survival.tracking': 3,
      },
      lootTable: [
        {
          id: 'cultist_cloak',
          name: "Cultist's Cloak",
          type: 'armor',
          rarity: 'uncommon',
          stats: { dexterity: 8, vitality: 5 },
          crafted: false,
        },
      ],
    },
    {
      id: 'dragon_02_ritual',
      name: 'Disrupted Ritual',
      description:
        "The cult is performing dark rituals to awaken an ancient dragon. Their ritual site has been located in the Whispering Woods. Stop them before it's too late!",
      reward: 400,
      duration: 4,
      requirements: {
        minLevel: 4,
        preferredClasses: ['Mage', 'Warrior'],
        skillRequirements: {
          'magic.spellPower': 15,
          'combat.weaponMastery': 15,
        },
        personalityRequirements: {
          courage: { min: 70 },
        },
      },
      difficulty: 'Hard',
      status: 'available',
      questType: 'campaign',
      campaignId: 'dragon_threat',
      experienceReward: 100,
      skillRewards: {
        'magic.spellPower': 8,
        'combat.weaponMastery': 8,
      },
      lootTable: [
        {
          id: 'ritual_disrupting_blade',
          name: 'Ritual Disrupting Blade',
          type: 'weapon',
          rarity: 'rare',
          stats: { strength: 15, intelligence: 10 },
          crafted: false,
        },
      ],
    },
    {
      id: 'dragon_03_awakening',
      name: 'The Dragon Awakens',
      description:
        'Despite your efforts, the dragon has partially awakened. It rages across the land, destroying everything in its path. Only the bravest heroes can hope to stand against such a beast.',
      reward: 1000,
      duration: 7,
      requirements: {
        minLevel: 8,
        preferredClasses: ['Warrior', 'Mage'],
        skillRequirements: {
          'combat.weaponMastery': 25,
          'magic.spellPower': 25,
          'combat.battleRage': 20,
        },
        personalityRequirements: {
          courage: { min: 90 },
          teamwork: { min: 80 },
        },
      },
      difficulty: 'Epic',
      status: 'available',
      questType: 'campaign',
      campaignId: 'dragon_threat',
      experienceReward: 200,
      skillRewards: {
        'combat.weaponMastery': 15,
        'magic.spellPower': 15,
        'combat.battleRage': 10,
      },
      lootTable: [
        {
          id: 'dragonslayer_sword',
          name: "Dragonslayer's Blade",
          type: 'weapon',
          rarity: 'legendary',
          stats: { strength: 35, vitality: 20, intelligence: 15 },
          crafted: false,
        },
        {
          id: 'dragon_scale_armor',
          name: 'Dragon Scale Armor',
          type: 'armor',
          rarity: 'legendary',
          stats: { vitality: 40, strength: 15 },
          crafted: false,
        },
      ],
    },
  ],

  lost_kingdom: [
    {
      id: 'kingdom_01_ruins',
      name: 'Ancient Ruins Discovery',
      description:
        'Ancient ruins have been discovered that match descriptions of the lost Kingdom of Aethermoor. Initial exploration is needed to determine if this is indeed the legendary lost realm.',
      reward: 150,
      duration: 3,
      requirements: {
        minLevel: 1,
        preferredClasses: ['Archer', 'Rogue'],
        skillRequirements: {
          'survival.tracking': 8,
        },
      },
      difficulty: 'Easy',
      status: 'available',
      questType: 'campaign',
      campaignId: 'lost_kingdom',
      experienceReward: 40,
      skillRewards: {
        'survival.tracking': 5,
        'survival.herbalism': 3,
      },
      lootTable: [
        {
          id: 'ancient_map',
          name: 'Ancient Map Fragment',
          type: 'accessory',
          rarity: 'uncommon',
          stats: { intelligence: 5, dexterity: 5 },
          crafted: false,
        },
      ],
    },
    {
      id: 'kingdom_02_guardians',
      name: 'Awakened Guardians',
      description:
        "Your presence in the ruins has awakened ancient magical guardians. These constructs protect the kingdom's secrets, but they must be overcome to proceed deeper.",
      reward: 300,
      duration: 4,
      requirements: {
        minLevel: 3,
        preferredClasses: ['Warrior', 'Mage'],
        skillRequirements: {
          'combat.weaponMastery': 12,
          'magic.spellPower': 12,
        },
      },
      difficulty: 'Medium',
      status: 'available',
      questType: 'campaign',
      campaignId: 'lost_kingdom',
      experienceReward: 70,
      skillRewards: {
        'combat.weaponMastery': 6,
        'magic.spellPower': 6,
      },
      lootTable: [
        {
          id: 'guardian_core',
          name: "Guardian's Core",
          type: 'accessory',
          rarity: 'rare',
          stats: { intelligence: 12, vitality: 8 },
          crafted: false,
        },
      ],
    },
    {
      id: 'kingdom_03_treasury',
      name: 'The Royal Treasury',
      description:
        "You've reached the heart of Aethermoor - the royal treasury. But it's guarded by the kingdom's most powerful defenses and the spirit of its last king.",
      reward: 800,
      duration: 6,
      requirements: {
        minLevel: 6,
        preferredClasses: ['Mage', 'Warrior'],
        skillRequirements: {
          'magic.spellPower': 20,
          'combat.tacticalKnowledge': 15,
          'magic.elementalMastery': 18,
        },
        personalityRequirements: {
          ambition: { min: 60 },
          courage: { min: 75 },
        },
      },
      difficulty: 'Hard',
      status: 'available',
      questType: 'campaign',
      campaignId: 'lost_kingdom',
      experienceReward: 150,
      skillRewards: {
        'magic.spellPower': 12,
        'combat.tacticalKnowledge': 10,
        'magic.elementalMastery': 8,
      },
      lootTable: [
        {
          id: 'crown_of_aethermoor',
          name: 'Crown of Aethermoor',
          type: 'accessory',
          rarity: 'legendary',
          stats: { intelligence: 30, strength: 10, dexterity: 10, vitality: 10 },
          crafted: false,
        },
      ],
    },
  ],

  thieves_guild: [
    {
      id: 'thieves_01_infiltration',
      name: 'Guild Infiltration',
      description:
        "A rival thieves' guild has been stealing contracts from legitimate adventurer guilds. Infiltrate their organization to gather evidence of their crimes.",
      reward: 180,
      duration: 2,
      requirements: {
        minLevel: 2,
        preferredClasses: ['Rogue'],
        skillRequirements: {
          'stealth.sneaking': 15,
          'stealth.lockpicking': 10,
        },
        personalityRequirements: {
          greed: { max: 60 },
        },
      },
      difficulty: 'Medium',
      status: 'available',
      questType: 'campaign',
      campaignId: 'thieves_guild',
      experienceReward: 45,
      skillRewards: {
        'stealth.sneaking': 8,
        'stealth.lockpicking': 5,
      },
      lootTable: [
        {
          id: 'thieves_tools',
          name: "Master Thief's Tools",
          type: 'accessory',
          rarity: 'uncommon',
          stats: { dexterity: 10, intelligence: 5 },
          crafted: false,
        },
      ],
    },
    {
      id: 'thieves_02_heist',
      name: 'The Grand Heist',
      description:
        "The thieves' guild is planning to steal a powerful artifact from the city's temple. Stop their heist and recover the artifact before it falls into the wrong hands.",
      reward: 350,
      duration: 5,
      requirements: {
        minLevel: 5,
        preferredClasses: ['Rogue', 'Warrior'],
        skillRequirements: {
          'stealth.sneaking': 18,
          'combat.tacticalKnowledge': 15,
          'stealth.lockpicking': 12,
        },
      },
      difficulty: 'Hard',
      status: 'available',
      questType: 'campaign',
      campaignId: 'thieves_guild',
      experienceReward: 85,
      skillRewards: {
        'stealth.sneaking': 10,
        'combat.tacticalKnowledge': 8,
      },
      lootTable: [
        {
          id: 'shadow_cloak',
          name: 'Cloak of Shadows',
          type: 'armor',
          rarity: 'rare',
          stats: { dexterity: 18, intelligence: 8 },
          crafted: false,
        },
      ],
    },
    {
      id: 'thieves_03_showdown',
      name: 'Guild Master Showdown',
      description:
        "Track down the guild master of the thieves' organization. This master thief has eluded justice for years, but with the evidence you've gathered, it's time for a final confrontation.",
      reward: 600,
      duration: 4,
      requirements: {
        minLevel: 7,
        preferredClasses: ['Rogue', 'Archer'],
        skillRequirements: {
          'stealth.assassination': 20,
          'stealth.sneaking': 25,
          'combat.tacticalKnowledge': 18,
        },
        personalityRequirements: {
          loyalty: { min: 80 },
          courage: { min: 70 },
        },
      },
      difficulty: 'Epic',
      status: 'available',
      questType: 'campaign',
      campaignId: 'thieves_guild',
      experienceReward: 120,
      skillRewards: {
        'stealth.assassination': 12,
        'stealth.sneaking': 10,
        'combat.tacticalKnowledge': 8,
      },
      lootTable: [
        {
          id: 'master_thieves_blade',
          name: "Master Thief's Blade",
          type: 'weapon',
          rarity: 'epic',
          stats: { dexterity: 25, strength: 15, intelligence: 10 },
          crafted: false,
        },
      ],
    },
  ],
};

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'dragon_threat',
    name: 'The Dragon Threat',
    description:
      "An ancient dragon cult seeks to awaken a terrible beast that has slumbered for centuries. Can your guild stop them before it's too late?",
    questIds: ['dragon_01_scouts', 'dragon_02_ritual', 'dragon_03_awakening'],
    currentQuestIndex: 0,
    completed: false,
    rewards: {
      gold: 2000,
      reputation: 300,
      items: [
        {
          id: 'dragon_slayer_title',
          name: "Dragon Slayer's Mantle",
          type: 'armor',
          rarity: 'legendary',
          stats: { strength: 25, vitality: 25, intelligence: 15, dexterity: 15 },
          crafted: false,
        },
      ],
    },
  },
  {
    id: 'lost_kingdom',
    name: 'The Lost Kingdom of Aethermoor',
    description:
      'Legends speak of a kingdom that vanished overnight, leaving behind only ruins and treasures. Explore its mysteries and uncover its fate.',
    questIds: ['kingdom_01_ruins', 'kingdom_02_guardians', 'kingdom_03_treasury'],
    currentQuestIndex: 0,
    completed: false,
    rewards: {
      gold: 1500,
      reputation: 200,
      items: [
        {
          id: 'aethermoor_blessing',
          name: 'Blessing of Aethermoor',
          type: 'accessory',
          rarity: 'legendary',
          stats: { intelligence: 20, strength: 20, dexterity: 20, vitality: 20 },
          crafted: false,
        },
      ],
    },
  },
  {
    id: 'thieves_guild',
    name: 'War of the Guilds',
    description:
      "A corrupt thieves' guild threatens the reputation of all adventurer organizations. Infiltrate their ranks and bring them to justice.",
    questIds: ['thieves_01_infiltration', 'thieves_02_heist', 'thieves_03_showdown'],
    currentQuestIndex: 0,
    completed: false,
    rewards: {
      gold: 1200,
      reputation: 250,
      items: [
        {
          id: 'guild_protector_badge',
          name: "Guild Protector's Badge",
          type: 'accessory',
          rarity: 'epic',
          stats: { intelligence: 15, dexterity: 15, vitality: 10 },
          crafted: false,
        },
      ],
    },
  },
];

export function getCampaignById(campaignId: string): Campaign | undefined {
  return CAMPAIGNS.find((campaign) => campaign.id === campaignId);
}

export function getCampaignQuestById(questId: string): Quest | undefined {
  for (const campaignId in campaignQuests) {
    const quest = campaignQuests[campaignId].find((q) => q.id === questId);
    if (quest) return quest;
  }
  return undefined;
}

export function getAvailableCampaignQuests(): Quest[] {
  const availableQuests: Quest[] = [];

  CAMPAIGNS.forEach((campaign) => {
    if (!campaign.completed && campaign.currentQuestIndex < campaign.questIds.length) {
      const currentQuestId = campaign.questIds[campaign.currentQuestIndex];
      const quest = getCampaignQuestById(currentQuestId);
      if (quest) {
        availableQuests.push(quest);
      }
    }
  });

  return availableQuests;
}
