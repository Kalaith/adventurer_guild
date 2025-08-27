import React from 'react';

interface NavigationTabsProps {
  setActiveTab: (tab: string) => void;
  activeTab: string;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ setActiveTab, activeTab }) => {
  return (
    <nav className="tab-navigation">
      <button className={`tab-btn ${activeTab === 'guild-hall' ? 'active' : ''}`} onClick={() => setActiveTab('guild-hall')}>🏰 Guild Hall</button>
      <button className={`tab-btn ${activeTab === 'adventurers' ? 'active' : ''}`} onClick={() => setActiveTab('adventurers')}>⚔️ Adventurers</button>
      <button className={`tab-btn ${activeTab === 'quest-board' ? 'active' : ''}`} onClick={() => setActiveTab('quest-board')}>📋 Quest Board</button>
      <button className={`tab-btn ${activeTab === 'hiring-hall' ? 'active' : ''}`} onClick={() => setActiveTab('hiring-hall')}>👥 Hiring Hall</button>
      <button className={`tab-btn ${activeTab === 'treasury' ? 'active' : ''}`} onClick={() => setActiveTab('treasury')}>💰 Treasury</button>
    </nav>
  );
};

export default NavigationTabs;
