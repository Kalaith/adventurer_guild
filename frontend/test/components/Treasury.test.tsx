// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Treasury from '../../src/components/Treasury';
import { useGuildStore } from '../../src/stores/gameStore';

vi.mock('../../src/stores/gameStore');

const mockUseGuildStore = vi.mocked(useGuildStore);

interface MockGuildState {
  gold: number;
  reputation: number;
  level: number;
  lastSave: number;
  saveSlots: Array<{
    slotNumber: number;
    slotName: string;
    version: string;
    updatedAt: number | null;
    createdAt: number | null;
    metadata: {
      adventurerCount?: number;
      activeQuestCount?: number;
      completedQuestCount?: number;
    };
  }>;
  isSaving: boolean;
  isHydrating: boolean;
  error: string | null;
  factions: Array<{ id: string; name: string; reputation: number; standingLabel?: string }>;
  facilities: Array<{ id: string; name: string; level: number; maxLevel: number }>;
  worldEvents: Array<{ id: string; name: string; active: boolean; endsAt?: number | null; duration: number }>;
  territories: Array<{ id: string; name: string; controlled: boolean }>;
  activeVotes: Array<{ id: string }>;
  retiredAdventurers: Array<{ id: string }>;
  materials: Record<string, number>;
  materialCatalog: Array<{ id: string; name: string }>;
  availableRecipes: string[];
  recipeCatalog: Array<{ id: string; name: string; materials: Record<string, number>; goldCost: number; requiredFacilityLevel: number }>;
  equipmentInventory: Array<{ id: string; name: string; rarity: string; type: string; equippedBy?: string | null }>;
  formatNumber: (num: number) => string;
  saveSlot: (slotNumber: number, slotName?: string) => Promise<void>;
  loadSlot: (slotNumber: number) => Promise<void>;
  upgradeFacility: (facilityId: string) => Promise<void>;
  craftRecipe: (recipeId: string) => Promise<void>;
}

afterEach(() => {
  cleanup();
});

describe('Treasury Component', () => {
  const saveSlot = vi.fn().mockResolvedValue(undefined);
  const loadSlot = vi.fn().mockResolvedValue(undefined);
  const upgradeFacility = vi.fn().mockResolvedValue(undefined);
  const craftRecipe = vi.fn().mockResolvedValue(undefined);
  const saveSlots = [
    {
      slotNumber: 1,
      slotName: 'Primary Save',
      version: '1.0.0',
      updatedAt: Date.parse('2026-03-07T10:00:00Z'),
      createdAt: Date.parse('2026-03-07T09:30:00Z'),
      metadata: {
        adventurerCount: 4,
        activeQuestCount: 1,
        completedQuestCount: 7,
      },
    },
    {
      slotNumber: 3,
      slotName: 'Guild Alpha',
      version: '1.0.0',
      updatedAt: Date.parse('2026-03-07T12:00:00Z'),
      createdAt: Date.parse('2026-03-07T11:00:00Z'),
      metadata: {
        adventurerCount: 6,
        activeQuestCount: 2,
        completedQuestCount: 9,
      },
    },
  ];

  beforeEach(() => {
    mockUseGuildStore.mockReturnValue({
      gold: 1500,
      reputation: 250,
      level: 3,
      lastSave: Date.parse('2026-03-07T10:00:00Z'),
      saveSlots,
      isSaving: false,
      isHydrating: false,
      error: null,
      factions: [{ id: 'merchants_guild', name: "Merchants' Guild", reputation: 150, standingLabel: 'Friendly' }],
      facilities: [{ id: 'forge', name: 'Guild Forge', level: 1, maxLevel: 5 }],
      worldEvents: [{ id: 'merchant_festival', name: 'Grand Merchant Festival', active: true, endsAt: Date.parse('2026-03-09T10:00:00Z'), duration: 7 }],
      territories: [{ id: 'greenwood_village', name: 'Greenwood Village', controlled: false }],
      activeVotes: [],
      retiredAdventurers: [],
      materials: { iron_ore: 3 },
      materialCatalog: [{ id: 'iron_ore', name: 'Iron Ore' }],
      availableRecipes: ['iron_sword'],
      recipeCatalog: [{ id: 'iron_sword', name: 'Iron Sword', materials: { iron_ore: 3 }, goldCost: 100, requiredFacilityLevel: 1 }],
      equipmentInventory: [],
      saveSlot,
      loadSlot,
      upgradeFacility,
      craftRecipe,
      formatNumber: (num: number) => {
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
      },
    } as MockGuildState);
  });

  it('renders treasury information correctly', () => {
    render(<Treasury />);

    expect(screen.getByText('Treasury')).toBeInTheDocument();
    expect(screen.getByText('1.5K')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('Level 3')).toBeInTheDocument();
    expect(screen.getByText(/Last save:/)).toBeInTheDocument();
    expect(screen.getByText('Guild Systems')).toBeInTheDocument();
    expect(screen.getByText('Guild Forge')).toBeInTheDocument();
    expect(screen.getByText("Merchants' Guild")).toBeInTheDocument();
  });

  it('renders save slot metadata', () => {
    render(<Treasury />);

    expect(screen.getAllByText('Primary Save').length).toBeGreaterThan(0);
    expect(screen.getByText(/Snapshot: 4 adventurers, 1 active quests, 7 completed quests/)).toBeInTheDocument();
    expect(screen.getAllByText('Guild Alpha').length).toBeGreaterThan(0);
  });

  it('calls saveSlot with selected slot and name', () => {
    render(<Treasury />);

    fireEvent.change(screen.getByLabelText('Slot'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Save Name'), { target: { value: 'Guild Alpha' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Slot' }));

    expect(saveSlot).toHaveBeenCalledWith(3, 'Guild Alpha');
  });

  it('calls loadSlot with selected slot', () => {
    render(<Treasury />);

    fireEvent.change(screen.getByLabelText('Slot'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Load Slot' }));

    expect(loadSlot).toHaveBeenCalledWith(3);
  });

  it('switches selected metadata when a slot card is clicked', () => {
    render(<Treasury />);

    fireEvent.click(screen.getAllByRole('button', { name: /Guild Alpha/ })[0]);

    expect(screen.getByLabelText('Save Name')).toHaveValue('Guild Alpha');
    expect(screen.getByText(/Snapshot: 6 adventurers, 2 active quests, 9 completed quests/)).toBeInTheDocument();
  });

  it('shows backend errors', () => {
    mockUseGuildStore.mockReturnValue({
      gold: 1500,
      reputation: 250,
      level: 3,
      lastSave: Date.parse('2026-03-07T10:00:00Z'),
      saveSlots,
      isSaving: false,
      isHydrating: false,
      error: 'Failed to save slot',
      factions: [],
      facilities: [],
      worldEvents: [],
      territories: [],
      activeVotes: [],
      retiredAdventurers: [],
      materials: {},
      materialCatalog: [],
      availableRecipes: [],
      recipeCatalog: [],
      equipmentInventory: [],
      saveSlot,
      loadSlot,
      upgradeFacility,
      craftRecipe,
      formatNumber: (num: number) => num.toString(),
    } as MockGuildState);

    render(<Treasury />);

    expect(screen.getByText('Failed to save slot')).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    render(<Treasury />);

    const treasurySection = screen.getByRole('region', { name: /treasury/i });
    expect(treasurySection).toBeInTheDocument();
  });

  it('calls backend world actions', () => {
    render(<Treasury />);

    fireEvent.click(screen.getByRole('button', { name: 'Upgrade' }));
    fireEvent.click(screen.getByRole('button', { name: 'Craft' }));

    expect(upgradeFacility).toHaveBeenCalledWith('forge');
    expect(craftRecipe).toHaveBeenCalledWith('iron_sword');
  });
});
