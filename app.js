// Game Data
const GAME_DATA = {
  adventurerClasses: {
    "Fighter": {
      baseCost: 100,
      baseStats: {"hp": 120, "attack": 80, "magic": 20, "speed": 60, "defense": 90},
      description: "Strong melee combatant with high durability"
    },
    "Mage": {
      baseCost: 150,
      baseStats: {"hp": 60, "attack": 30, "magic": 120, "speed": 70, "defense": 40},
      description: "Powerful spellcaster with devastating magic"
    },
    "Rogue": {
      baseCost: 120,
      baseStats: {"hp": 80, "attack": 90, "magic": 40, "speed": 130, "defense": 50},
      description: "Swift and sneaky, excellent for stealth missions"
    },
    "Cleric": {
      baseCost: 130,
      baseStats: {"hp": 90, "attack": 50, "magic": 100, "speed": 60, "defense": 80},
      description: "Holy warrior with healing and support abilities"
    },
    "Ranger": {
      baseCost: 110,
      baseStats: {"hp": 100, "attack": 70, "magic": 60, "speed": 90, "defense": 70},
      description: "Balanced warrior skilled in ranged combat and tracking"
    }
  },
  questTypes: [
    {
      name: "Goblin Raid",
      difficulty: "Easy",
      baseReward: 150,
      duration: 60000,
      requirements: {"minLevel": 1, "preferredClasses": ["Fighter", "Ranger"]},
      description: "Clear out a goblin camp threatening local farmers"
    },
    {
      name: "Bandit Camp",
      difficulty: "Medium", 
      baseReward: 300,
      duration: 120000,
      requirements: {"minLevel": 2, "preferredClasses": ["Fighter", "Rogue"]},
      description: "Eliminate bandits harassing merchant caravans"
    },
    {
      name: "Dragon Lair",
      difficulty: "Hard",
      baseReward: 800,
      duration: 300000,
      requirements: {"minLevel": 4, "preferredClasses": ["Fighter", "Mage", "Cleric"]},
      description: "Face an ancient dragon in its mountain lair"
    },
    {
      name: "Ancient Ruins",
      difficulty: "Medium",
      baseReward: 400,
      duration: 180000,
      requirements: {"minLevel": 2, "preferredClasses": ["Mage", "Rogue"]},
      description: "Explore mysterious ruins and recover ancient artifacts"
    },
    {
      name: "Merchant Escort",
      difficulty: "Easy",
      baseReward: 100,
      duration: 90000,
      requirements: {"minLevel": 1, "preferredClasses": ["Fighter", "Ranger"]},
      description: "Safely escort merchants through dangerous territory"
    },
    {
      name: "Monster Hunt",
      difficulty: "Hard",
      baseReward: 600,
      duration: 240000,
      requirements: {"minLevel": 3, "preferredClasses": ["Fighter", "Ranger", "Mage"]},
      description: "Hunt down a legendary beast terrorizing the countryside"
    }
  ],
  adventurerNames: [
    "Thorin Ironbeard", "Lyra Swiftarrow", "Marcus Stormwind", "Elara Moonwhisper",
    "Gareth Strongarm", "Nyx Shadowblade", "Brother Aldric", "Sera Brightspell",
    "Dorin Axebreaker", "Kira Nightshade", "Theron Goldleaf", "Mira Flameheart",
    "Bran Stonewall", "Zara Mistwalker", "Cedric Lightbringer", "Vera Frostborn",
    "Ulric Battlehammer", "Sasha Swiftstrike", "Tobias Spellweaver", "Aria Dawnblade"
  ],
  rankNames: ["Novice", "Experienced", "Veteran", "Elite", "Legendary"],
  guildLevelRewards: [
    {"level": 1, "maxAdventurers": 5, "questSlots": 2},
    {"level": 2, "maxAdventurers": 8, "questSlots": 3},
    {"level": 3, "maxAdventurers": 12, "questSlots": 4},
    {"level": 4, "maxAdventurers": 16, "questSlots": 5},
    {"level": 5, "maxAdventurers": 20, "questSlots": 6}
  ]
};

// Game State
let gameState = {
  gold: 1000,
  reputation: 0,
  guildLevel: 1,
  adventurers: [],
  activeQuests: [],
  completedQuests: 0,
  totalEarned: 0,
  totalSpent: 0,
  availableQuests: [],
  recruits: [],
  questsSucceeded: 0,
  questsFailed: 0,
  achievements: []
};

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
  loadGameState();
  initializeGame();
  setupEventListeners();
  updateDisplay();
  generateQuests();
  generateRecruits();
  
  // Auto-save every 30 seconds
  setInterval(saveGameState, 30000);
});

function initializeGame() {
  // Create starting adventurer if none exist
  if (gameState.adventurers.length === 0) {
    const starterAdventurer = createAdventurer('Fighter', 1);
    starterAdventurer.name = 'Sir Gareth';
    gameState.adventurers.push(starterAdventurer);
  }
}

function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      switchTab(this.dataset.tab);
    });
  });
  
  // Quest modal
  document.getElementById('close-quest-modal').addEventListener('click', closeQuestModal);
  document.getElementById('start-quest-btn').addEventListener('click', startQuest);
  
  // Hiring
  document.getElementById('refresh-recruits').addEventListener('click', refreshRecruits);
  
  // Click outside modal to close
  document.getElementById('quest-modal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeQuestModal();
    }
  });
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(tabName).classList.add('active');
  
  // Refresh content based on tab
  switch(tabName) {
    case 'adventurers':
      renderAdventurers();
      break;
    case 'quest-board':
      renderQuests();
      break;
    case 'hiring-hall':
      renderRecruits();
      break;
    case 'treasury':
      renderTreasury();
      break;
  }
}

function createAdventurer(className, rank = 1) {
  const classData = GAME_DATA.adventurerClasses[className];
  const adventurer = {
    id: Date.now() + Math.random(),
    name: getRandomName(),
    class: className,
    rank: rank,
    level: rank,
    experience: 0,
    experienceToNext: rank * 100,
    stats: { ...classData.baseStats },
    status: 'available', // available, on_quest, injured
    questsCompleted: 0,
    cost: classData.baseCost * rank
  };
  
  // Scale stats by rank
  Object.keys(adventurer.stats).forEach(stat => {
    adventurer.stats[stat] = Math.floor(adventurer.stats[stat] * (1 + (rank - 1) * 0.2));
  });
  
  return adventurer;
}

function getRandomName() {
  const availableNames = GAME_DATA.adventurerNames.filter(name => 
    !gameState.adventurers.some(adv => adv.name === name)
  );
  return availableNames[Math.floor(Math.random() * availableNames.length)] || 'Unknown Hero';
}

function generateQuests() {
  gameState.availableQuests = [];
  const questCount = Math.min(6, 3 + gameState.guildLevel);
  
  for (let i = 0; i < questCount; i++) {
    const questTemplate = GAME_DATA.questTypes[Math.floor(Math.random() * GAME_DATA.questTypes.length)];
    const quest = {
      id: Date.now() + Math.random() + i,
      ...questTemplate,
      reward: questTemplate.baseReward + Math.floor(Math.random() * 100),
      assignedAdventurers: []
    };
    gameState.availableQuests.push(quest);
  }
}

function generateRecruits() {
  gameState.recruits = [];
  const recruitCount = 4;
  
  for (let i = 0; i < recruitCount; i++) {
    const classes = Object.keys(GAME_DATA.adventurerClasses);
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    const randomRank = Math.max(1, Math.min(5, 1 + Math.floor(Math.random() * gameState.guildLevel)));
    
    const recruit = createAdventurer(randomClass, randomRank);
    gameState.recruits.push(recruit);
  }
}

function renderAdventurers() {
  const container = document.getElementById('adventurer-grid');
  container.innerHTML = '';
  
  gameState.adventurers.forEach(adventurer => {
    const card = document.createElement('div');
    card.className = 'adventurer-card';
    card.innerHTML = `
      <div class="adventurer-header">
        <div class="adventurer-name">${adventurer.name}</div>
        <div class="rank-badge rank-${adventurer.rank <= 2 ? 'novice' : adventurer.rank <= 3 ? 'experienced' : 'elite'}">
          ${GAME_DATA.rankNames[adventurer.rank - 1]}
        </div>
      </div>
      
      <div class="class-badge">${adventurer.class}</div>
      <div class="adventurer-description">${GAME_DATA.adventurerClasses[adventurer.class].description}</div>
      
      <div class="adventurer-stats">
        <div>❤️ HP: ${adventurer.stats.hp}</div>
        <div>⚔️ ATK: ${adventurer.stats.attack}</div>
        <div>🔮 MAG: ${adventurer.stats.magic}</div>
        <div>💨 SPD: ${adventurer.stats.speed}</div>
        <div>🛡️ DEF: ${adventurer.stats.defense}</div>
        <div>🎯 Quests: ${adventurer.questsCompleted}</div>
      </div>
      
      <div class="experience-bar">
        <div class="stat-bar">
          <div class="stat-fill" style="width: ${(adventurer.experience / adventurer.experienceToNext) * 100}%"></div>
        </div>
        <small>XP: ${adventurer.experience}/${adventurer.experienceToNext}</small>
      </div>
      
      <div class="adventurer-status">
        Status: <span class="status-${adventurer.status}">${adventurer.status.replace('_', ' ')}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderQuests() {
  const container = document.getElementById('quest-grid');
  container.innerHTML = '';
  
  gameState.availableQuests.forEach(quest => {
    const card = document.createElement('div');
    card.className = 'quest-card';
    card.innerHTML = `
      <div class="quest-header">
        <div class="quest-title">${quest.name}</div>
        <div class="difficulty-badge difficulty-${quest.difficulty.toLowerCase()}">${quest.difficulty}</div>
      </div>
      
      <div class="quest-description">${quest.description}</div>
      
      <div class="quest-details">
        <div>💰 Reward: ${quest.reward} gold</div>
        <div>⏱️ Duration: ${Math.floor(quest.duration / 60000)}m ${Math.floor((quest.duration % 60000) / 1000)}s</div>
        <div>📊 Min Level: ${quest.requirements.minLevel}</div>
        <div>🎯 Preferred: ${quest.requirements.preferredClasses.join(', ')}</div>
      </div>
      
      <button class="btn btn--primary quest-assign-btn" data-quest-id="${quest.id}">
        Assign Adventurers
      </button>
    `;
    container.appendChild(card);
  });
  
  // Add event listeners to quest buttons
  document.querySelectorAll('.quest-assign-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      openQuestModal(this.dataset.questId);
    });
  });
}

function renderRecruits() {
  const container = document.getElementById('recruit-grid');
  const currentAdventurers = gameState.adventurers.length;
  const maxAdventurers = GAME_DATA.guildLevelRewards[gameState.guildLevel - 1].maxAdventurers;
  
  document.getElementById('available-slots').textContent = maxAdventurers - currentAdventurers;
  document.getElementById('max-adventurers').textContent = maxAdventurers;
  
  container.innerHTML = '';
  
  gameState.recruits.forEach(recruit => {
    const card = document.createElement('div');
    card.className = 'recruit-card';
    card.innerHTML = `
      <div class="recruit-header">
        <div class="recruit-name">${recruit.name}</div>
        <div class="rank-badge rank-${recruit.rank <= 2 ? 'novice' : recruit.rank <= 3 ? 'experienced' : 'elite'}">
          ${GAME_DATA.rankNames[recruit.rank - 1]}
        </div>
      </div>
      
      <div class="class-badge">${recruit.class}</div>
      <div class="adventurer-description">${GAME_DATA.adventurerClasses[recruit.class].description}</div>
      
      <div class="adventurer-stats">
        <div>❤️ HP: ${recruit.stats.hp}</div>
        <div>⚔️ ATK: ${recruit.stats.attack}</div>
        <div>🔮 MAG: ${recruit.stats.magic}</div>
        <div>💨 SPD: ${recruit.stats.speed}</div>
        <div>🛡️ DEF: ${recruit.stats.defense}</div>
      </div>
      
      <div class="hire-cost">💰 Cost: ${recruit.cost} gold</div>
      
      <button class="btn btn--secondary hire-btn" data-recruit-id="${recruit.id}" 
              ${currentAdventurers >= maxAdventurers || gameState.gold < recruit.cost ? 'disabled' : ''}>
        ${currentAdventurers >= maxAdventurers ? 'Guild Full' : gameState.gold < recruit.cost ? 'Insufficient Gold' : 'Hire'}
      </button>
    `;
    container.appendChild(card);
  });
  
  // Add event listeners to hire buttons
  document.querySelectorAll('.hire-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (!this.disabled) {
        hireAdventurer(this.dataset.recruitId);
      }
    });
  });
}

function renderTreasury() {
  document.getElementById('treasury-gold').textContent = gameState.gold;
  document.getElementById('total-earned').textContent = gameState.totalEarned;
  document.getElementById('total-spent').textContent = gameState.totalSpent;
  document.getElementById('treasury-guild-level').textContent = gameState.guildLevel;
  document.getElementById('treasury-reputation').textContent = gameState.reputation;
  
  const totalQuests = gameState.questsSucceeded + gameState.questsFailed;
  const successRate = totalQuests > 0 ? Math.round((gameState.questsSucceeded / totalQuests) * 100) : 0;
  document.getElementById('success-rate').textContent = successRate + '%';
}

function openQuestModal(questId) {
  const quest = gameState.availableQuests.find(q => q.id == questId);
  if (!quest) return;
  
  const modal = document.getElementById('quest-modal');
  
  document.getElementById('quest-modal-title').textContent = `Assign: ${quest.name}`;
  document.getElementById('quest-modal-details').innerHTML = `
    <div class="quest-details">
      <div><strong>Difficulty:</strong> ${quest.difficulty}</div>
      <div><strong>Reward:</strong> ${quest.reward} gold</div>
      <div><strong>Duration:</strong> ${Math.floor(quest.duration / 60000)}m ${Math.floor((quest.duration % 60000) / 1000)}s</div>
      <div><strong>Min Level:</strong> ${quest.requirements.minLevel}</div>
      <div><strong>Preferred Classes:</strong> ${quest.requirements.preferredClasses.join(', ')}</div>
    </div>
    <p>${quest.description}</p>
  `;
  
  renderAvailableAdventurers(quest);
  modal.classList.add('active');
  modal.dataset.questId = questId;
}

function renderAvailableAdventurers(quest) {
  const container = document.getElementById('available-adventurers');
  const availableAdventurers = gameState.adventurers.filter(adv => adv.status === 'available');
  
  container.innerHTML = '';
  
  if (availableAdventurers.length === 0) {
    container.innerHTML = '<p>No available adventurers. All adventurers are currently on quests.</p>';
    document.getElementById('start-quest-btn').disabled = true;
    return;
  }
  
  availableAdventurers.forEach(adventurer => {
    const card = document.createElement('div');
    card.className = 'adventurer-select-card';
    card.dataset.adventurerId = adventurer.id;
    card.innerHTML = `
      <div><strong>${adventurer.name}</strong></div>
      <div>${adventurer.class} (${GAME_DATA.rankNames[adventurer.rank - 1]})</div>
      <div>Level ${adventurer.level}</div>
    `;
    
    card.addEventListener('click', function() {
      this.classList.toggle('selected');
      updateSuccessProbability(quest);
    });
    
    container.appendChild(card);
  });
  
  updateSuccessProbability(quest);
}

function updateSuccessProbability(quest) {
  const selectedCards = document.querySelectorAll('.adventurer-select-card.selected');
  const selectedAdventurers = Array.from(selectedCards).map(card => {
    const id = card.dataset.adventurerId;
    return gameState.adventurers.find(adv => adv.id == id);
  });
  
  let probability = 0;
  if (selectedAdventurers.length > 0) {
    const avgLevel = selectedAdventurers.reduce((sum, adv) => sum + adv.level, 0) / selectedAdventurers.length;
    const levelBonus = Math.max(0, (avgLevel - quest.requirements.minLevel) * 20);
    
    const classBonus = selectedAdventurers.reduce((bonus, adv) => {
      return bonus + (quest.requirements.preferredClasses.includes(adv.class) ? 20 : 0);
    }, 0);
    
    const teamSizeBonus = Math.min(selectedAdventurers.length * 10, 30);
    
    probability = Math.min(95, 30 + levelBonus + classBonus + teamSizeBonus);
  }
  
  document.getElementById('success-probability').textContent = probability + '%';
  document.getElementById('start-quest-btn').disabled = selectedAdventurers.length === 0;
}

function startQuest() {
  const modal = document.getElementById('quest-modal');
  const questId = modal.dataset.questId;
  const quest = gameState.availableQuests.find(q => q.id == questId);
  
  const selectedCards = document.querySelectorAll('.adventurer-select-card.selected');
  const selectedAdventurerIds = Array.from(selectedCards).map(card => card.dataset.adventurerId);
  
  if (selectedAdventurerIds.length === 0) return;
  
  // Update adventurer status
  selectedAdventurerIds.forEach(id => {
    const adventurer = gameState.adventurers.find(adv => adv.id == id);
    adventurer.status = 'on_quest';
  });
  
  // Create active quest
  const activeQuest = {
    ...quest,
    assignedAdventurers: selectedAdventurerIds,
    startTime: Date.now(),
    endTime: Date.now() + quest.duration
  };
  
  gameState.activeQuests.push(activeQuest);
  
  // Remove quest from available quests
  gameState.availableQuests = gameState.availableQuests.filter(q => q.id != questId);
  
  // Start quest timer
  startQuestTimer(activeQuest);
  
  closeQuestModal();
  addLogEntry(`Started quest: ${quest.name} with ${selectedAdventurerIds.length} adventurers`);
  showNotification(`Quest "${quest.name}" started!`, 'success');
  updateDisplay();
  renderQuests();
}

function startQuestTimer(quest) {
  const updateTimer = () => {
    const now = Date.now();
    const remaining = quest.endTime - now;
    
    if (remaining <= 0) {
      completeQuest(quest);
      return;
    }
    
    updateActiveQuestsDisplay();
    setTimeout(updateTimer, 1000);
  };
  
  updateTimer();
}

function completeQuest(quest) {
  // Calculate success
  const selectedAdventurers = quest.assignedAdventurers.map(id => 
    gameState.adventurers.find(adv => adv.id == id)
  );
  
  const avgLevel = selectedAdventurers.reduce((sum, adv) => sum + adv.level, 0) / selectedAdventurers.length;
  const levelBonus = Math.max(0, (avgLevel - quest.requirements.minLevel) * 20);
  const classBonus = selectedAdventurers.reduce((bonus, adv) => {
    return bonus + (quest.requirements.preferredClasses.includes(adv.class) ? 20 : 0);
  }, 0);
  const teamSizeBonus = Math.min(selectedAdventurers.length * 10, 30);
  const successChance = Math.min(95, 30 + levelBonus + classBonus + teamSizeBonus);
  
  const isSuccess = Math.random() * 100 < successChance;
  
  // Update adventurers
  selectedAdventurers.forEach(adventurer => {
    adventurer.status = 'available';
    
    if (isSuccess) {
      const expGain = 50 + (quest.requirements.minLevel * 10);
      adventurer.experience += expGain;
      adventurer.questsCompleted++;
      
      // Level up check
      if (adventurer.experience >= adventurer.experienceToNext) {
        levelUpAdventurer(adventurer);
      }
    }
  });
  
  // Update guild stats
  if (isSuccess) {
    gameState.gold += quest.reward;
    gameState.reputation += 10;
    gameState.totalEarned += quest.reward;
    gameState.questsSucceeded++;
    gameState.completedQuests++;
    
    addLogEntry(`✅ Quest "${quest.name}" completed successfully! Earned ${quest.reward} gold.`);
    showNotification(`Quest completed! +${quest.reward} gold`, 'success');
  } else {
    gameState.reputation = Math.max(0, gameState.reputation - 5);
    gameState.questsFailed++;
    
    addLogEntry(`❌ Quest "${quest.name}" failed. No reward earned.`);
    showNotification(`Quest failed! Better luck next time.`, 'error');
  }
  
  // Check for guild level up
  checkGuildLevelUp();
  
  // Remove from active quests
  gameState.activeQuests = gameState.activeQuests.filter(q => q.id != quest.id);
  
  // Generate new quest
  if (gameState.availableQuests.length < 6) {
    const newQuest = GAME_DATA.questTypes[Math.floor(Math.random() * GAME_DATA.questTypes.length)];
    gameState.availableQuests.push({
      id: Date.now() + Math.random(),
      ...newQuest,
      reward: newQuest.baseReward + Math.floor(Math.random() * 100),
      assignedAdventurers: []
    });
  }
  
  updateDisplay();
  saveGameState();
}

function levelUpAdventurer(adventurer) {
  adventurer.level++;
  adventurer.rank = Math.min(5, Math.floor((adventurer.level - 1) / 2) + 1);
  adventurer.experience = 0;
  adventurer.experienceToNext = adventurer.level * 100;
  
  // Increase stats
  Object.keys(adventurer.stats).forEach(stat => {
    adventurer.stats[stat] += Math.floor(adventurer.stats[stat] * 0.1);
  });
  
  addLogEntry(`🌟 ${adventurer.name} leveled up to level ${adventurer.level}!`);
  showNotification(`${adventurer.name} leveled up!`, 'success');
}

function checkGuildLevelUp() {
  const newLevel = Math.min(5, Math.floor(gameState.reputation / 100) + 1);
  if (newLevel > gameState.guildLevel) {
    gameState.guildLevel = newLevel;
    addLogEntry(`🏰 Guild leveled up to level ${newLevel}!`);
    showNotification(`Guild Level Up! Level ${newLevel}`, 'success');
  }
}

function hireAdventurer(recruitId) {
  const recruit = gameState.recruits.find(r => r.id == recruitId);
  const currentAdventurers = gameState.adventurers.length;
  const maxAdventurers = GAME_DATA.guildLevelRewards[gameState.guildLevel - 1].maxAdventurers;
  
  if (currentAdventurers >= maxAdventurers) {
    showNotification('Guild is at maximum capacity!', 'error');
    return;
  }
  
  if (gameState.gold < recruit.cost) {
    showNotification('Insufficient gold!', 'error');
    return;
  }
  
  gameState.gold -= recruit.cost;
  gameState.totalSpent += recruit.cost;
  gameState.adventurers.push({ ...recruit, status: 'available' });
  gameState.recruits = gameState.recruits.filter(r => r.id != recruitId);
  
  addLogEntry(`Hired ${recruit.name} the ${recruit.class} for ${recruit.cost} gold`);
  showNotification(`Hired ${recruit.name}!`, 'success');
  
  updateDisplay();
  renderRecruits();
  
  // Generate new recruit
  if (gameState.recruits.length < 4) {
    const classes = Object.keys(GAME_DATA.adventurerClasses);
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    const randomRank = Math.max(1, Math.min(5, 1 + Math.floor(Math.random() * gameState.guildLevel)));
    const newRecruit = createAdventurer(randomClass, randomRank);
    gameState.recruits.push(newRecruit);
  }
  
  saveGameState();
}

function refreshRecruits() {
  if (gameState.gold < 50) {
    showNotification('Need 50 gold to refresh recruits!', 'error');
    return;
  }
  
  gameState.gold -= 50;
  gameState.totalSpent += 50;
  generateRecruits();
  renderRecruits();
  updateDisplay();
  showNotification('Recruits refreshed!', 'success');
  saveGameState();
}

function closeQuestModal() {
  document.getElementById('quest-modal').classList.remove('active');
}

function updateDisplay() {
  document.getElementById('gold-display').textContent = gameState.gold;
  document.getElementById('reputation-display').textContent = gameState.reputation;
  document.getElementById('guild-level-display').textContent = gameState.guildLevel;
  document.getElementById('active-adventurers').textContent = gameState.adventurers.length;
  document.getElementById('active-quests').textContent = gameState.activeQuests.length;
  document.getElementById('completed-quests').textContent = gameState.completedQuests;
  
  updateActiveQuestsDisplay();
}

function updateActiveQuestsDisplay() {
  const container = document.getElementById('active-quests-list');
  
  if (gameState.activeQuests.length === 0) {
    container.innerHTML = '<p class="no-quests">No active quests</p>';
    return;
  }
  
  container.innerHTML = '';
  
  gameState.activeQuests.forEach(quest => {
    const now = Date.now();
    const remaining = Math.max(0, quest.endTime - now);
    const progress = Math.max(0, (quest.duration - remaining) / quest.duration * 100);
    
    const questItem = document.createElement('div');
    questItem.className = 'active-quest-item';
    questItem.innerHTML = `
      <div><strong>${quest.name}</strong></div>
      <div class="quest-timer">Time remaining: ${formatTime(remaining)}</div>
      <div class="quest-progress">
        <div class="quest-progress-fill" style="width: ${progress}%"></div>
      </div>
      <div>Adventurers: ${quest.assignedAdventurers.length}</div>
    `;
    
    container.appendChild(questItem);
  });
}

function formatTime(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function addLogEntry(message) {
  const logContainer = document.getElementById('activity-log');
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.innerHTML = `<span style="opacity: 0.7">[${timestamp}]</span> ${message}`;
  logContainer.appendChild(entry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

function showNotification(message, type = 'info') {
  const container = document.getElementById('notifications');
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  container.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function saveGameState() {
  try {
    localStorage.setItem('adventurerGuildSave', JSON.stringify(gameState));
  } catch (e) {
    console.warn('Could not save game state:', e);
  }
}

function loadGameState() {
  try {
    const saved = localStorage.getItem('adventurerGuildSave');
    if (saved) {
      const loadedState = JSON.parse(saved);
      gameState = { ...gameState, ...loadedState };
      
      // Clean up any expired quests
      const now = Date.now();
      gameState.activeQuests = gameState.activeQuests.filter(quest => quest.endTime > now);
      
      // Restart timers for active quests
      gameState.activeQuests.forEach(quest => {
        startQuestTimer(quest);
      });
    }
  } catch (e) {
    console.warn('Could not load game state:', e);
  }
}