import React from 'react';

export const SummaryCards: React.FC<{
  openCount: number;
  overdueCount: number;
  openActive: boolean;
  overdueActive: boolean;
  onToggleOpen: () => void;
  onToggleOverdue: () => void;
}> = ({ openCount, overdueCount, openActive, overdueActive, onToggleOpen, onToggleOverdue }) => {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={onToggleOpen}
        className={`flex min-w-[150px] flex-col items-stretch justify-start rounded-xl border bg-white p-3 text-left shadow-card transition ${
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
        className={`flex min-w-[150px] flex-col items-stretch justify-start rounded-xl border bg-white p-3 text-left shadow-card transition ${
          overdueActive ? 'border-red-400 ring-2 ring-red-200' : 'border-line hover:border-red-300'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate">Overdue Approvals</span>
        </div>
        <div className="mt-1 text-xl font-bold text-navy">{overdueCount}</div>
        <div className="mt-0.5 text-[9px] font-medium leading-tight text-slate/70">Open for more than 3 days</div>
      </button>
    </div>
  );
};
