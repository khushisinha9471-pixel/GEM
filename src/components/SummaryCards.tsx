import React from 'react';
import { formatCost } from '../utils/format';

export const SummaryCards: React.FC<{
  openCount: number;
  overdueCount: number;
  pendingValue: number;
  openActive: boolean;
  overdueActive: boolean;
  onToggleOpen: () => void;
  onToggleOverdue: () => void;
}> = ({ openCount, overdueCount, pendingValue, openActive, overdueActive, onToggleOpen, onToggleOverdue }) => {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={onToggleOpen}
        className={`min-w-[150px] rounded-xl border bg-white p-3 text-left shadow-card transition ${
          openActive ? 'border-amber-400 ring-2 ring-amber-200' : 'border-line hover:border-amber-300'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate">Open Approvals</span>
        </div>
        <div className="mt-1 text-xl font-bold text-navy">{openCount}</div>
      </button>
      <button
        onClick={onToggleOverdue}
        title="Approval has been open for more than 10 days"
        className={`min-w-[150px] rounded-xl border bg-white p-3 text-left shadow-card transition ${
          overdueActive ? 'border-red-400 ring-2 ring-red-200' : 'border-line hover:border-red-300'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate">Overdue Approvals</span>
        </div>
        <div className="mt-1 text-xl font-bold text-navy">{overdueCount}</div>
      </button>
      <div
        title="Total accumulated cost across all open approvals still awaiting a customer decision"
        className="min-w-[150px] rounded-xl border border-line bg-white p-3 shadow-card"
      >
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-navy" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate">Pending Approvals Value</span>
        </div>
        <div className="mt-1 text-xl font-bold text-navy">{formatCost(pendingValue)}</div>
      </div>
    </div>
  );
};
