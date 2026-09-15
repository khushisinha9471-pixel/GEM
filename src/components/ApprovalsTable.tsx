import React from 'react';
import type { Approval, ApprovalType, CustomerDecision } from '../types';
import { APPROVAL_TYPES, CUSTOMER_DECISIONS, CUSTOMER_DECISION_LABELS } from '../types';
import { StatusPill } from './StatusPill';
import { formatCost, formatDate, formatDateTime } from '../utils/format';
import { approvalRequestUpdatedAt, latestCsmResponse, latestCustomerResponse } from '../utils/approvalHelpers';
import { ChevronDown, Maximize2, Minimize2, FileQuestion, Paperclip, Mail, MessageSquare } from 'lucide-react';

const DECISION_STYLES: Record<CustomerDecision, string> = {
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
  'Clarification Requested': 'bg-slate-100 text-slate-700 border-slate-300',
};

const DecisionPill: React.FC<{ decision: CustomerDecision }> = ({ decision }) => (
  <span
    className={`flex h-[34px] w-full items-center justify-center rounded-full border px-2 text-center text-[10px] font-semibold leading-tight ${DECISION_STYLES[decision]}`}
  >
    {decision}
  </span>
);

export const ApprovalsTable: React.FC<{
  approvals: Approval[];
  role: 'csm' | 'customer';
  onOpenConversation: (approval: Approval, draftDecision?: CustomerDecision) => void;
  onReopen?: (approval: Approval) => void;
  onRequestClose?: (approval: Approval) => void;
  onQuickDecision?: (approval: Approval, decision: CustomerDecision) => void;
  customerColumnLabel?: string;
}> = ({
  approvals,
  role,
  onOpenConversation,
  onReopen,
  onRequestClose,
  onQuickDecision,
  customerColumnLabel = 'Customer Comment',
}) => {
  const [statusOpenId, setStatusOpenId] = React.useState<string | null>(null);
  const statusRef = React.useRef<HTMLDivElement>(null);
  const [decisionOpenId, setDecisionOpenId] = React.useState<string | null>(null);
  const [pendingDecision, setPendingDecision] = React.useState<CustomerDecision | null>(null);
  const decisionRef = React.useRef<HTMLDivElement>(null);
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<ApprovalType>>(new Set());

  function toggleGroupCollapsed(t: ApprovalType) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpenId(null);
      if (decisionRef.current && !decisionRef.current.contains(e.target as Node)) setDecisionOpenId(null);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function toggleDecisionOpen(a: Approval) {
    const next = decisionOpenId === a.id ? null : a.id;
    setDecisionOpenId(next);
    setPendingDecision(next ? a.customerDecision ?? null : null);
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

  const groups = APPROVAL_TYPES.map((t) => ({
    type: t,
    rows: approvals.map((a, idx) => ({ a, idx })).filter(({ a }) => a.type === t),
  })).filter((g) => g.rows.length > 0);

  function renderRow(a: Approval, idx: number) {
    const gemMsg = latestCsmResponse(a);
            const customerMsg = latestCustomerResponse(a);
            const gemClickable = role === 'csm';
            const customerColClickable = role === 'customer';
            const approvalReqClickable = role === 'customer';

            return (
              <tr key={a.id} className="border-b border-line last:border-0">
                <td className="px-2 py-3 align-top text-right text-xs text-slate">{idx + 1}</td>

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

                <td className="break-words px-3 py-3 align-top text-sm text-slate">{a.subtype ?? '—'}</td>
                <td className="break-words px-3 py-3 align-top text-sm text-navy">
                  {a.partNumber && a.partDescription
                    ? `PN ${a.partNumber} — ${a.partDescription}`
                    : a.partDescription ?? a.engineeringItem ?? '—'}
                </td>

                <td className="px-3 py-3 align-top text-sm text-slate">
                  <ExpandableText text={a.requirement} className="text-sm text-slate" mode="inline" />
                </td>

                <td className="px-3 py-3 align-top text-right text-sm font-medium text-navy">{formatCost(a.cost)}</td>

                <td className="relative px-3 py-3 align-top">
                  {approvalReqClickable ? (
                    <div ref={decisionOpenId === a.id ? decisionRef : undefined} className="relative">
                      <button onClick={() => toggleDecisionOpen(a)} className="relative block w-full pr-4 text-left">
                        {a.customerDecision ? (
                          <DecisionPill decision={a.customerDecision} />
                        ) : (
                          <span className="text-sm font-medium text-amber-700">Click to respond</span>
                        )}
                        <ChevronDown size={12} className="absolute right-0 top-1 text-slate" />
                      </button>
                      <div className="mt-1 text-[11px] font-medium text-slate">{formatDate(approvalRequestUpdatedAt(a))}</div>

                      {decisionOpenId === a.id && (
                        <div className="absolute left-0 top-full z-30 mt-1 w-48 rounded-lg border border-line bg-white p-2 shadow-pop">
                          <div className="space-y-1">
                            {CUSTOMER_DECISIONS.map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setPendingDecision(d)}
                                className={`block w-full rounded-md border px-2.5 py-1.5 text-left text-xs font-semibold transition ${
                                  pendingDecision === d ? DECISION_STYLES[d] : 'border-line text-slate hover:bg-surface'
                                }`}
                              >
                                {CUSTOMER_DECISION_LABELS[d]}
                              </button>
                            ))}
                          </div>
                          <div className="mt-2 flex items-center gap-1.5 border-t border-line pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setDecisionOpenId(null);
                                onOpenConversation(a, pendingDecision ?? undefined);
                              }}
                              className="flex-1 rounded-md border border-line px-2 py-1.5 text-[11px] font-semibold text-slate hover:bg-surface"
                            >
                              Add Comment
                            </button>
                            <button
                              type="button"
                              disabled={!pendingDecision}
                              onClick={() => {
                                if (!pendingDecision) return;
                                onQuickDecision?.(a, pendingDecision);
                                setDecisionOpenId(null);
                              }}
                              className="flex-1 rounded-md bg-navy px-2 py-1.5 text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {a.customerDecision ? (
                        <DecisionPill decision={a.customerDecision} />
                      ) : (
                        <span className="text-xs italic text-slate/60">Awaiting decision</span>
                      )}
                      <div className="mt-1 text-[11px] font-medium text-slate">{formatDate(approvalRequestUpdatedAt(a))}</div>
                    </div>
                  )}
                </td>

                <td
                  onClick={customerColClickable ? () => onOpenConversation(a) : undefined}
                  className={`px-3 py-3 align-top ${customerColClickable ? 'cursor-pointer hover:bg-navy-50/30' : ''}`}
                >
                  {customerMsg ? (
                    <MessagePreview message={customerMsg} openable={customerColClickable} />
                  ) : customerColClickable ? (
                    <span className="inline-flex items-center gap-1.5 text-sm italic text-slate/60">
                      <MessageSquare size={13} className="text-slate/40" />
                      No comment
                    </span>
                  ) : (
                    <span className="text-sm italic text-slate/60">No comment</span>
                  )}
                </td>

                <td
                  onClick={gemClickable ? () => onOpenConversation(a) : undefined}
                  className={`px-3 py-3 align-top ${gemClickable ? 'cursor-pointer hover:bg-navy-50/30' : ''} ${
                    gemClickable && !gemMsg ? 'bg-amber-50/60' : ''
                  }`}
                >
                  {gemMsg ? (
                    <MessagePreview message={gemMsg} openable={gemClickable} />
                  ) : gemClickable ? (
                    <span className="text-sm font-medium text-amber-700">Click to add comment</span>
                  ) : (
                    <span className="text-sm italic text-slate/60">No response yet</span>
                  )}
                </td>
              </tr>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[1080px] table-fixed border-collapse text-left">
        <colgroup>
          <col className="w-[40px]" />
          <col className="w-[96px]" />
          <col className="w-[150px]" />
          <col className="w-[148px]" />
          <col className="w-[336px]" />
          <col className="w-[74px]" />
          <col className="w-[116px]" />
          <col className="w-[210px]" />
          <col className="w-[210px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line bg-surface/50 text-[11px] font-semibold uppercase tracking-wide text-slate">
            <th className="px-2 py-3 text-right">S.No.</th>
            <th className="px-2 py-3">Status</th>
            <th className="px-3 py-3">Subtype</th>
            <th className="px-3 py-3">Part</th>
            <th className="px-3 py-3">Requirement</th>
            <th className="px-3 py-3 text-right">Cost</th>
            <th className="px-3 py-3">Decision</th>
            <th className="px-3 py-3">{customerColumnLabel}</th>
            <th className="px-3 py-3">GEM Comment</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <React.Fragment key={g.type}>
              <tr className="border-b border-line bg-surface/70">
                <td colSpan={9} className="px-3 py-2">
                  <button
                    onClick={() => toggleGroupCollapsed(g.type)}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-navy"
                  >
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${collapsedGroups.has(g.type) ? '-rotate-90' : ''}`}
                    />
                    {g.type}
                    <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy">
                      {g.rows.length}
                    </span>
                  </button>
                </td>
              </tr>
              {!collapsedGroups.has(g.type) && g.rows.map(({ a, idx }) => renderRow(a, idx))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ExpandableText: React.FC<{ text: string; className?: string; mode?: 'popover' | 'inline' }> = ({
  text,
  className = 'text-sm text-slate',
  mode = 'popover',
}) => {
  const [open, setOpen] = React.useState(false);
  const [overflowing, setOverflowing] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLParagraphElement>(null);

  const measure = React.useCallback(() => {
    const el = textRef.current;
    if (el) setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, []);

  React.useLayoutEffect(() => {
    measure();
  }, [text, measure]);

  React.useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  React.useEffect(() => {
    if (mode !== 'popover' || !open) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, mode]);

  if (mode === 'inline') {
    return (
      <div
        ref={containerRef}
        onClick={() => overflowing && setOpen((v) => !v)}
        className={`relative ${overflowing ? 'cursor-pointer pr-4' : ''}`}
      >
        <p ref={textRef} className={`${open ? '' : 'line-clamp-2'} ${className}`}>
          {text}
        </p>
        {overflowing && (
          <span title={open ? 'Click to collapse' : 'Click to view full text'} className="absolute -top-0.5 right-0 rounded p-0.5 text-slate/40">
            {open ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
          </span>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${overflowing ? 'pr-4' : ''}`}>
      <p ref={textRef} className={`line-clamp-2 ${className}`}>{text}</p>
      {overflowing && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            title="Click to view full text"
            className="absolute -top-0.5 right-0 rounded p-0.5 text-slate/40 transition hover:bg-white hover:text-navy"
          >
            <Maximize2 size={11} />
          </button>
          {open && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-5 z-40 w-72 max-w-[80vw] rounded-lg border border-line bg-white p-3 text-sm leading-snug text-navy shadow-pop"
            >
              {text}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const MessagePreview: React.FC<{ message: NonNullable<ReturnType<typeof latestCsmResponse>>; openable?: boolean }> = ({
  message,
  openable,
}) => (
  <div className="min-w-0">
    <ExpandableText text={message.body} className="text-sm leading-snug text-navy" mode={openable ? 'popover' : 'inline'} />
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
      {openable && (
        <span className="ml-auto inline-flex items-center gap-1 text-navy/50" title="Click to view conversation and reply">
          <MessageSquare size={11} />
          <span className="font-medium">Reply</span>
        </span>
      )}
    </div>
  </div>
);
