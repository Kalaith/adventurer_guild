import React from 'react';

const Modal: React.FC = () => {
    return (
        <div className="modal" id="quest-modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 id="quest-modal-title">Assign Adventurers</h3>
                    <button className="close-btn" id="close-quest-modal">&times;</button>
                </div>
                <div className="modal-body">
                    <div className="quest-details" id="quest-modal-details">
                        {/* Quest details will be populated dynamically */}
                    </div>
                    <div className="adventurer-selection">
                        <h4>Select Adventurers:</h4>
                        <div id="available-adventurers" className="adventurer-selection-grid">
                            {/* Available adventurers will be populated dynamically */}
                        </div>
                    </div>
                    <div className="quest-success-info">
                        <p>Success Probability: <span id="success-probability">0%</span></p>
                        <button className="btn btn--primary" id="start-quest-btn" disabled>Start Quest</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
