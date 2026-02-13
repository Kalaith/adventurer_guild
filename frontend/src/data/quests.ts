import { Quest } from '../types/game';

export const questData: Quest[] = [
  {
    id: 'goblin_camp',
    name: 'Clear Goblin Camp',
    description:
      'A goblin camp has been established near the village. Clear it out to protect the locals.',
    reward: 150,
    duration: 1800000, // 30 minutes
    requirements: {
      minLevel: 1,
      preferredClasses: ['Warrior', 'Rogue'],
    },
    difficulty: 'Easy',
    status: 'available',
    questType: 'standard',
    experienceReward: 50,
  },
  {
    id: 'dragon_hunt',
    name: 'Dragon Hunt',
    description:
      'A dragon has been terrorizing the countryside. Hunt it down and claim the reward.',
    reward: 500,
    duration: 3600000, // 1 hour
    requirements: {
      minLevel: 5,
      preferredClasses: ['Warrior', 'Mage'],
    },
    difficulty: 'Hard',
    status: 'available',
    questType: 'standard',
    experienceReward: 200,
  },
  {
    id: 'bandit_ambush',
    name: 'Bandit Ambush',
    description: 'Bandits have set up an ambush on the main trade route. Deal with them.',
    reward: 300,
    duration: 2400000, // 40 minutes
    requirements: {
      minLevel: 3,
      preferredClasses: ['Rogue', 'Archer'],
    },
    difficulty: 'Medium',
    status: 'available',
    questType: 'standard',
    experienceReward: 120,
  },
  {
    id: 'treasure_hunt',
    name: 'Lost Treasure',
    description: 'Locate and retrieve the lost treasure from the ancient ruins.',
    reward: 400,
    duration: 3000000, // 50 minutes
    requirements: {
      minLevel: 4,
      preferredClasses: ['Mage', 'Rogue'],
    },
    difficulty: 'Medium',
    status: 'available',
    questType: 'standard',
    experienceReward: 160,
  },
];

export const getQuestById = (id: string): Quest | undefined => {
  return questData.find((quest) => quest.id === id);
};

export const getQuestsByDifficulty = (difficulty: 'Easy' | 'Medium' | 'Hard'): Quest[] => {
  return questData.filter((quest) => quest.difficulty === difficulty);
};

export const getAvailableQuests = (): Quest[] => {
  return questData.filter((quest) => quest.status === 'available');
};
