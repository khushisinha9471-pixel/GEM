import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { ApprovalType, CustomerDecision } from '../types';
import { APPROVAL_TYPES, CUSTOMER_DECISIONS } from '../types';

export type DecisionFilter = 'All' | 'Awaiting Decision' | CustomerDecision;

export interface CustomerFilters {
  approvalType: 'All' | ApprovalType;
  decision: DecisionFilter;
  status: 'All' | 'Open' | 'Closed';
}

export const DEFAULT_CUSTOMER_FILTERS: CustomerFilters = { approvalType: 'All', decision: 'All', status: 'All' };

export const CustomerToolbar: React.FC<{
  search: string;
  onSearch: (v: string) => void;
  filters: CustomerFilters;
  onFilters: (f: CustomerFilters) => void;
}> = ({ search, onSearch, filters, onFilters }) => {
  const [open, setOpen] = React.useState(false);
  const popRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeFilterCount = [
    filters.approvalType !== 'All',
    filters.decision !== 'All',
    filters.status !== 'All',
  ].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <div className="flex w-64 items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 shadow-card">
        <Search size={16} className="text-slate" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search approvals..."
          className="w-full bg-transparent text-sm text-navy placeholder:text-slate/70 outline-none"
        />
        {search && (
          <button onClick={() => onSearch('')} className="text-slate hover:text-navy">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="relative" ref={popRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          title="Filters"
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 shadow-card ${
            activeFilterCount > 0 ? 'border-navy bg-navy-50 text-navy' : 'border-line bg-white text-slate hover:text-navy'
          }`}
        >
          <Filter size={16} />
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1 text-[11px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
        {open && (
          <div className="absolute right-0 top-11 z-40 w-80 rounded-xl border border-line bg-white p-4 shadow-pop">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-navy">Filters</span>
              <button className="text-xs font-medium text-slate hover:text-navy" onClick={() => onFilters(DEFAULT_CUSTOMER_FILTERS)}>
                Clear all
              </button>
            </div>

            <div className="mt-3">
              <label className="field-label">Type</label>
              <select
                value={filters.approvalType}
                onChange={(e) => onFilters({ ...filters, approvalType: e.target.value as CustomerFilters['approvalType'] })}
                className="select-input"
              >
                <option value="All">All Types</option>
                {APPROVAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3">
              <label className="field-label">Decision</label>
              <select
                value={filters.decision}
                onChange={(e) => onFilters({ ...filters, decision: e.target.value as CustomerFilters['decision'] })}
                className="select-input"
              >
                <option value="All">All Decisions</option>
                <option value="Awaiting Decision">Awaiting Decision</option>
                {CUSTOMER_DECISIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3">
              <label className="field-label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => onFilters({ ...filters, status: e.target.value as CustomerFilters['status'] })}
                className="select-input"
              >
                <option value="All">All</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
