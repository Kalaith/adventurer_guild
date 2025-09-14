import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavigationTabs } from '../../components/NavigationTabs';
import { useUIStore } from '../../stores/uiStore';

// Mock the UI store
vi.mock('../../stores/uiStore');

const mockUseUIStore = vi.mocked(useUIStore);

describe('NavigationTabs Component', () => {
  const mockSetActiveTab = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUIStore.mockReturnValue({
      activeTab: 'adventurers',
      setActiveTab: mockSetActiveTab
    } as any);
  });

  it('should render all navigation tabs', () => {
    render(<NavigationTabs />);

    expect(screen.getByText('Adventurers')).toBeInTheDocument();
    expect(screen.getByText('Quests')).toBeInTheDocument();
    expect(screen.getByText('Hiring Hall')).toBeInTheDocument();
    expect(screen.getByText('Guild Hall')).toBeInTheDocument();
  });

  it('should highlight the active tab', () => {
    render(<NavigationTabs />);

    const adventurersTab = screen.getByText('Adventurers').closest('button');
    expect(adventurersTab).toHaveClass('bg-blue-500'); // Active tab styling
  });

  it('should call setActiveTab when tab is clicked', () => {
    render(<NavigationTabs />);

    const questsTab = screen.getByText('Quests');
    fireEvent.click(questsTab);

    expect(mockSetActiveTab).toHaveBeenCalledWith('quests');
  });

  it('should switch active state when different tab is selected', () => {
    // First render with 'adventurers' active
    render(<NavigationTabs />);

    // Mock store returning 'quests' as active
    mockUseUIStore.mockReturnValue({
      activeTab: 'quests',
      setActiveTab: mockSetActiveTab
    } as any);

    // Re-render with updated state
    const { rerender } = render(<NavigationTabs />);
    rerender(<NavigationTabs />);

    const questsTab = screen.getByText('Quests').closest('button');
    const adventurersTab = screen.getByText('Adventurers').closest('button');

    expect(questsTab).toHaveClass('bg-blue-500'); // Active
    expect(adventurersTab).not.toHaveClass('bg-blue-500'); // Inactive
  });

  it('should have proper accessibility attributes', () => {
    render(<NavigationTabs />);

    const tabList = screen.getByRole('tablist');
    expect(tabList).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);

    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('aria-selected');
    });

    const activeTab = screen.getByRole('tab', { selected: true });
    expect(activeTab).toHaveTextContent('Adventurers');
  });

  it('should support keyboard navigation', () => {
    render(<NavigationTabs />);

    const questsTab = screen.getByText('Quests');

    // Tab should be focusable
    questsTab.focus();
    expect(document.activeElement).toBe(questsTab);

    // Enter key should activate tab
    fireEvent.keyDown(questsTab, { key: 'Enter' });
    expect(mockSetActiveTab).toHaveBeenCalledWith('quests');

    // Space key should also activate tab
    fireEvent.keyDown(questsTab, { key: ' ' });
    expect(mockSetActiveTab).toHaveBeenCalledWith('quests');
  });

  it('should handle all tab types correctly', () => {
    const tabs = ['adventurers', 'quests', 'hiring', 'guild_hall'];

    tabs.forEach(tabName => {
      mockUseUIStore.mockReturnValue({
        activeTab: tabName,
        setActiveTab: mockSetActiveTab
      } as any);

      render(<NavigationTabs />);

      const activeTab = screen.getByRole('tab', { selected: true });
      expect(activeTab).toBeInTheDocument();
    });
  });
});