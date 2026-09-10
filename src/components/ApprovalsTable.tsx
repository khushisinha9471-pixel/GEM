import React from 'react';
import type { Approval } from '../types';
import { StatusPill } from './StatusPill';
import { ResponseCell } from './ResponseCell';
import { formatCost, itemPartLabel } from '../utils/format';
import { latestCsmResponse, latestCustomerResponse } from '../utils/approvalHelpers';
import { FileQuestion } from 'lucide-react';

export const ApprovalsTable: React.FC<{ approvals: Approval[]; onOpen: (a: Approval) => void }> = ({ approvals, onOpen }) => {
  if (approvals.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 py-20 text-center">
        <FileQuestion size={28} className="text-slate/50" />
        <p className="text-sm font-medium text-navy">No approvals match your filters</p>
        <p className="text-xs text-slate">Try adjusting search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[1080px] table-fixed border-collapse text-left">
        <colgroup>
          <col className="w-[48px]" />
          <col className="w-[168px]" />
          <col className="w-[122px]" />
          <col className="w-[140px]" />
          <col className="w-[202px]" />
          <col className="w-[80px]" />
          <col className="w-[264px]" />
          <col className="w-[264px]" />
          <col className="w-[86px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line bg-surface/50 text-[11px] font-semibold uppercase tracking-wide text-slate">
            <th className="px-3 py-3">S.No.</th>
            <th className="px-3 py-3">Type</th>
            <th className="px-3 py-3">Subtype</th>
            <th className="px-3 py-3">Item / Part</th>
            <th className="px-3 py-3">Requirement</th>
            <th className="px-3 py-3 text-right">Cost</th>
            <th className="px-3 py-3">CSM Response</th>
            <th className="px-3 py-3">Customer Response</th>
            <th className="px-3 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {approvals.map((a, idx) => (
            <tr
              key={a.id}
              onClick={() => onOpen(a)}
              className="cursor-pointer border-b border-line last:border-0 hover:bg-navy-50/40"
            >
              <td className="px-3 py-3 align-top text-sm text-slate">
                <div className="font-medium text-navy">{idx + 1}</div>
                <div className="mt-0.5 text-[11px] text-slate/80">{a.id}</div>
              </td>
              <td className="break-words px-3 py-3 align-top text-sm font-medium text-navy">{a.type}</td>
              <td className="break-words px-3 py-3 align-top text-sm text-slate">{a.subtype ?? '—'}</td>
              <td className="break-words px-3 py-3 align-top text-sm text-navy">{itemPartLabel(a)}</td>
              <td className="px-3 py-3 align-top text-sm text-slate">{a.requirement}</td>
              <td className="px-3 py-3 align-top text-right text-sm font-medium text-navy">{formatCost(a.cost)}</td>
              <td className="px-3 py-3 align-top">
                <ResponseCell message={latestCsmResponse(a)} emptyLabel="No CSM response yet" />
              </td>
              <td className="px-3 py-3 align-top">
                <ResponseCell message={latestCustomerResponse(a)} emptyLabel="Awaiting customer response" />
              </td>
              <td className="px-3 py-3 align-top">
                <StatusPill status={a.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
