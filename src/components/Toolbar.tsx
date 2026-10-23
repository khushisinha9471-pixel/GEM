import React from 'react';
import { Search, Filter, Plus, X } from 'lucide-react';
import type { ApprovalType, CustomerDecision } from '../types';
import { APPROVAL_TYPES, ALL_SUBTYPES, CUSTOMER_DECISIONS } from '../types';
import { WORK_ORDERS } from '../data/seed';
import { SortControl } from './SortControl';
import type { SortState } from '../utils/approvalHelpers';

export type DecisionFilter = 'All' | 'Awaiting Decision' | CustomerDecision;

export interface Filters {
  workOrderId: 'All' | string;
  approvalType: 'All' | ApprovalType;
  status: 'All' | 'Open' | 'Closed';
  subtype: 'All' | string;
  decision: DecisionFilter;
}

export const DEFAULT_FILTERS: Filters = {
  workOrderId: 'All',
  approvalType: 'All',
  status: 'All',
  subtype: 'All',
  decision: 'All',
};

export const Toolbar: React.FC<{
  search: string;
  onSearch: (v: string) => void;
  filters: Filters;
  onFilters: (f: Filters) => void;
  sort: SortState;
  onSort: (s: SortState) => void;
  onCreate: () => void;
}> = ({ search, onSearch, filters, onFilters, sort, onSort, onCreate }) => {
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
    filters.workOrderId !== 'All',
    filters.approvalType !== 'All',
    filters.status !== 'All',
    filters.subtype !== 'All',
    filters.decision !== 'All',
  ].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <button
        onClick={onCreate}
        className="flex items-center gap-2 rounded-lg bg-navy px-3.5 py-2 text-sm font-semibold text-white shadow-card hover:bg-navy-600"
      >
        <Plus size={15} />
        Create Approval
      </button>

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

      <SortControl sort={sort} onSort={onSort} />

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
              <button className="text-xs font-medium text-slate hover:text-navy" onClick={() => onFilters(DEFAULT_FILTERS)}>
                Clear all
              </button>
            </div>

            <FilterField label="Work Order">
              <select
                value={filters.workOrderId}
                onChange={(e) => onFilters({ ...filters, workOrderId: e.target.value })}
                className="select-input"
              >
                <option value="All">All Work Orders</option>
                {WORK_ORDERS.map((wo) => (
                  <option key={wo.id} value={wo.id}>
                    {wo.id} — {wo.engineModel}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Type">
              <select
                value={filters.approvalType}
                onChange={(e) => onFilters({ ...filters, approvalType: e.target.value as Filters['approvalType'] })}
                className="select-input"
              >
                <option value="All">All Types</option>
                {APPROVAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Status">
              <select
                value={filters.status}
                onChange={(e) => onFilters({ ...filters, status: e.target.value as Filters['status'] })}
                className="select-input"
              >
                <option value="All">All</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </FilterField>

            <FilterField label="Subtype">
              <select
                value={filters.subtype}
                onChange={(e) => onFilters({ ...filters, subtype: e.target.value })}
                className="select-input"
              >
                <option value="All">All Subtypes</option>
                {ALL_SUBTYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Decision">
              <select
                value={filters.decision}
                onChange={(e) => onFilters({ ...filters, decision: e.target.value as Filters['decision'] })}
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
            </FilterField>
          </div>
        )}
      </div>
    </div>
  );
};

const FilterField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mt-3">
    <label className="mb-1 block text-xs font-semibold text-slate">{label}</label>
    {children}
  </div>
);
