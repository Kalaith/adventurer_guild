import { Faction } from '../types/game';

export const initialFactions: Faction[] = [
  {
    id: 'merchants_guild',
    name: 'Merchants\' Guild',
    reputation: 0,
    description: 'A powerful organization of traders and merchants who control much of the region\'s commerce.',
    questModifiers: {
      rewardMultiplier: 1.2,
      availableQuestTypes: ['merchant_escort', 'trade_route_security', 'cargo_protection']
    }
  },
  {
    id: 'temple_of_light',
    name: 'Temple of Light',
    reputation: 0,
    description: 'A religious organization dedicated to fighting darkness and evil throughout the land.',
    questModifiers: {
      rewardMultiplier: 1.1,
      availableQuestTypes: ['undead_cleansing', 'holy_blessing', 'temple_protection', 'divine_quest']
    }
  },
  {
    id: 'royal_guard',
    name: 'Royal Guard',
    reputation: 0,
    description: 'The elite military force serving the crown, often requesting assistance with matters of national security.',
    questModifiers: {
      rewardMultiplier: 1.3,
      availableQuestTypes: ['royal_escort', 'border_patrol', 'investigation', 'diplomatic_mission']
    }
  },
  {
    id: 'mages_circle',
    name: 'Circle of Mages',
    reputation: 0,
    description: 'An ancient order of wizards and scholars dedicated to the study and preservation of magical knowledge.',
    questModifiers: {
      rewardMultiplier: 1.25,
      availableQuestTypes: ['magical_research', 'artifact_recovery', 'spell_component_gathering', 'arcane_study']
    }
  },
  {
    id: 'thieves_brotherhood',
    name: 'Thieves\' Brotherhood',
    reputation: 0,
    description: 'A secretive organization of rogues and information brokers who operate in the shadows.',
    questModifiers: {
      rewardMultiplier: 1.4,
      availableQuestTypes: ['stealth_mission', 'information_gathering', 'infiltration', 'heist_planning']
    }
  },
  {
    id: 'forest_druids',
    name: 'Forest Druids',
    reputation: 0,
    description: 'Guardians of nature who seek to maintain the balance between civilization and the wild.',
    questModifiers: {
      rewardMultiplier: 1.15,
      availableQuestTypes: ['forest_protection', 'beast_taming', 'nature_restoration', 'druid_ritual']
    }
  },
  {
    id: 'artisan_league',
    name: 'Artisan League',
    reputation: 0,
    description: 'A confederation of skilled craftspeople who create the finest weapons, armor, and tools.',
    questModifiers: {
      rewardMultiplier: 1.1,
      availableQuestTypes: ['material_gathering', 'workshop_protection', 'delivery_mission', 'quality_inspection']
    }
  },
  {
    id: 'mountain_clans',
    name: 'Mountain Clans',
    reputation: 0,
    description: 'Hardy folk who dwell in the high peaks and valleys, known for their mining expertise and warrior traditions.',
    questModifiers: {
      rewardMultiplier: 1.2,
      availableQuestTypes: ['mining_expedition', 'mountain_patrol', 'clan_dispute', 'monster_hunt']
    }
  }
];

export function getFactionById(factionId: string): Faction | undefined {
  return initialFactions.find(faction => faction.id === factionId);
}

export function getFactionsByReputationLevel(minReputation: number): Faction[] {
  return initialFactions.filter(faction => faction.reputation >= minReputation);
}

export function getFactionQuestTypes(factionId: string): string[] {
  const faction = getFactionById(factionId);
  return faction ? faction.questModifiers.availableQuestTypes : [];
}

export function calculateFactionReward(baseReward: number, factionId: string): number {
  const faction = getFactionById(factionId);
  if (!faction) return baseReward;

  return Math.floor(baseReward * faction.questModifiers.rewardMultiplier);
}

export function getFactionsForQuestType(questType: string): Faction[] {
  return initialFactions.filter(faction =>
    faction.questModifiers.availableQuestTypes.includes(questType)
  );
}

// Reputation thresholds that unlock benefits
export const factionReputationThresholds = {
  NEUTRAL: 0,
  FRIENDLY: 100,
  HONORED: 300,
  REVERED: 600,
  EXALTED: 1000
};

export function getFactionStanding(reputation: number): string {
  if (reputation >= factionReputationThresholds.EXALTED) return 'Exalted';
  if (reputation >= factionReputationThresholds.REVERED) return 'Revered';
  if (reputation >= factionReputationThresholds.HONORED) return 'Honored';
  if (reputation >= factionReputationThresholds.FRIENDLY) return 'Friendly';
  if (reputation >= factionReputationThresholds.NEUTRAL) return 'Neutral';
  return 'Hostile';
}

export function getFactionBenefits(factionId: string, reputation: number): string[] {
  const benefits: string[] = [];
  const faction = getFactionById(factionId);

  if (!faction) return benefits;

  const standing = getFactionStanding(reputation);

  switch (standing) {
    case 'Friendly':
      benefits.push(`10% discount on ${faction.name} services`);
      break;
    case 'Honored':
      benefits.push(`15% discount on ${faction.name} services`);
      benefits.push(`Access to ${faction.name} special quests`);
      break;
    case 'Revered':
      benefits.push(`20% discount on ${faction.name} services`);
      benefits.push(`Access to ${faction.name} special quests and rare items`);
      benefits.push(`${faction.name} sends occasional aid`);
      break;
    case 'Exalted':
      benefits.push(`25% discount on ${faction.name} services`);
      benefits.push(`Access to all ${faction.name} exclusive content`);
      benefits.push(`${faction.name} provides regular support`);
      benefits.push(`Unique title: Champion of ${faction.name}`);
      break;
  }

  return benefits;
}