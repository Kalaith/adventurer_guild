import { RivalGuild, Quest } from '../types/game';

export const rivalGuilds: RivalGuild[] = [
  {
    id: 'iron_fist_company',
    name: 'Iron Fist Company',
    level: 3,
    reputation: 150,
    adventurerCount: 12,
    competitionLevel: 70 // Higher values mean more aggressive competition
  },
  {
    id: 'shadow_runners',
    name: 'Shadow Runners',
    level: 5,
    reputation: 280,
    adventurerCount: 8,
    competitionLevel: 85
  },
  {
    id: 'crimson_blade_guild',
    name: 'Crimson Blade Guild',
    level: 4,
    reputation: 220,
    adventurerCount: 15,
    competitionLevel: 60
  },
  {
    id: 'arcane_seekers',
    name: 'Arcane Seekers',
    level: 6,
    reputation: 320,
    adventurerCount: 10,
    competitionLevel: 75
  },
  {
    id: 'golden_eagles',
    name: 'Golden Eagles',
    level: 2,
    reputation: 90,
    adventurerCount: 18,
    competitionLevel: 50
  }
];

interface QuestCompetition {
  questId: string;
  competingGuild: RivalGuild;
  playerChance: number; // 0-100, chance player guild will get the quest
  timeRemaining: number; // hours until competition is resolved
}

interface RivalGuildAction {
  guildId: string;
  actionType: 'quest_steal' | 'reputation_campaign' | 'expansion' | 'recruitment';
  description: string;
  impact: {
    playerGoldLoss?: number;
    playerReputationLoss?: number;
    rivalGainReputation?: number;
    rivalGainLevel?: boolean;
  };
}

const activeCompetitions: QuestCompetition[] = [];
// const rivalActions: RivalGuildAction[] = [];

export class RivalGuildsAI {
  private static instance: RivalGuildsAI;
  private lastUpdate: number = Date.now();
  private updateInterval: number = 60000; // Update every minute

  public static getInstance(): RivalGuildsAI {
    if (!RivalGuildsAI.instance) {
      RivalGuildsAI.instance = new RivalGuildsAI();
    }
    return RivalGuildsAI.instance;
  }

  public update(playerGuild: { level: number; reputation: number; gold: number }): RivalGuildAction[] {
    const now = Date.now();
    if (now - this.lastUpdate < this.updateInterval) {
      return [];
    }

    this.lastUpdate = now;
    const actions: RivalGuildAction[] = [];

    // Update rival guild stats and generate actions
    rivalGuilds.forEach(guild => {
      if (Math.random() * 100 < this.calculateActionChance(guild, playerGuild)) {
        const action = this.generateRivalAction(guild, playerGuild);
        if (action) {
          actions.push(action);
          this.applyRivalAction(action);
        }
      }

      // Slowly improve rival guilds over time
      if (Math.random() < 0.1) { // 10% chance per update
        guild.reputation += Math.floor(Math.random() * 5) + 1;

        if (guild.reputation > guild.level * 100) {
          guild.level++;
          guild.reputation = guild.level * 50; // Reset reputation for new level
        }
      }
    });

    return actions;
  }

  private calculateActionChance(guild: RivalGuild, playerGuild: { level: number; reputation: number }): number {
    let baseChance = guild.competitionLevel / 100 * 15; // Base 0-15% chance

    // Higher chance if rival guild is stronger than player
    if (guild.level > playerGuild.level) {
      baseChance *= 1.5;
    }

    // Higher chance if rival guild has higher reputation
    if (guild.reputation > playerGuild.reputation) {
      baseChance *= 1.3;
    }

    // Lower chance if player is much stronger
    if (playerGuild.level > guild.level + 2) {
      baseChance *= 0.5;
    }

    return Math.min(baseChance, 25); // Cap at 25%
  }

  private generateRivalAction(guild: RivalGuild, playerGuild: { level: number; reputation: number; gold: number }): RivalGuildAction | null {
    const actionTypes = ['quest_steal', 'reputation_campaign', 'expansion', 'recruitment'];
    const weights = this.calculateActionWeights(guild, playerGuild);
    const actionType = this.weightedRandom(actionTypes, weights) as RivalGuildAction['actionType'];

    switch (actionType) {
      case 'quest_steal':
        return this.generateQuestStealAction(guild, playerGuild);
      case 'reputation_campaign':
        return this.generateReputationCampaignAction(guild);
      case 'expansion':
        return this.generateExpansionAction(guild);
      case 'recruitment':
        return this.generateRecruitmentAction(guild);
      default:
        return null;
    }
  }

  private calculateActionWeights(guild: RivalGuild, playerGuild: { level: number; reputation: number }): number[] {
    const weights = [0, 0, 0, 0]; // quest_steal, reputation_campaign, expansion, recruitment

    // Quest stealing more likely if guild is aggressive
    weights[0] = guild.competitionLevel;

    // Reputation campaigns more likely if behind in reputation
    weights[1] = Math.max(0, (playerGuild.reputation - guild.reputation) / 10);

    // Expansion more likely for established guilds
    weights[2] = guild.level * 10 + guild.reputation / 10;

    // Recruitment more likely if guild has fewer adventurers
    weights[3] = Math.max(0, 20 - guild.adventurerCount);

    return weights;
  }

  private weightedRandom(items: string[], weights: number[]): string {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0) return items[Math.floor(Math.random() * items.length)];

    let randomWeight = Math.random() * totalWeight;
    for (let i = 0; i < items.length; i++) {
      randomWeight -= weights[i];
      if (randomWeight <= 0) {
        return items[i];
      }
    }
    return items[items.length - 1];
  }

  private generateQuestStealAction(guild: RivalGuild, _playerGuild: { level: number; reputation: number }): RivalGuildAction {
    const goldLoss = Math.floor(Math.random() * 200) + 50;
    const reputationLoss = Math.floor(Math.random() * 10) + 5;

    return {
      guildId: guild.id,
      actionType: 'quest_steal',
      description: `${guild.name} has outbid your guild for a lucrative contract, stealing a potential quest from under your nose.`,
      impact: {
        playerGoldLoss: goldLoss,
        playerReputationLoss: reputationLoss,
        rivalGainReputation: reputationLoss * 2
      }
    };
  }

  private generateReputationCampaignAction(guild: RivalGuild): RivalGuildAction {
    return {
      guildId: guild.id,
      actionType: 'reputation_campaign',
      description: `${guild.name} has launched a public relations campaign, spreading word of their heroic deeds throughout the land.`,
      impact: {
        rivalGainReputation: Math.floor(Math.random() * 30) + 20
      }
    };
  }

  private generateExpansionAction(guild: RivalGuild): RivalGuildAction {
    return {
      guildId: guild.id,
      actionType: 'expansion',
      description: `${guild.name} has opened a new branch office, expanding their influence in the region.`,
      impact: {
        rivalGainReputation: Math.floor(Math.random() * 20) + 10,
        rivalGainLevel: Math.random() < 0.3 // 30% chance to gain level
      }
    };
  }

  private generateRecruitmentAction(guild: RivalGuild): RivalGuildAction {
    return {
      guildId: guild.id,
      actionType: 'recruitment',
      description: `${guild.name} has successfully recruited several new adventurers, strengthening their ranks.`,
      impact: {
        rivalGainReputation: Math.floor(Math.random() * 15) + 5
      }
    };
  }

  private applyRivalAction(action: RivalGuildAction): void {
    const guild = rivalGuilds.find(g => g.id === action.guildId);
    if (!guild) return;

    if (action.impact.rivalGainReputation) {
      guild.reputation += action.impact.rivalGainReputation;
    }

    if (action.impact.rivalGainLevel) {
      guild.level++;
    }

    if (action.actionType === 'recruitment') {
      guild.adventurerCount += Math.floor(Math.random() * 3) + 1;
    }
  }

  public simulateQuestCompetition(availableQuests: Quest[], playerGuild: { level: number; reputation: number }): QuestCompetition[] {
    const competitions: QuestCompetition[] = [];

    availableQuests.forEach(quest => {
      // Only high-value quests attract competition
      if (quest.reward < 200) return;

      rivalGuilds.forEach(guild => {
        if (Math.random() * 100 < guild.competitionLevel / 2) {
          const playerChance = this.calculatePlayerQuestChance(quest, guild, playerGuild);

          competitions.push({
            questId: quest.id,
            competingGuild: guild,
            playerChance,
            timeRemaining: Math.floor(Math.random() * 12) + 1 // 1-12 hours
          });
        }
      });
    });

    return competitions;
  }

  private calculatePlayerQuestChance(quest: Quest, rivalGuild: RivalGuild, playerGuild: { level: number; reputation: number }): number {
    let baseChance = 60; // Start with 60% chance

    // Adjust based on guild level difference
    const levelDiff = playerGuild.level - rivalGuild.level;
    baseChance += levelDiff * 10;

    // Adjust based on reputation difference
    const repDiff = playerGuild.reputation - rivalGuild.reputation;
    baseChance += repDiff / 20;

    // Adjust based on quest requirements
    if (quest.difficulty === 'Epic') {
      baseChance -= 20;
    } else if (quest.difficulty === 'Hard') {
      baseChance -= 10;
    }

    // Rival guild competition level affects their chances
    baseChance -= (rivalGuild.competitionLevel - 50) / 5;

    return Math.max(10, Math.min(90, baseChance));
  }

  public resolveQuestCompetition(competition: QuestCompetition): { playerWon: boolean; description: string } {
    const playerWon = Math.random() * 100 < competition.playerChance;

    const description = playerWon
      ? `Your guild successfully secured the quest "${competition.questId}" despite competition from ${competition.competingGuild.name}.`
      : `${competition.competingGuild.name} outmaneuvered your guild and secured the quest "${competition.questId}". Better luck next time.`;

    if (!playerWon) {
      // Rival guild gains reputation for winning the quest
      competition.competingGuild.reputation += 20;
    }

    return { playerWon, description };
  }

  public getActiveCompetitions(): QuestCompetition[] {
    return [...activeCompetitions];
  }

  public getRivalGuilds(): RivalGuild[] {
    return [...rivalGuilds];
  }

  public getGuildById(guildId: string): RivalGuild | undefined {
    return rivalGuilds.find(guild => guild.id === guildId);
  }

  // Player actions against rival guilds
  public sabotageRivalGuild(targetGuildId: string, playerGuild: { level: number; reputation: number }): { success: boolean; description: string; cost: number } {
    const targetGuild = this.getGuildById(targetGuildId);
    if (!targetGuild) {
      return { success: false, description: 'Guild not found.', cost: 0 };
    }

    const cost = 300 + (targetGuild.level * 100);
    const successChance = Math.max(20, 80 - (targetGuild.level - playerGuild.level) * 10);
    const success = Math.random() * 100 < successChance;

    if (success) {
      targetGuild.reputation = Math.max(0, targetGuild.reputation - 50);
      targetGuild.competitionLevel = Math.max(30, targetGuild.competitionLevel - 20);

      return {
        success: true,
        description: `Your sabotage of ${targetGuild.name} was successful! Their reputation and competitive edge have been damaged.`,
        cost
      };
    } else {
      return {
        success: false,
        description: `Your attempt to sabotage ${targetGuild.name} was discovered and failed. Your guild's reputation suffers.`,
        cost
      };
    }
  }

  public formAllianceWithGuild(targetGuildId: string, playerGuild: { level: number; reputation: number }): { success: boolean; description: string; cost: number } {
    const targetGuild = this.getGuildById(targetGuildId);
    if (!targetGuild) {
      return { success: false, description: 'Guild not found.', cost: 0 };
    }

    const cost = 500 + (targetGuild.level * 150);
    const successChance = Math.min(80, 30 + (playerGuild.reputation - targetGuild.reputation) / 10);
    const success = Math.random() * 100 < successChance;

    if (success) {
      targetGuild.competitionLevel = Math.max(10, targetGuild.competitionLevel - 40);

      return {
        success: true,
        description: `You've successfully formed an alliance with ${targetGuild.name}! They will be less competitive with your guild.`,
        cost
      };
    } else {
      return {
        success: false,
        description: `${targetGuild.name} rejected your alliance proposal. They may become more hostile toward your guild.`,
        cost: cost / 2 // Still costs something for the attempt
      };
    }
  }
}

export default RivalGuildsAI;