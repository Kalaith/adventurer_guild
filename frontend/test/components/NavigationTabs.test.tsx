// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import NavigationTabs from '../../src/components/NavigationTabs';
import { useUIStore, type TabId } from '../../src/stores/uiStore';

afterEach(() => {
  cleanup();
});

describe('NavigationTabs Component', () => {
  const mockSetActiveTab = vi.fn<(tab: TabId) => void>();

  beforeEach(() => {
    vi.clearAllMocks();
    useUIStore.setState({
      activeTab: 'adventurers',
      setActiveTab: mockSetActiveTab,
    });
  });

  it('should render all navigation tabs', () => {
    render(<NavigationTabs />);

    expect(screen.getByRole('tab', { name: /Guild Hall/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Adventurers/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Quest Board/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Hiring Hall/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Treasury/i })).toBeInTheDocument();
  });

  it('should highlight the active tab', () => {
    render(<NavigationTabs />);

    const adventurersTab = screen.getByRole('tab', { name: /Adventurers/i });
    expect(adventurersTab).toHaveAttribute('aria-selected', 'true');
    expect(adventurersTab).toHaveClass('active');
  });

  it('should call setActiveTab when tab is clicked', () => {
    render(<NavigationTabs />);

    fireEvent.click(screen.getByRole('tab', { name: /Quest Board/i }));
    expect(mockSetActiveTab).toHaveBeenCalledWith('quest-board');
  });

  it('should switch active state when different tab is selected', () => {
    render(<NavigationTabs />);

    act(() => {
      useUIStore.setState({ activeTab: 'quest-board' });
    });

    const questBoardTab = screen.getByRole('tab', { name: /Quest Board/i });
    const adventurersTab = screen.getByRole('tab', { name: /Adventurers/i });

    expect(questBoardTab).toHaveAttribute('aria-selected', 'true');
    expect(adventurersTab).toHaveAttribute('aria-selected', 'false');
  });

  it('should have proper accessibility attributes', () => {
    render(<NavigationTabs />);

    const tabList = screen.getByRole('tablist', { name: /Primary navigation/i });
    expect(tabList).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(5);

    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('aria-selected');
    });

    const activeTab = screen.getByRole('tab', { selected: true });
    expect(activeTab).toHaveTextContent(/Adventurers/i);
  });

  it('should support keyboard navigation', () => {
    render(<NavigationTabs />);

    const questBoardTab = screen.getByRole('tab', { name: /Quest Board/i });
    questBoardTab.focus();
    expect(document.activeElement).toBe(questBoardTab);

    fireEvent.keyDown(questBoardTab, { key: 'Enter' });
    expect(mockSetActiveTab).toHaveBeenCalledWith('quest-board');

    fireEvent.keyDown(questBoardTab, { key: ' ' });
    expect(mockSetActiveTab).toHaveBeenCalledWith('quest-board');
  });

  it('should handle all tab types correctly', () => {
    const tabIds: TabId[] = ['guild-hall', 'adventurers', 'quest-board', 'hiring-hall', 'treasury'];

    tabIds.forEach(tabId => {
      act(() => {
        useUIStore.setState({ activeTab: tabId });
      });

      const { unmount } = render(<NavigationTabs />);
      const selected = screen.getByRole('tab', { selected: true });
      expect(selected).toBeInTheDocument();
      unmount();
    });
  });
});

