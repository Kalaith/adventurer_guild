import React, { useMemo } from 'react';
import { useGuildStore } from '../stores/gameStore';

const Treasury: React.FC = () => {
  const { gold, reputation, level, formatNumber } = useGuildStore();

  const goldDisplay = useMemo(() => formatNumber(gold), [formatNumber, gold]);
  const reputationDisplay = useMemo(() => formatNumber(reputation), [formatNumber, reputation]);

  return (
    <section role="region" aria-label="Treasury" className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Treasury</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Gold</span>
            <span aria-hidden="true">💰</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{goldDisplay}</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Reputation</span>
            <span aria-hidden="true">⭐</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{reputationDisplay}</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Guild Level</span>
            <span aria-hidden="true">🏰</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{`Level ${level}`}</div>
        </div>
      </div>
    </section>
  );
};

export default Treasury;

