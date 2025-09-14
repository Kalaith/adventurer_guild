import { Adventurer, GuildVote, PersonalityTraits } from '../types/game';

export interface PoliticalEvent {
  id: string;
  type: 'vote_proposal' | 'leadership_challenge' | 'policy_dispute' | 'faction_formation';
  title: string;
  description: string;
  participants: string[]; // adventurer IDs
  impact: {
    moraleChange?: number;
    reputationChange?: number;
    guildBonuses?: { [key: string]: number };
    adventurerLoyaltyChanges?: Array<{ adventurerId: string; loyaltyChange: number }>;
  };
  duration: number; // days
}

export interface VoteProposal {
  id: string;
  proposerId: string;
  title: string;
  description: string;
  options: VoteOption[];
  type: 'policy' | 'resource_allocation' | 'leadership' | 'guild_expansion';
  deadline: number; // timestamp
  requiredParticipation: number; // percentage of guild that must vote
  consequences: VoteConsequence[];
}

export interface VoteOption {
  id: string;
  text: string;
  description: string;
  supporters: string[]; // adventurer IDs who support this before voting
}

export interface VoteConsequence {
  winningOptionId: string;
  effects: {
    goldCost?: number;
    reputationChange?: number;
    guildBonuses?: { [key: string]: number };
    adventurerEffects?: Array<{
      targetId: string;
      effectType: 'loyalty' | 'morale' | 'skill_bonus' | 'temporary_leave';
      value: number;
    }>;
    unlockFeatures?: string[];
  };
}

export interface GuildFaction {
  id: string;
  name: string;
  leader: string; // adventurer ID
  members: string[]; // adventurer IDs
  ideology: 'progressive' | 'conservative' | 'militaristic' | 'diplomatic' | 'mercenary';
  influence: number; // 0-100
  agenda: string[];
}

export class GuildPoliticsSystem {
  private static instance: GuildPoliticsSystem;
  private lastUpdate: number = Date.now();
  private updateInterval: number = 7 * 24 * 60 * 60 * 1000; // Weekly updates

  public static getInstance(): GuildPoliticsSystem {
    if (!GuildPoliticsSystem.instance) {
      GuildPoliticsSystem.instance = new GuildPoliticsSystem();
    }
    return GuildPoliticsSystem.instance;
  }

  public update(adventurers: Adventurer[], guildLevel: number): PoliticalEvent[] {
    const now = Date.now();
    if (now - this.lastUpdate < this.updateInterval) {
      return [];
    }

    this.lastUpdate = now;
    const events: PoliticalEvent[] = [];

    // Check if guild is large enough for politics (need at least 5 adventurers)
    if (adventurers.length < 5) return events;

    // Generate random political events
    if (Math.random() < 0.4) { // 40% chance per week
      const event = this.generatePoliticalEvent(adventurers, guildLevel);
      if (event) events.push(event);
    }

    return events;
  }

  private generatePoliticalEvent(adventurers: Adventurer[], guildLevel: number): PoliticalEvent | null {
    const eventTypes: PoliticalEvent['type'][] = ['vote_proposal', 'leadership_challenge', 'policy_dispute', 'faction_formation'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    switch (eventType) {
      case 'vote_proposal':
        return this.generateVoteProposal(adventurers, guildLevel);
      case 'leadership_challenge':
        return this.generateLeadershipChallenge(adventurers);
      case 'policy_dispute':
        return this.generatePolicyDispute(adventurers);
      case 'faction_formation':
        return this.generateFactionFormation(adventurers);
      default:
        return null;
    }
  }

  private generateVoteProposal(adventurers: Adventurer[], guildLevel: number): PoliticalEvent {
    const proposer = adventurers.find(adv => adv.personality.ambition > 60 && adv.personality.loyalty > 50);
    const fallbackProposer = adventurers[Math.floor(Math.random() * adventurers.length)];
    const actualProposer = proposer || fallbackProposer;

    const proposals = [
      {
        title: 'Guild Training Facility Expansion',
        description: 'Invest in expanding our training facilities to improve skill development.',
        type: 'resource_allocation' as const,
        goldCost: 500 + guildLevel * 200
      },
      {
        title: 'Risk Assessment Policy',
        description: 'Should we take on more dangerous quests for higher rewards or play it safe?',
        type: 'policy' as const,
        goldCost: 0
      },
      {
        title: 'Guild Leadership Structure',
        description: 'Establish a council of senior adventurers to help guide guild decisions.',
        type: 'leadership' as const,
        goldCost: 300
      },
      {
        title: 'Territory Expansion Initiative',
        description: 'Expand guild influence to neighboring regions through diplomatic missions.',
        type: 'guild_expansion' as const,
        goldCost: 800 + guildLevel * 300
      }
    ];

    const proposal = proposals[Math.floor(Math.random() * proposals.length)];

    return {
      id: `vote_${Date.now()}`,
      type: 'vote_proposal',
      title: proposal.title,
      description: `${actualProposer.name} has proposed: ${proposal.description}`,
      participants: [actualProposer.id],
      impact: {
        moraleChange: 5 // Proposing something shows initiative
      },
      duration: 3 // 3 days to vote
    };
  }

  private generateLeadershipChallenge(adventurers: Adventurer[]): PoliticalEvent {
    // Find ambitious adventurers who might challenge leadership
    const challenger = adventurers.find(adv =>
      adv.personality.ambition > 80 &&
      adv.level >= 5 &&
      adv.questsCompleted >= 15
    );

    if (!challenger) {
      return this.generatePolicyDispute(adventurers); // Fallback to policy dispute
    }

    const supporterCount = Math.floor(Math.random() * Math.floor(adventurers.length / 3));
    const supporters = adventurers
      .filter(adv => adv.id !== challenger.id)
      .slice(0, supporterCount)
      .map(adv => adv.id);

    return {
      id: `leadership_${Date.now()}`,
      type: 'leadership_challenge',
      title: 'Leadership Challenge',
      description: `${challenger.name} believes they could lead the guild more effectively and is challenging the current leadership structure.`,
      participants: [challenger.id, ...supporters],
      impact: {
        moraleChange: -10,
        adventurerLoyaltyChanges: [
          { adventurerId: challenger.id, loyaltyChange: 10 }
        ]
      },
      duration: 5
    };
  }

  private generatePolicyDispute(adventurers: Adventurer[]): PoliticalEvent {
    const disputes = [
      {
        title: 'Quest Reward Distribution',
        description: 'Disagreement over how quest rewards should be distributed among participating adventurers.'
      },
      {
        title: 'Recruitment Standards',
        description: 'Debate about whether the guild should maintain high standards or recruit more adventurers.'
      },
      {
        title: 'Risk Management',
        description: 'Conflict over the guild\'s approach to dangerous missions and acceptable casualties.'
      },
      {
        title: 'External Relations',
        description: 'Disagreement about forming alliances with other organizations.'
      }
    ];

    const dispute = disputes[Math.floor(Math.random() * disputes.length)];
    const participantCount = Math.min(adventurers.length, Math.floor(Math.random() * 4) + 2);
    const participants = adventurers
      .slice()
      .sort(() => 0.5 - Math.random())
      .slice(0, participantCount)
      .map(adv => adv.id);

    return {
      id: `dispute_${Date.now()}`,
      type: 'policy_dispute',
      title: dispute.title,
      description: dispute.description,
      participants,
      impact: {
        moraleChange: -5,
        adventurerLoyaltyChanges: participants.map(id => ({
          adventurerId: id,
          loyaltyChange: Math.floor(Math.random() * 10) - 5 // -5 to +5
        }))
      },
      duration: 4
    };
  }

  private generateFactionFormation(adventurers: Adventurer[]): PoliticalEvent {
    // Find potential faction leaders
    const leaders = adventurers.filter(adv =>
      adv.personality.ambition > 65 &&
      adv.personality.teamwork > 50 &&
      adv.level >= 4
    );

    if (leaders.length === 0) {
      return this.generatePolicyDispute(adventurers);
    }

    const leader = leaders[Math.floor(Math.random() * leaders.length)];
    const factionSize = Math.min(adventurers.length - 1, Math.floor(Math.random() * 4) + 2);

    // Find compatible members based on personality
    const potentialMembers = adventurers
      .filter(adv => adv.id !== leader.id)
      .sort((a, b) => this.calculatePersonalityCompatibility(leader.personality, b.personality) -
                     this.calculatePersonalityCompatibility(leader.personality, a.personality))
      .slice(0, factionSize);

    const factionNames = [
      'The Progressive Alliance',
      'Guild Traditionalists',
      'The Reform Coalition',
      'Unity Party',
      'The Veteran\'s Circle'
    ];

    const factionName = factionNames[Math.floor(Math.random() * factionNames.length)];

    return {
      id: `faction_${Date.now()}`,
      type: 'faction_formation',
      title: 'New Faction Formed',
      description: `${leader.name} has formed "${factionName}" with like-minded adventurers to promote their vision for the guild.`,
      participants: [leader.id, ...potentialMembers.map(adv => adv.id)],
      impact: {
        moraleChange: 0, // Neutral initially
        adventurerLoyaltyChanges: [
          { adventurerId: leader.id, loyaltyChange: 15 },
          ...potentialMembers.map(adv => ({ adventurerId: adv.id, loyaltyChange: 5 }))
        ]
      },
      duration: 7
    };
  }

  private calculatePersonalityCompatibility(personality1: PersonalityTraits, personality2: PersonalityTraits): number {
    let compatibility = 0;

    // Similar loyalty values are compatible
    compatibility += 100 - Math.abs(personality1.loyalty - personality2.loyalty);

    // Similar teamwork values are compatible
    compatibility += 100 - Math.abs(personality1.teamwork - personality2.teamwork);

    // Opposing ambition can be complementary
    if (Math.abs(personality1.ambition - personality2.ambition) < 30) {
      compatibility += 50;
    }

    // Low greed is generally compatible
    if (personality1.greed < 50 && personality2.greed < 50) {
      compatibility += 30;
    }

    return compatibility;
  }

  public createVote(proposal: VoteProposal): GuildVote {
    const voteOptions: string[] = proposal.options.map(option => option.text);

    return {
      id: proposal.id,
      topic: proposal.title,
      description: proposal.description,
      options: voteOptions,
      votes: {},
      deadline: proposal.deadline,
      passed: false
    };
  }

  public castVote(vote: GuildVote, adventurerId: string, optionIndex: number, adventurers: Adventurer[]): boolean {
    const adventurer = adventurers.find(adv => adv.id === adventurerId);
    if (!adventurer) return false;

    if (Date.now() > vote.deadline) return false; // Vote has ended

    if (optionIndex < 0 || optionIndex >= vote.options.length) return false; // Invalid option

    vote.votes[adventurerId] = optionIndex;
    return true;
  }

  public resolveVote(vote: GuildVote, adventurers: Adventurer[]): {
    winningOption: string;
    winningIndex: number;
    results: { [option: string]: number };
    participation: number;
  } {
    const results: { [option: string]: number } = {};
    vote.options.forEach(option => results[option] = 0);

    // Count votes
    Object.values(vote.votes).forEach(optionIndex => {
      const option = vote.options[optionIndex];
      if (option) {
        results[option]++;
      }
    });

    // Find winner
    let winningOption = vote.options[0];
    let winningIndex = 0;
    let maxVotes = results[winningOption];

    vote.options.forEach((option, index) => {
      if (results[option] > maxVotes) {
        maxVotes = results[option];
        winningOption = option;
        winningIndex = index;
      }
    });

    const participation = (Object.keys(vote.votes).length / adventurers.length) * 100;

    vote.passed = true;

    return {
      winningOption,
      winningIndex,
      results,
      participation
    };
  }

  public calculateVotingPower(adventurer: Adventurer): number {
    let power = 1; // Base voting power

    // Senior adventurers have more influence
    if (adventurer.level >= 8) power += 2;
    else if (adventurer.level >= 5) power += 1;

    // Veteran adventurers have more influence
    if (adventurer.questsCompleted >= 50) power += 2;
    else if (adventurer.questsCompleted >= 25) power += 1;

    // High loyalty adventurers have more influence
    if (adventurer.personality.loyalty >= 80) power += 1;

    return power;
  }

  public predictVotingBehavior(adventurer: Adventurer, vote: GuildVote, proposal: VoteProposal): number {
    // This is a simplified prediction system
    // In reality, this would be much more complex based on adventurer history, relationships, etc.

    let preferredOption = 0;

    // Conservative adventurers (high loyalty, low ambition) prefer status quo
    if (adventurer.personality.loyalty > 70 && adventurer.personality.ambition < 50) {
      // Prefer first option (usually "no change" or conservative choice)
      preferredOption = 0;
    }

    // Ambitious adventurers prefer change and growth
    if (adventurer.personality.ambition > 70) {
      // Prefer last option (usually most aggressive/progressive choice)
      preferredOption = vote.options.length - 1;
    }

    // Greedy adventurers prefer profitable options
    if (adventurer.personality.greed > 60) {
      // Look for options that mention gold, profit, or expansion
      for (let i = 0; i < proposal.options.length; i++) {
        const option = proposal.options[i];
        if (option.description.toLowerCase().includes('gold') ||
            option.description.toLowerCase().includes('profit') ||
            option.description.toLowerCase().includes('expansion')) {
          preferredOption = i;
          break;
        }
      }
    }

    return preferredOption;
  }

  public generateFaction(leader: Adventurer, members: Adventurer[]): GuildFaction {
    const ideologies: GuildFaction['ideology'][] = ['progressive', 'conservative', 'militaristic', 'diplomatic', 'mercenary'];

    // Determine ideology based on leader's personality
    let ideology: GuildFaction['ideology'] = 'progressive';

    if (leader.personality.loyalty > 80) ideology = 'conservative';
    else if (leader.personality.courage > 80) ideology = 'militaristic';
    else if (leader.personality.teamwork > 80) ideology = 'diplomatic';
    else if (leader.personality.greed > 70) ideology = 'mercenary';

    const factionNames: { [key in GuildFaction['ideology']]: string[] } = {
      progressive: ['The Reformers', 'Future Guild Alliance', 'Progressive Coalition'],
      conservative: ['Guild Traditionalists', 'The Old Guard', 'Heritage Keepers'],
      militaristic: ['Iron Will Brigade', 'The War Council', 'Martial Order'],
      diplomatic: ['Peace Builders', 'Unity Circle', 'Harmony Guild'],
      mercenary: ['Gold Standard Society', 'Profit Alliance', 'Fortune Seekers']
    };

    const possibleNames = factionNames[ideology];
    const name = possibleNames[Math.floor(Math.random() * possibleNames.length)];

    const agendas: { [key in GuildFaction['ideology']]: string[] } = {
      progressive: ['Modernize guild practices', 'Embrace new technologies', 'Expand recruitment'],
      conservative: ['Maintain traditions', 'Preserve guild values', 'Careful growth'],
      militaristic: ['Strengthen combat training', 'Take on harder quests', 'Build reputation through victory'],
      diplomatic: ['Form alliances', 'Peaceful conflict resolution', 'Community engagement'],
      mercenary: ['Maximize profits', 'Efficient operations', 'Strategic investments']
    };

    return {
      id: `faction_${leader.id}_${Date.now()}`,
      name,
      leader: leader.id,
      members: members.map(member => member.id),
      ideology,
      influence: Math.min(100, (members.length / 10) * 100 + leader.level * 5),
      agenda: agendas[ideology]
    };
  }

  public processPoliticalConsequences(
    eventType: PoliticalEvent['type'],
    outcome: any,
    adventurers: Adventurer[]
  ): {
    goldCost: number;
    reputationChange: number;
    moraleChange: number;
    adventurerEffects: Array<{ adventurerId: string; effect: string; value: number }>;
  } {
    const consequences = {
      goldCost: 0,
      reputationChange: 0,
      moraleChange: 0,
      adventurerEffects: [] as Array<{ adventurerId: string; effect: string; value: number }>
    };

    switch (eventType) {
      case 'vote_proposal':
        // Implementation depends on what was voted on
        consequences.reputationChange = 5; // Democratic process improves reputation
        consequences.moraleChange = 3;
        break;

      case 'leadership_challenge':
        // Successful challenges improve morale, failed ones hurt it
        if (outcome.successful) {
          consequences.moraleChange = 10;
          consequences.reputationChange = 5;
        } else {
          consequences.moraleChange = -15;
        }
        break;

      case 'policy_dispute':
        // Disputes always cause some division
        consequences.moraleChange = -8;
        break;

      case 'faction_formation':
        // Factions can improve organization but may cause division
        consequences.moraleChange = -2; // Slight initial division
        consequences.reputationChange = 3; // Shows organized approach
        break;
    }

    return consequences;
  }
}

export default GuildPoliticsSystem;