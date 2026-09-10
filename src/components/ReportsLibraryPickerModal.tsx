import React from 'react';
import { Search, X, FileText, Check } from 'lucide-react';
import { REPORTS_LIBRARY } from '../data/seed';
import type { ReportLibraryItem } from '../types';
import { formatDate } from '../utils/format';

export const ReportsLibraryPickerModal: React.FC<{
  alreadyLinkedIds: string[];
  onClose: () => void;
  onLink: (reports: ReportLibraryItem[]) => void;
}> = ({ alreadyLinkedIds, onClose, onLink }) => {
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('All');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [preview, setPreview] = React.useState<ReportLibraryItem | null>(null);

  const types = ['All', ...Array.from(new Set(REPORTS_LIBRARY.map((r) => r.type)))];

  const results = REPORTS_LIBRARY.filter((r) => !alreadyLinkedIds.includes(r.id))
    .filter((r) => typeFilter === 'All' || r.type === typeFilter)
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="modal-overlay-center">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-pop">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-navy">Link from Reports Library</h2>
            <p className="text-xs text-slate">Search and select one or more reports to link to this approval.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate hover:bg-surface hover:text-navy">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-line px-5 py-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-surface/50 px-3 py-2">
            <Search size={15} className="text-slate" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-slate/60"
            />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="select-input w-40">
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {results.length === 0 && <p className="px-3 py-6 text-center text-sm text-slate">No reports found.</p>}
            {results.map((r) => {
              const isSelected = selected.has(r.id);
              return (
                <div
                  key={r.id}
                  onClick={() => setPreview(r)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface/70 ${
                    preview?.id === r.id ? 'bg-navy-50' : ''
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(r.id);
                    }}
                    className={`flex h-5 w-5 flex-none items-center justify-center rounded border ${
                      isSelected ? 'border-navy bg-navy text-white' : 'border-line bg-white'
                    }`}
                  >
                    {isSelected && <Check size={13} />}
                  </button>
                  <FileText size={16} className="flex-none text-slate" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy">{r.name}</p>
                    <p className="text-xs text-slate">
                      {r.type} · {formatDate(r.date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {preview && (
            <div className="w-64 flex-none border-l border-line bg-surface/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Preview</p>
              <div className="mt-3 flex h-32 items-center justify-center rounded-lg border border-dashed border-line bg-white">
                <FileText size={28} className="text-slate/50" />
              </div>
              <p className="mt-3 text-sm font-semibold text-navy">{preview.name}</p>
              <p className="mt-1 text-xs text-slate">Type: {preview.type}</p>
              <p className="text-xs text-slate">Date: {formatDate(preview.date)}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3.5">
          <span className="text-xs font-medium text-slate">{selected.size} report(s) selected</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              disabled={selected.size === 0}
              onClick={() => onLink(REPORTS_LIBRARY.filter((r) => selected.has(r.id)))}
              className="btn-primary"
            >
              Link Selected Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
