import { Treasure } from './treasures';

export interface GameState {
  gold: number;
  totalTreasures: number;
  uniqueTreasures: Set<string>;
  minions: number;
  goldPerClick: number;
  goldPerSecond: number;
  upgrades: Record<string, number>;
  discoveredTreasures: Treasure[];
  achievements: Set<string>;
  prestigeLevel: number;
  lastSave: number;
  cooldowns: {
    minions: number;
    explore: number;
  };
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  reward: number;
  duration: number;
  requirements: {
    minLevel: number;
    preferredClasses: string[];
  };
  difficulty: string; // Added missing property
  assignedAdventurers?: string[];
}

export interface Recruit {
  id: string;
  name: string;
  level: number;
}

export interface Adventurer {
  id: string;
  name: string;
  class: string;
  rank: string;
  level: number;
  status: 'available' | 'on quest';
}
