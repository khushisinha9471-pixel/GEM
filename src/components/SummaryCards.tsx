import React from 'react';
import type { ApprovalStatus } from '../types';

export const SummaryCards: React.FC<{
  openCount: number;
  closedCount: number;
  activeFilter: ApprovalStatus | 'All';
  onSelect: (status: ApprovalStatus | 'All') => void;
}> = ({ openCount, closedCount, activeFilter, onSelect }) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:max-w-md">
      <button
        onClick={() => onSelect(activeFilter === 'Open' ? 'All' : 'Open')}
        className={`rounded-2xl border bg-white p-4 text-left shadow-card transition ${
          activeFilter === 'Open' ? 'border-amber-400 ring-2 ring-amber-200' : 'border-line hover:border-amber-300'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-slate">Open</span>
        </div>
        <div className="mt-2 text-3xl font-bold text-navy">{openCount}</div>
      </button>
      <button
        onClick={() => onSelect(activeFilter === 'Closed' ? 'All' : 'Closed')}
        className={`rounded-2xl border bg-white p-4 text-left shadow-card transition ${
          activeFilter === 'Closed' ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-line hover:border-emerald-300'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-slate">Closed</span>
        </div>
        <div className="mt-2 text-3xl font-bold text-navy">{closedCount}</div>
      </button>
    </div>
  );
};
