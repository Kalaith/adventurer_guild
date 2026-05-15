import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGuildStore } from '../stores/gameStore';

const Header: React.FC = () => {
  const { gold, reputation, level } = useGuildStore();
  const { user, isAuthenticated, loginWithRedirect, getLinkAccountUrl, logout } = useAuth();
  const accountName = user?.display_name || user?.username || user?.email || 'Unknown';

  return (
    <header className="game-header">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1>Adventurer Guild Manager</h1>
          <p className="text-sm text-amber-900/80">
            {user?.is_guest ? 'Guest run' : 'Guild account'}: {accountName}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isAuthenticated && user?.is_guest ? (
            <a
              href={getLinkAccountUrl()}
              className="rounded-md border border-amber-800 px-3 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-200"
            >
              Link Account
            </a>
          ) : null}
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={loginWithRedirect}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-amber-50 transition hover:bg-slate-700"
            >
              Sign In
            </button>
          ) : user?.is_guest ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-amber-50 transition hover:bg-slate-700"
            >
              Exit Guest
            </button>
          ) : (
            <span className="rounded-md border border-emerald-700 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
              Authenticated
            </span>
          )}
        </div>
      </div>

      <div className="guild-stats">
        <div className="stat-item">
          <span className="stat-label">Gold:</span>
          <span className="stat-value" id="gold-display">
            {gold}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Reputation:</span>
          <span className="stat-value" id="reputation-display">
            {reputation}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Guild Level:</span>
          <span className="stat-value" id="guild-level-display">
            {level}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
