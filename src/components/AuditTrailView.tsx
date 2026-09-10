import React from 'react';
import type { Approval } from '../types';
import { formatDateTime } from '../utils/format';

export const AuditTrailView: React.FC<{ approval: Approval }> = ({ approval }) => {
  const events = [...approval.audit].sort((a, b) => (a.date < b.date ? -1 : 1));
  return (
    <div>
      <p className="mb-3 text-xs text-slate">
        Complete history of who said what, when, to whom, what documents were involved, and what ultimately happened.
      </p>
      <ol className="relative ml-2 space-y-5 border-l border-line pl-5">
        {events.map((e) => (
          <li key={e.id} className="relative">
            <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-navy" />
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm font-semibold text-navy">{e.action}</span>
              <span className="text-xs text-slate/70">{formatDateTime(e.date)}</span>
            </div>
            <p className="text-xs text-slate">by {e.actor}</p>
            {e.detail && <p className="mt-0.5 text-xs text-navy/80">{e.detail}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
};
