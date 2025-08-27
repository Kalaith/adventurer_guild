export interface Adventurer {
  id: string;
  name: string;
  class: 'Warrior' | 'Mage' | 'Rogue' | 'Archer';
  rank: string;
  level: number;
  experience: number;
  status: 'available' | 'on quest';
  stats: {
    strength: number;
    intelligence: number;
    dexterity: number;
    vitality: number;
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
  difficulty: 'Easy' | 'Medium' | 'Hard';
  assignedAdventurers?: string[];
  status: 'available' | 'active' | 'completed';
}

export interface Recruit {
  id: string;
  name: string;
  level: number;
  class: 'Warrior' | 'Mage' | 'Rogue' | 'Archer';
  cost: number;
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
}
