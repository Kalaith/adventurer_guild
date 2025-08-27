import React, { useEffect, useState } from 'react';
import { fetchAdventurers } from '../api/mockApi';

interface Adventurer {
    id: number;
    name: string;
    level: number;
    status: string;
}

const Adventurers: React.FC = () => {
    const [adventurers, setAdventurers] = useState<Adventurer[]>([]);

    useEffect(() => {
        fetchAdventurers().then((data) => setAdventurers(data));
    }, []);

    return (
        <div>
            <h2>⚔️ Your Adventurers</h2>
            <div className="adventurer-grid" id="adventurer-grid">
                {adventurers.map((adventurer) => (
                    <div key={adventurer.id} className="adventurer-card">
                        <h3>{adventurer.name}</h3>
                        <p>Level: {adventurer.level}</p>
                        <p>Status: {adventurer.status}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Adventurers;
