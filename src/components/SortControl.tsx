import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { DEFAULT_SORT, type SortBy, type SortDir, type SortState } from '../utils/approvalHelpers';

const SORT_FIELDS: { by: Exclude<SortBy, 'none'>; label: string }[] = [
  { by: 'createdOn', label: 'Created On' },
  { by: 'cost', label: 'Cost' },
];

const SORT_DIRS: { dir: SortDir; label: string }[] = [
  { dir: 'asc', label: 'Ascending' },
  { dir: 'desc', label: 'Descending' },
];

const Bullet: React.FC<{ selected: boolean }> = ({ selected }) => (
  <span className={`h-2 w-2 shrink-0 rounded-full border ${selected ? 'border-navy bg-navy' : 'border-line bg-white'}`} />
);

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
        <div className="absolute right-0 top-11 z-40 w-52 rounded-xl border border-line bg-white p-2 shadow-pop">
          <div className="flex items-center justify-between px-1 pb-1 pt-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate">Sort By</span>
            <button className="text-xs font-medium text-slate hover:text-navy" onClick={() => onSort(DEFAULT_SORT)}>
              Reset
            </button>
          </div>
          {SORT_FIELDS.map((f) => {
            const selected = sort.by === f.by;
            return (
              <button
                key={f.by}
                onClick={() => onSort({ by: f.by, dir: sort.by === 'none' ? 'asc' : sort.dir })}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-surface"
              >
                <Bullet selected={selected} />
                <span className={selected ? 'font-semibold text-navy' : 'text-slate'}>{f.label}</span>
              </button>
            );
          })}

          <div className="my-2 border-t border-line" />

          {SORT_DIRS.map((d) => {
            const selected = active && sort.dir === d.dir;
            return (
              <button
                key={d.dir}
                onClick={() => onSort({ by: sort.by === 'none' ? 'createdOn' : sort.by, dir: d.dir })}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-surface"
              >
                <Bullet selected={selected} />
                <span className={selected ? 'font-semibold text-navy' : 'text-slate'}>{d.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
