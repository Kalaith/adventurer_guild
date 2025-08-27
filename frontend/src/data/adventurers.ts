import { Adventurer } from '../types/game';

export const INITIAL_ADVENTURERS: Adventurer[] = [
  {
    id: 'adv_001',
    name: 'Thrain Ironfist',
    class: 'Warrior',
    rank: 'Journeyman',
    level: 3,
    experience: 150,
    status: 'available',
    stats: {
      strength: 35,
      intelligence: 15,
      dexterity: 20,
      vitality: 30
    }
  },
  {
    id: 'adv_002',
    name: 'Elara Stormweaver',
    class: 'Mage',
    rank: 'Apprentice',
    level: 2,
    experience: 75,
    status: 'available',
    stats: {
      strength: 10,
      intelligence: 30,
      dexterity: 15,
      vitality: 20
    }
  }
];

export const ADVENTURER_NAMES = {
  Warrior: ['Thrain Ironfist', 'Grom Bloodaxe', 'Valeria Stormblade', 'Bjorn Bearkiller'],
  Mage: ['Elara Stormweaver', 'Mordecai Shadowcaster', 'Sylvana Moonwhisper', 'Zephyr Windcaller'],
  Rogue: ['Shadow Nightstalker', 'Raven Quickblade', 'Silk Shadowstep', 'Ghost Whisperwind'],
  Archer: ['Falcon Swiftarrow', 'Willow Longshot', 'Hawkeye Stormbow', 'Ranger Greenleaf']
};

export const generateRandomAdventurer = (level: number = 1): Adventurer => {
  const classes: Array<'Warrior' | 'Mage' | 'Rogue' | 'Archer'> = ['Warrior', 'Mage', 'Rogue', 'Archer'];
  const randomClass = classes[Math.floor(Math.random() * classes.length)];
  const names = ADVENTURER_NAMES[randomClass];
  const randomName = names[Math.floor(Math.random() * names.length)];

  return {
    id: `adv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: randomName,
    class: randomClass,
    rank: level >= 5 ? 'Expert' : level >= 3 ? 'Journeyman' : level >= 2 ? 'Apprentice' : 'Novice',
    level,
    experience: (level - 1) * 100 + Math.floor(Math.random() * 100),
    status: 'available',
    stats: {
      strength: level * 10 + Math.floor(Math.random() * 10),
      intelligence: level * 10 + Math.floor(Math.random() * 10),
      dexterity: level * 10 + Math.floor(Math.random() * 10),
      vitality: level * 10 + Math.floor(Math.random() * 10)
    }
  };
};
