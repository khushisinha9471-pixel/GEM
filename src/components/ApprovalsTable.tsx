import React from 'react';
import type { Approval, CustomerDecision } from '../types';
import { StatusPill } from './StatusPill';
import { formatCost, formatDateTime, truncate } from '../utils/format';
import { latestCsmResponse, latestCustomerResponse } from '../utils/approvalHelpers';
import { ChevronDown, ChevronUp, FileQuestion, Paperclip, Mail } from 'lucide-react';

const DECISION_STYLES: Record<CustomerDecision, string> = {
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
  'Clarification Requested': 'bg-amber-50 text-amber-700 border-amber-200',
  'Negotiation Requested': 'bg-amber-50 text-amber-700 border-amber-200',
};

export const ApprovalsTable: React.FC<{
  approvals: Approval[];
  role: 'csm' | 'customer';
  onOpenConversation: (approval: Approval) => void;
  onReopen?: (approval: Approval) => void;
  onRequestClose?: (approval: Approval) => void;
  customerColumnLabel?: string;
}> = ({ approvals, role, onOpenConversation, onReopen, onRequestClose, customerColumnLabel = 'Customer Comment' }) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [statusOpenId, setStatusOpenId] = React.useState<string | null>(null);
  const statusRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpenId(null);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
          <col className="w-[40px]" />
          <col className="w-[96px]" />
          <col className="w-[104px]" />
          <col className="w-[96px]" />
          <col className="w-[124px]" />
          <col className="w-[280px]" />
          <col className="w-[74px]" />
          <col className="w-[210px]" />
          <col className="w-[116px]" />
          <col className="w-[210px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line bg-surface/50 text-[11px] font-semibold uppercase tracking-wide text-slate">
            <th className="px-2 py-3">S.No.</th>
            <th className="px-2 py-3">Status</th>
            <th className="px-3 py-3">Type</th>
            <th className="px-3 py-3">Subtype</th>
            <th className="px-3 py-3">Part</th>
            <th className="px-3 py-3">Requirement</th>
            <th className="px-3 py-3 text-right">Cost</th>
            <th className="px-3 py-3">GEM Response</th>
            <th className="px-3 py-3">Approval Requested</th>
            <th className="px-3 py-3">{customerColumnLabel}</th>
          </tr>
        </thead>
        <tbody>
          {approvals.map((a, idx) => {
            const isExpanded = expanded.has(a.id);
            const gemMsg = latestCsmResponse(a);
            const customerMsg = latestCustomerResponse(a);
            const gemClickable = role === 'csm';
            const customerColClickable = role === 'customer';
            const approvalReqClickable = role === 'customer' && !a.customerDecision;

            return (
              <tr key={a.id} className="border-b border-line last:border-0">
                <td className="px-2 py-3 align-top text-xs text-slate">{idx + 1}</td>

                <td className="relative px-2 py-3 align-top">
                  {role === 'csm' ? (
                    <div ref={statusOpenId === a.id ? statusRef : undefined} className="relative">
                      <button
                        onClick={() => setStatusOpenId((cur) => (cur === a.id ? null : a.id))}
                        className="inline-flex items-center gap-1"
                        title="Change status"
                      >
                        <StatusPill status={a.status} />
                        <ChevronDown size={12} className="text-slate" />
                      </button>
                      {statusOpenId === a.id && (
                        <div className="absolute left-0 top-8 z-30 w-36 overflow-hidden rounded-lg border border-line bg-white shadow-pop">
                          <button
                            onClick={() => {
                              setStatusOpenId(null);
                              if (a.status !== 'Open') onReopen?.(a);
                            }}
                            className={`block w-full px-3 py-2 text-left text-xs hover:bg-surface ${
                              a.status === 'Open' ? 'font-semibold text-navy' : 'text-slate'
                            }`}
                          >
                            Open
                          </button>
                          <button
                            onClick={() => {
                              setStatusOpenId(null);
                              if (a.status !== 'Closed') onRequestClose?.(a);
                            }}
                            className={`block w-full px-3 py-2 text-left text-xs hover:bg-surface ${
                              a.status === 'Closed' ? 'font-semibold text-navy' : 'text-slate'
                            }`}
                          >
                            Closed
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <StatusPill status={a.status} />
                  )}
                </td>

                <td className="break-words px-3 py-3 align-top text-sm font-medium text-navy">{a.type}</td>
                <td className="break-words px-3 py-3 align-top text-sm text-slate">{a.subtype ?? '—'}</td>
                <td className="break-words px-3 py-3 align-top text-sm text-navy">
                  {a.partNumber && a.partDescription
                    ? `PN ${a.partNumber} — ${a.partDescription}`
                    : a.partDescription ?? a.engineeringItem ?? '—'}
                </td>

                <td
                  onClick={() => toggleExpanded(a.id)}
                  className="cursor-pointer px-3 py-3 align-top text-sm text-slate hover:bg-navy-50/30"
                  title={isExpanded ? 'Click to collapse' : 'Click to expand'}
                >
                  <div className="flex items-start gap-1.5">
                    <p className={isExpanded ? '' : 'line-clamp-2'}>{a.requirement}</p>
                    {a.requirement.length > 110 &&
                      (isExpanded ? (
                        <ChevronUp size={13} className="mt-0.5 flex-none text-slate/60" />
                      ) : (
                        <ChevronDown size={13} className="mt-0.5 flex-none text-slate/60" />
                      ))}
                  </div>
                </td>

                <td className="px-3 py-3 align-top text-right text-sm font-medium text-navy">{formatCost(a.cost)}</td>

                <td
                  onClick={gemClickable ? () => onOpenConversation(a) : undefined}
                  className={`px-3 py-3 align-top ${gemClickable ? 'cursor-pointer hover:bg-navy-50/30' : ''} ${
                    gemClickable && !gemMsg ? 'bg-amber-50/60' : ''
                  }`}
                >
                  {gemMsg ? (
                    <MessagePreview message={gemMsg} />
                  ) : gemClickable ? (
                    <span className="text-sm font-medium text-amber-700">Click to add comment</span>
                  ) : (
                    <span className="text-sm italic text-slate/60">No response yet</span>
                  )}
                </td>

                <td
                  onClick={approvalReqClickable ? () => onOpenConversation(a) : undefined}
                  className={`px-3 py-3 align-top ${approvalReqClickable ? 'cursor-pointer' : ''}`}
                >
                  {a.customerDecision ? (
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${DECISION_STYLES[a.customerDecision]}`}
                    >
                      {a.customerDecision}
                    </span>
                  ) : role === 'customer' ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100">
                      Response Needed
                    </span>
                  ) : (
                    <span className="text-xs italic text-slate/60">Awaiting decision</span>
                  )}
                </td>

                <td
                  onClick={customerColClickable ? () => onOpenConversation(a) : undefined}
                  className={`px-3 py-3 align-top ${customerColClickable ? 'cursor-pointer hover:bg-navy-50/30' : ''} ${
                    customerColClickable && !customerMsg ? 'bg-amber-50/60' : ''
                  }`}
                >
                  {customerMsg ? (
                    <MessagePreview message={customerMsg} />
                  ) : customerColClickable ? (
                    <span className="text-sm font-medium text-amber-700">Click to add comment</span>
                  ) : (
                    <span className="text-sm italic text-slate/60">Awaiting customer response</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const MessagePreview: React.FC<{ message: NonNullable<ReturnType<typeof latestCsmResponse>> }> = ({ message }) => (
  <div className="min-w-0">
    <p className="line-clamp-2 text-sm leading-snug text-navy" title={message.body}>
      {truncate(message.body, 140)}
    </p>
    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate">
      <span className="font-medium">{formatDateTime(message.date)}</span>
      {message.capturedFromEmail && (
        <span className="inline-flex items-center gap-0.5 text-navy/70" title="Captured automatically from email">
          <Mail size={11} />
        </span>
      )}
      {message.attachments.length > 0 && (
        <span className="inline-flex items-center gap-0.5 text-slate">
          <Paperclip size={11} />
          {message.attachments.length}
        </span>
      )}
    </div>
  </div>
);
