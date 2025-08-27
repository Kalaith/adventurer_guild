import { Quest } from '../types/game';

const mockData = {
    guildStats: {
        gold: 1000,
        reputation: 0,
        guildLevel: 1,
    },
    adventurers: [
        { id: 1, name: "Archer", level: 5, status: "Available" },
        { id: 2, name: "Mage", level: 3, status: "On Quest" },
    ],
    recruits: [
        { id: "1", name: "Warrior", level: 2 },
        { id: "2", name: "Rogue", level: 4 },
    ],
    treasury: {
        currentGold: 1000,
        totalEarned: 0,
        totalSpent: 0,
    },
    achievements: [
        { id: 1, title: "First Quest", unlocked: false },
        { id: 2, title: "Hire 5 Adventurers", unlocked: false },
    ],
};

export const fetchGuildStats = () => Promise.resolve(mockData.guildStats);
export const fetchAdventurers = () => Promise.resolve(mockData.adventurers);
export const fetchRecruits = () => Promise.resolve(mockData.recruits);
export const fetchTreasury = () => Promise.resolve(mockData.treasury);
export const fetchAchievements = () => Promise.resolve(mockData.achievements);

export const fetchQuests = async (): Promise<Quest[]> => {
    return [
        {
            id: "quest1",
            name: "Dragon Hunt",
            description: "Hunt down the dragon terrorizing the village.",
            reward: 500,
            duration: 3600000,
            requirements: {
                minLevel: 5,
                preferredClasses: ["Warrior", "Mage"],
            },
            difficulty: "Hard",
        },
        {
            id: "quest2",
            name: "Goblin Ambush",
            description: "Defend the caravan from goblin raiders.",
            reward: 300,
            duration: 1800000,
            requirements: {
                minLevel: 3,
                preferredClasses: ["Rogue", "Archer"],
            },
            difficulty: "Medium",
        },
    ];
};
