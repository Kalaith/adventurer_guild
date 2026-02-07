# Adventurer Guild Management Game

A comprehensive fantasy guild management simulation where you lead an adventurer guild through multiple generations, building relationships, expanding territories, and creating lasting legacies.

## 🎮 Core Features

### **Guild Management System**
- 🏰 **Guild Operations**: Manage up to 25 adventurers across multiple specializations
- 💰 **Advanced Economics**: Complex resource management with gold, materials, and faction currencies
- 📈 **Guild Progression**: 10-level guild system with expanding capabilities and influence
- 🏛️ **Facility Management**: Upgrade forge, training grounds, library, barracks, and treasury

### **Adventurer System**
- ⚔️ **Classes**: Warrior, Mage, Rogue, Archer with distinct abilities and progression paths
- 🧠 **Personality System**: 5 personality traits (Courage, Loyalty, Ambition, Teamwork, Greed) affecting behavior
- 🌳 **Skill Specialization**: 4 skill trees (Combat, Magic, Stealth, Survival) with 3 skills each
- 📊 **Advanced Stats**: Strength, Intelligence, Dexterity, Vitality with equipment bonuses
- 👥 **Relationship System**: Romance, friendships, and rivalries between guild members
- 🎓 **Retirement System**: 4 retirement roles providing ongoing benefits to the guild

## 🗺️ Quest & Content Systems

### **Quest Variety**
- 📋 **Standard Quests**: Hand-crafted quests with unique rewards and challenges
- 🎲 **Procedural Generation**: Infinite quest variety with contextual difficulty scaling
- 📚 **Epic Campaigns**: Multi-part storylines with branching narratives (3 complete campaigns)
- 🌍 **World Events**: 8 dynamic events affecting quest availability and guild operations
- 🎄 **Seasonal Content**: 5 seasonal festivals with time-limited quests and rewards
- 🗺️ **Territory Quests**: Exclusive content unlocked through territorial expansion

### **Advanced Quest Features**
- 🎯 **Smart Matching**: Personality and skill requirements for optimal quest assignment
- ⚡ **Team Synergy**: Relationship bonuses affecting quest success rates
- 🏆 **Legendary Rewards**: Epic and legendary equipment from challenging quests
- 📊 **Success Prediction**: AI-driven success rate calculations based on adventurer capabilities

## 🏗️ Crafting & Equipment

### **Comprehensive Crafting System**
- ⚒️ **Material Gathering**: 15+ crafting materials from common to legendary rarity
- 📜 **Recipe System**: 15+ crafting recipes with facility level requirements
- 🔨 **Guild Forge**: Upgradeable crafting facilities with enhanced capabilities
- 🎨 **Custom Equipment**: Player-crafted gear with superior stats to found items

### **Equipment Progression**
- 🎒 **Equipment Slots**: Weapon, armor, and accessory slots for each adventurer
- ⭐ **Rarity System**: Common → Uncommon → Rare → Epic → Legendary progression
- 👑 **Heirloom Items**: Generational equipment that improves over time
- 💎 **Stat Enhancement**: Equipment providing significant stat boosts and specialization

## 🌟 Advanced Gameplay Systems

### **Political & Social Mechanics**
- 🗳️ **Guild Politics**: Democratic voting system with faction formation
- 🤝 **Faction Reputation**: 8 distinct factions with unique benefits and questlines
- ⚔️ **Rival Guilds**: 5 competing AI guilds with strategic behaviors and quest competition
- 🏛️ **Leadership Challenges**: Dynamic political events affecting guild morale and direction

### **Territory & Expansion**
- 🗺️ **Territory Control**: 8 controllable regions with unique benefits and challenges
- 🛡️ **Influence System**: Gradual expansion through diplomatic, military, economic, or cultural means
- ⚡ **Territory Conflicts**: Dynamic conflicts requiring strategic resolution
- 🏰 **Outpost Management**: Establish and maintain territorial presence

### **Legacy & Multi-Generational Play**
- 👑 **Legacy System**: Multi-generational gameplay spanning multiple guild incarnations
- 🧬 **Descendant System**: Retired adventurers' children join as enhanced recruits
- 📚 **Guild Chronicles**: Historical records of achievements and legendary figures
- 🎯 **Legacy Bonuses**: Permanent improvements carrying across generations
- 💰 **Inheritance Mechanics**: Resources and reputation partially transfer between generations

## 🎯 Combat & Strategy

### **Advanced Combat Mechanics**
- 🎲 **Skill-Based Success**: Success rates calculated from adventurer skills and equipment
- 👥 **Team Composition**: Synergy bonuses for well-balanced adventurer teams
- 🧠 **AI Personality**: Adventurer behavior influenced by personality traits
- ⚡ **Dynamic Difficulty**: Quest difficulty scales with guild level and reputation

### **Strategic Depth**
- 📊 **Performance Analytics**: Detailed statistics on adventurer performance and optimization
- 🎯 **Resource Optimization**: Balance gold, materials, reputation, and influence
- 🔄 **Long-term Planning**: Multi-generational strategy and legacy building
- ⚖️ **Risk Management**: Balance high-reward dangerous quests with safe operations

## 🛠️ Tech Stack

### **Frontend Architecture**
- **Framework**: React 19 + TypeScript for modern, type-safe development
- **Build Tool**: Vite 6.x for fast development and optimized builds
- **Styling**: Tailwind CSS 4.x for responsive, utility-first design
- **State Management**: Zustand 5.x for lightweight, persistent state management
- **Animation**: Framer Motion for smooth UI transitions and feedback
- **Routing**: React Router DOM for client-side navigation

### **Development Tools**
- **Testing**: Vitest + React Testing Library for comprehensive test coverage
- **Code Quality**: ESLint + Prettier for consistent code style
- **Type Safety**: TypeScript 5.x for compile-time error prevention
- **Error Boundaries**: Graceful error handling and recovery

## 📁 Project Architecture

```
src/
├── api/                  # API service definitions and mock data
├── components/           # Reusable React components
│   ├── ui/              # Generic UI components (buttons, modals, forms)
│   ├── game/            # Game-specific components (quest boards, adventurer cards)
│   ├── layout/          # Layout components (header, navigation, panels)
│   └── ErrorBoundary.tsx
├── constants/            # Game constants and configuration
├── data/                # Static game data and content
│   ├── adventurers.ts   # Initial adventurer templates
│   ├── quests.ts        # Hand-crafted quest definitions
│   ├── campaigns.ts     # Multi-part campaign storylines
│   ├── worldEvents.ts   # Dynamic world event definitions
│   ├── seasonalContent.ts # Seasonal events and content
│   ├── crafting.ts      # Crafting materials and recipes
│   └── factions.ts      # Faction definitions and reputation systems
├── hooks/               # Custom React hooks for game logic
│   ├── useQuestManagement.ts
│   └── useGuildData.ts
├── pages/               # Page components and routing
├── stores/              # Zustand state stores
│   ├── gameStore.ts     # Main game state management
│   └── uiStore.ts       # UI state and preferences
├── types/               # TypeScript type definitions
│   └── game.ts          # Comprehensive game type system
├── utils/               # Utility functions and game systems
│   ├── questGenerator.ts     # Procedural quest generation
│   ├── relationshipSystem.ts # Adventurer relationship mechanics
│   ├── retirementSystem.ts   # Adventurer retirement and benefits
│   ├── guildPolitics.ts      # Voting and political systems
│   ├── territoryControl.ts   # Territory expansion mechanics
│   ├── rivalGuildsAI.ts      # AI competitor behavior
│   ├── legacySystem.ts       # Multi-generational progression
│   └── formatters.ts         # Display formatting utilities
└── styles/              # Global styles and Tailwind configuration
```

## 🎮 Game Mechanics Deep Dive

### **Adventurer Progression**
- **Experience System**: Adventurers gain XP from quests, relationships, and training
- **Skill Development**: 12 distinct skills across 4 categories with specialization paths
- **Equipment Mastery**: Adventurers become more effective with familiar equipment types
- **Personality Evolution**: Traits can shift based on quest experiences and relationships

### **Economic Systems**
- **Multi-Currency**: Gold, materials, reputation, and faction currencies
- **Dynamic Pricing**: Recruit costs and service prices fluctuate based on supply/demand
- **Investment Returns**: Territory control and facility upgrades provide ongoing benefits
- **Risk/Reward Balance**: High-danger quests offer proportionally better rewards

### **Social Dynamics**
- **Relationship Networks**: Complex web of relationships affecting team performance
- **Guild Morale**: Overall guild happiness affects recruitment and quest success
- **Political Intrigue**: Internal factions and external diplomatic relationships
- **Succession Planning**: Preparing the next generation of guild leadership

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0+ and npm 8.0+
- Modern web browser with ES2022 support

### Installation & Development

1. **Clone and Setup**:
   ```bash
   cd adventurer_guild/frontend
   npm install
   ```

2. **Development Server**:
   ```bash
   npm run dev          # Start development server (localhost:5173)
   ```

3. **Quality Assurance**:
   ```bash
   npm run ci           # Full CI pipeline (type-check, lint, test, build)
   npm run type-check   # TypeScript validation
   npm run lint         # ESLint analysis
   npm run test:run     # Unit test execution
   ```

4. **Production Build**:
   ```bash
   npm run build        # Optimized production build
   npm run preview      # Preview production build
   ```

## 🧪 Testing & Quality

### **Comprehensive Testing Strategy**
- **Unit Tests**: Core game logic and utility functions
- **Component Tests**: UI component behavior and interaction
- **Integration Tests**: System interaction and data flow
- **Type Safety**: Comprehensive TypeScript coverage

### **Code Quality Standards**
- **ESLint Configuration**: Strict linting rules for consistency
- **Prettier Integration**: Automated code formatting
- **Pre-commit Hooks**: Automated quality checks before commits
- **Continuous Integration**: Automated testing and validation

## 📊 Game Content Overview

### **Quest Content**
- **200+ Unique Quests** across all content types
- **3 Epic Campaigns** with 9 multi-part storylines
- **50+ World Event Quests** tied to dynamic events
- **40+ Seasonal Quests** for time-limited content
- **Infinite Procedural Quests** with contextual generation

### **Character Content**
- **100+ Adventurer Personalities** through procedural generation
- **50+ Equipment Items** across all rarity tiers
- **25+ Legendary Items** with unique properties
- **15+ Crafting Recipes** for player-created equipment

### **Strategic Content**
- **8 Controllable Territories** with unique benefits
- **8 Faction Relationships** providing specialized content
- **5 Rival Guilds** with distinct AI personalities
- **10+ Legacy Bonuses** for multi-generational play

## 🔮 Future Enhancements

See `future_ui_improvements.md` for comprehensive UI/UX enhancement roadmap based on Nielsen's usability heuristics, including:

- **Real-time Progress Indicators** and status dashboards
- **Medieval Fantasy UI Metaphors** for immersive interface design
- **Drag & Drop Quest Assignment** for intuitive management
- **Advanced Analytics Dashboard** for strategic optimization
- **Accessibility Features** for inclusive gaming experience

## 🤝 Contributing

### **Development Guidelines**
1. **Code Standards**: Follow ESLint and Prettier configurations
2. **Type Safety**: All new code must include comprehensive TypeScript types
3. **Testing Requirements**: Unit tests required for all new game mechanics
4. **Component Organization**: Follow established architectural patterns
5. **Documentation**: Update relevant documentation for new features

### **Feature Development Process**
1. **Design Review**: Discuss new features in context of existing systems
2. **Type Definition**: Define comprehensive TypeScript interfaces
3. **Implementation**: Build feature with full error handling
4. **Testing**: Create unit and integration tests
5. **Documentation**: Update README and code documentation

## License

This project is licensed under the MIT License - see the individual component README files for details.

Part of the WebHatchery game collection.