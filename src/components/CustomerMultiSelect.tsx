import React from 'react';
import { Check } from 'lucide-react';
import type { Customer } from '../types';

export const CustomerMultiSelect: React.FC<{
  customers: Customer[];
  selected: string[];
  onChange: (ids: string[]) => void;
}> = ({ customers, selected, onChange }) => {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }
  return (
    <div className="rounded-lg border border-line divide-y divide-line">
      {customers.map((c) => {
        const checked = selected.includes(c.id);
        return (
          <button
            type="button"
            key={c.id}
            onClick={() => toggle(c.id)}
            className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-left hover:bg-surface/60"
          >
            <span
              className={`flex h-[18px] w-[18px] flex-none items-center justify-center rounded border ${
                checked ? 'border-navy bg-navy text-white' : 'border-line bg-white'
              }`}
            >
              {checked && <Check size={12} />}
            </span>
            <span className="text-sm text-navy">{c.name}</span>
          </button>
        );
      })}
    </div>
  );
};
