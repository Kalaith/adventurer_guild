import React from 'react';
import { useUIStore, type TabId } from '../stores/uiStore';

interface TabSpec {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: TabSpec[] = [
  { id: 'guild-hall', label: 'Guild Hall', icon: '🏰' },
  { id: 'adventurers', label: 'Adventurers', icon: '⚔️' },
  { id: 'quest-board', label: 'Quest Board', icon: '📋' },
  { id: 'hiring-hall', label: 'Hiring Hall', icon: '👥' },
  { id: 'treasury', label: 'Treasury', icon: '💰' },
];

const NavigationTabs: React.FC = () => {
  const activeTab = useUIStore(s => s.activeTab);
  const setActiveTab = useUIStore(s => s.setActiveTab);

  return (
    <nav className="tab-navigation" role="tablist" aria-label="Primary navigation">
      {TABS.map(tab => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab(tab.id);
              }
            }}
          >
            <span aria-hidden="true">{tab.icon}</span> <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default NavigationTabs;
