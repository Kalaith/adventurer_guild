import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Treasury } from '../../components/Treasury';
import { useGuildStore } from '../../stores/gameStore';

// Mock the store
vi.mock('../../stores/gameStore');

const mockUseGuildStore = vi.mocked(useGuildStore);

describe('Treasury Component', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockUseGuildStore.mockReturnValue({
      gold: 1500,
      reputation: 250,
      level: 3,
      formatNumber: (num: number) => {
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
      }
    } as any);
  });

  it('should render treasury information correctly', () => {
    render(<Treasury />);

    expect(screen.getByText('Treasury')).toBeInTheDocument();
    expect(screen.getByText('1.5K')).toBeInTheDocument(); // Gold amount
    expect(screen.getByText('250')).toBeInTheDocument(); // Reputation
    expect(screen.getByText('Level 3')).toBeInTheDocument(); // Guild level
  });

  it('should display gold icon and label', () => {
    render(<Treasury />);

    expect(screen.getByText('Gold')).toBeInTheDocument();
  });

  it('should display reputation icon and label', () => {
    render(<Treasury />);

    expect(screen.getByText('Reputation')).toBeInTheDocument();
  });

  it('should handle large numbers correctly', () => {
    mockUseGuildStore.mockReturnValue({
      gold: 1500000,
      reputation: 10000,
      level: 10,
      formatNumber: (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
      }
    } as any);

    render(<Treasury />);

    expect(screen.getByText('1.5M')).toBeInTheDocument(); // Gold formatted
    expect(screen.getByText('10.0K')).toBeInTheDocument(); // Reputation formatted
    expect(screen.getByText('Level 10')).toBeInTheDocument();
  });

  it('should handle zero values', () => {
    mockUseGuildStore.mockReturnValue({
      gold: 0,
      reputation: 0,
      level: 1,
      formatNumber: (num: number) => num.toString()
    } as any);

    render(<Treasury />);

    expect(screen.getByText('0')).toBeInTheDocument(); // Should appear twice for gold and reputation
    expect(screen.getByText('Level 1')).toBeInTheDocument();
  });

  it('should have proper accessibility structure', () => {
    render(<Treasury />);

    const treasurySection = screen.getByRole('region', { name: /treasury/i });
    expect(treasurySection).toBeInTheDocument();
  });
});