import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { DEFAULT_SORT, type SortBy, type SortDir, type SortState } from '../utils/approvalHelpers';

const SORT_OPTIONS: { by: Exclude<SortBy, 'none'>; dir: SortDir; label: string }[] = [
  { by: 'createdOn', dir: 'asc', label: 'Created On — Oldest first' },
  { by: 'createdOn', dir: 'desc', label: 'Created On — Newest first' },
  { by: 'cost', dir: 'asc', label: 'Cost — Low to High' },
  { by: 'cost', dir: 'desc', label: 'Cost — High to Low' },
];

export const SortControl: React.FC<{
  sort: SortState;
  onSort: (s: SortState) => void;
}> = ({ sort, onSort }) => {
  const [open, setOpen] = React.useState(false);
  const popRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const active = sort.by !== 'none';

  return (
    <div className="relative" ref={popRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Sort"
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 shadow-card ${
          active ? 'border-navy bg-navy-50 text-navy' : 'border-line bg-white text-slate hover:text-navy'
        }`}
      >
        <ArrowUpDown size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-40 w-56 rounded-xl border border-line bg-white p-2 shadow-pop">
          <div className="flex items-center justify-between px-1 pb-1 pt-1">
            <span className="text-sm font-semibold text-navy">Sort</span>
            <button className="text-xs font-medium text-slate hover:text-navy" onClick={() => onSort(DEFAULT_SORT)}>
              Reset
            </button>
          </div>
          {SORT_OPTIONS.map((opt) => {
            const selected = sort.by === opt.by && sort.dir === opt.dir;
            return (
              <button
                key={`${opt.by}-${opt.dir}`}
                onClick={() => onSort({ by: opt.by, dir: opt.dir })}
                className={`block w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-surface ${
                  selected ? 'font-semibold text-navy' : 'text-slate'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
