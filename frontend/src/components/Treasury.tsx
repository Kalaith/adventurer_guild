import React from 'react';

const Treasury: React.FC = () => {
    return (
        <div>
            <h2>💰 Treasury & Statistics</h2>
            <div className="treasury-grid">
                <div className="card treasury-overview">
                    <div className="card__body">
                        <h3>Financial Overview</h3>
                        <div className="financial-stats">
                            <div className="financial-item">
                                <span>Current Gold:</span>
                                <span id="treasury-gold">1000</span>
                            </div>
                            <div className="financial-item">
                                <span>Total Earned:</span>
                                <span id="total-earned">0</span>
                            </div>
                            <div className="financial-item">
                                <span>Total Spent:</span>
                                <span id="total-spent">0</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card guild-progress">
                    <div className="card__body">
                        <h3>Guild Progress</h3>
                        <div className="progress-stats">
                            <div className="progress-item">
                                <span>Guild Level:</span>
                                <span id="treasury-guild-level">1</span>
                            </div>
                            <div className="progress-item">
                                <span>Reputation:</span>
                                <span id="treasury-reputation">0</span>
                            </div>
                            <div className="progress-item">
                                <span>Quest Success Rate:</span>
                                <span id="success-rate">0%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card achievements">
                    <div className="card__body">
                        <h3>Achievements</h3>
                        <div id="achievements-list" className="achievements-container">
                            <div className="achievement locked">
                                <span>🏆 First Quest - Complete your first quest</span>
                            </div>
                            <div className="achievement locked">
                                <span>💼 Growing Business - Hire 5 adventurers</span>
                            </div>
                            <div className="achievement locked">
                                <span>🌟 Legendary Guild - Reach guild level 5</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Treasury;
