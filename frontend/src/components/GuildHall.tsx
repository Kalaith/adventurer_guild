import React from 'react';

const GuildHall: React.FC = () => {
    return (
        <div className="guild-overview">
            <div className="guild-image">
                <img src="https://pplx-res.cloudinary.com/image/upload/v1751337951/pplx_project_search_images/c116f2633238f064f7b5f29e80faad842e2bf063.jpg" alt="Guild Hall Interior" className="guild-hall-image" />
            </div>
            <div className="guild-info">
                <h2>Welcome, Guild Master!</h2>
                <p>Manage your adventurers, assign quests, and grow your guild's reputation.</p>
                <div className="quick-stats">
                    <div className="stat-card">
                        <h3>Active Adventurers</h3>
                        <div className="stat-number" id="active-adventurers">1</div>
                    </div>
                    <div className="stat-card">
                        <h3>Active Quests</h3>
                        <div className="stat-number" id="active-quests">0</div>
                    </div>
                    <div className="stat-card">
                        <h3>Completed Quests</h3>
                        <div className="stat-number" id="completed-quests">0</div>
                    </div>
                </div>
                <div className="active-quest-panel">
                    <h3>🕐 Active Quests</h3>
                    <div id="active-quests-list" className="active-quests-container">
                        <p className="no-quests">No active quests</p>
                    </div>
                </div>
                <div className="activity-log">
                    <h3>📜 Recent Activity</h3>
                    <div id="activity-log" className="log-container">
                        <p>Welcome to your new guild! Start by hiring adventurers and taking on quests.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuildHall;
