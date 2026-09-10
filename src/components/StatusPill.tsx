import React from 'react';

export const StatusPill: React.FC<{ status: 'Open' | 'Closed' }> = ({ status }) => {
  const styles =
    status === 'Open'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'Open' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      {status}
    </span>
  );
};

export const OutcomeBadge: React.FC<{ outcome: string }> = ({ outcome }) => {
  const negative = outcome === 'Refused / Not Approved';
  const styles = negative ? 'bg-red-50 text-red-700 border-red-200' : 'bg-navy-50 text-navy border-navy-100';
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles}`}>{outcome}</span>;
};
