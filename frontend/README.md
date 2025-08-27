# Adventurer Guild Management Game

A React/TypeScript game where you manage an adventurer guild, hire heroes, and send them on quests to earn gold and reputation.

## Features

- 🏰 **Guild Management**: Hire and manage adventurers
- 📋 **Quest System**: Send adventurers on various quests
- ⚔️ **Character Progression**: Level up adventurers with experience
- 💰 **Resource Management**: Manage gold and reputation
- 🎮 **Real-time Updates**: Live quest timers and progress tracking

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Routing**: React Router DOM
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage

## Project Structure

```
src/
├── api/              # API service definitions
├── components/       # Reusable React components
│   ├── ui/          # Generic UI components
│   ├── game/        # Game-specific components
│   └── layout/      # Layout components
├── constants/        # Game constants and configuration
├── data/            # Static game data
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── stores/          # Zustand state stores
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── styles/          # Global styles
```

## Game Mechanics

### Adventurers
- **Classes**: Warrior, Mage, Rogue, Archer
- **Stats**: Strength, Intelligence, Dexterity, Vitality
- **Ranks**: Novice → Apprentice → Journeyman → Expert → Master

### Quests
- **Difficulties**: Easy, Medium, Hard
- **Rewards**: Gold and experience points
- **Requirements**: Minimum level and preferred classes

### Guild Management
- **Resources**: Gold for hiring and upgrades
- **Reputation**: Earned through quest completion
- **Level**: Guild level increases with reputation

## Development

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Husky for git hooks (planned)

### Testing
- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright (planned)

## Contributing

1. Follow the established coding standards
2. Write tests for new features
3. Use TypeScript for all new code
4. Follow the component organization structure
5. Run linting and formatting before committing

## License

This project is for educational purposes.
