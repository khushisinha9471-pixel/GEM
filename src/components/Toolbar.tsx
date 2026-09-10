import React from 'react';
import { Search, SlidersHorizontal, Plus, Send, X } from 'lucide-react';
import type { ApprovalType, Customer } from '../types';
import { SUBTYPES_BY_TYPE, APPROVAL_TYPES } from '../types';

export interface Filters {
  customerId: string; // 'all' or customer id
  status: 'All' | 'Open' | 'Closed';
  approvalType: 'All' | ApprovalType;
  subtype: string; // 'All' or specific subtype string
}

export const DEFAULT_FILTERS: Filters = { customerId: 'all', status: 'All', approvalType: 'All', subtype: 'All' };

export const Toolbar: React.FC<{
  search: string;
  onSearch: (v: string) => void;
  filters: Filters;
  onFilters: (f: Filters) => void;
  customers: Customer[];
  onCreate: () => void;
  onNotify: () => void;
}> = ({ search, onSearch, filters, onFilters, customers, onCreate, onNotify }) => {
  const [open, setOpen] = React.useState(false);
  const popRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const subtypeOptions = filters.approvalType === 'All' ? [] : SUBTYPES_BY_TYPE[filters.approvalType];
  const activeFilterCount = [
    filters.customerId !== 'all',
    filters.status !== 'All',
    filters.approvalType !== 'All',
    filters.subtype !== 'All',
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <div className="flex min-w-[240px] flex-1 max-w-md items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 shadow-card">
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
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-card ${
              activeFilterCount > 0 ? 'border-navy bg-navy-50 text-navy' : 'border-line bg-white text-slate hover:text-navy'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1 text-[11px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute left-0 top-11 z-40 w-80 rounded-xl border border-line bg-white p-4 shadow-pop">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-navy">Filters</span>
                <button
                  className="text-xs font-medium text-slate hover:text-navy"
                  onClick={() => onFilters(DEFAULT_FILTERS)}
                >
                  Clear all
                </button>
              </div>

              <FilterField label="Customer">
                <select
                  value={filters.customerId}
                  onChange={(e) => onFilters({ ...filters, customerId: e.target.value })}
                  className="select-input"
                >
                  <option value="all">All Customers</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
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

              <FilterField label="Approval Type">
                <select
                  value={filters.approvalType}
                  onChange={(e) =>
                    onFilters({ ...filters, approvalType: e.target.value as Filters['approvalType'], subtype: 'All' })
                  }
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

              <FilterField label="Subtype">
                <select
                  value={filters.subtype}
                  disabled={filters.approvalType === 'All' || subtypeOptions.length === 0}
                  onChange={(e) => onFilters({ ...filters, subtype: e.target.value })}
                  className="select-input disabled:cursor-not-allowed disabled:bg-surface/60 disabled:text-slate/60"
                >
                  <option value="All">
                    {filters.approvalType === 'All'
                      ? 'Select an Approval Type first'
                      : subtypeOptions.length === 0
                      ? 'No Subtype'
                      : `All ${filters.approvalType} Subtypes`}
                  </option>
                  {subtypeOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </FilterField>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNotify}
          className="flex items-center gap-2 rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-semibold text-navy shadow-card hover:bg-surface"
        >
          <Send size={15} />
          Notify Customer
        </button>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 rounded-lg bg-navy px-3.5 py-2 text-sm font-semibold text-white shadow-card hover:bg-navy-600"
        >
          <Plus size={15} />
          Create Approval
        </button>
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
