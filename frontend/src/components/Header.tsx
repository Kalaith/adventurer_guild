import React, { useEffect, useState } from 'react';
import { fetchGuildStats } from '../api/mockApi';

const Header: React.FC = () => {
    const [guildStats, setGuildStats] = useState({ gold: 0, reputation: 0, guildLevel: 0 });

    useEffect(() => {
        fetchGuildStats().then((data) => setGuildStats(data));
    }, []);

    return (
        <header className="game-header">
            <h1>⚔️ Adventurer Guild Manager</h1>
            <div className="guild-stats">
                <div className="stat-item">
                    <span className="stat-label">Gold:</span>
                    <span className="stat-value" id="gold-display">{guildStats.gold}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Reputation:</span>
                    <span className="stat-value" id="reputation-display">{guildStats.reputation}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Guild Level:</span>
                    <span className="stat-value" id="guild-level-display">{guildStats.guildLevel}</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
