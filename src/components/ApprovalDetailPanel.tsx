import React from 'react';
import {
  X,
  ShieldCheck,
  Send,
  CheckCircle2,
  RotateCcw,
  FlaskConical,
  Trash2,
  Clock,
  MessagesSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Approval, Attachment } from '../types';
import { StatusPill, OutcomeBadge } from './StatusPill';
import { formatCost, formatDateTime, itemPartLabel } from '../utils/format';
import { mergedConversation } from '../utils/approvalHelpers';
import { ConversationThread } from './ConversationThread';
import { ApprovalAttachmentsView } from './ApprovalAttachmentsView';
import { AuditTrailView } from './AuditTrailView';
import { AccessModal } from './AccessModal';
import { ForwardToInternalModal } from './ForwardToInternalModal';
import { AttachmentManager } from './AttachmentManager';
import { DeleteApprovalModal } from './DeleteApprovalModal';
import { useStore } from '../state/store';
import { CUSTOMERS } from '../data/seed';

type Tab = 'conversation' | 'attachments' | 'audit';

const SIMULATED_REPLIES = [
  'We recommend replacing the part rather than proceeding with the proposed repair.',
  'Reviewed the findings — repair is acceptable within limits; proceed as originally scoped.',
  'Recommend obtaining an updated borescope image before making a final call.',
  'Cost looks in line with prior similar events — no objection from a cost standpoint.',
];

export const ApprovalDetailPanel: React.FC<{
  approval: Approval;
  onClose: () => void;
  onNotify: (approvalId: string) => void;
  onRequestClose: (approvalId: string) => void;
}> = ({ approval, onClose, onNotify, onRequestClose }) => {
  const { dispatch } = useStore();
  const [tab, setTab] = React.useState<Tab>('conversation');
  const [accessOpen, setAccessOpen] = React.useState(false);
  const [forwardOpen, setForwardOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [expandedHistory, setExpandedHistory] = React.useState<Set<string>>(new Set());

  const [replyBody, setReplyBody] = React.useState('');
  const [replyAttachments, setReplyAttachments] = React.useState<Attachment[]>([]);

  const feed = mergedConversation(approval);
  const awaiting = approval.forwardRequests.filter((f) => f.status === 'awaiting');
  const accessLabel =
    approval.access === 'all'
      ? 'All Mapped Customers'
      : approval.selectedCustomerIds.map((id) => CUSTOMERS.find((c) => c.id === id)?.name).filter(Boolean).join(', ') || 'No customers selected';

  function sendCsmReply() {
    if (!replyBody.trim()) return;
    dispatch({ type: 'ADD_CSM_MESSAGE', approvalId: approval.id, body: replyBody.trim(), attachments: replyAttachments });
    setReplyBody('');
    setReplyAttachments([]);
  }

  function simulateReply(forwardRequestId: string) {
    const body = SIMULATED_REPLIES[Math.floor(Math.random() * SIMULATED_REPLIES.length)];
    dispatch({ type: 'SIMULATE_MAILBOX_REPLY', approvalId: approval.id, forwardRequestId, body });
  }

  function toggleHistory(id: string) {
    setExpandedHistory((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="modal-overlay">
      <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-white shadow-pop">
        {/* Header */}
        <div className="border-b border-line px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-navy">{approval.id}</h2>
                <StatusPill status={approval.status} />
                {approval.outcome && <OutcomeBadge outcome={approval.outcome} />}
              </div>
              <p className="mt-1 text-sm font-medium text-slate">
                {approval.type}
                {approval.subtype ? ` — ${approval.subtype}` : ''}
              </p>
              <p className="mt-0.5 text-sm text-navy">
                {itemPartLabel(approval)}
                {approval.cost != null && <span className="text-slate"> | {formatCost(approval.cost)}</span>}
              </p>
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 text-slate hover:bg-surface hover:text-navy">
              <X size={20} />
            </button>
          </div>

          <p className="mt-3 rounded-lg bg-surface/60 px-3 py-2 text-sm text-navy/90">{approval.requirement}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={() => setAccessOpen(true)} className="btn-secondary">
              <ShieldCheck size={14} />
              Access: {accessLabel.length > 28 ? `${accessLabel.slice(0, 28)}…` : accessLabel}
            </button>
            <button onClick={() => onNotify(approval.id)} className="btn-secondary">
              <Send size={14} />
              Notify Customer
            </button>
            {approval.status === 'Open' ? (
              <button onClick={() => onRequestClose(approval.id)} className="btn-primary">
                <CheckCircle2 size={14} />
                Close Approval
              </button>
            ) : (
              <button onClick={() => dispatch({ type: 'REOPEN_APPROVAL', approvalId: approval.id })} className="btn-secondary">
                <RotateCcw size={14} />
                Reopen
              </button>
            )}
            <button
              onClick={() => setDeleteOpen(true)}
              className="ml-auto inline-flex items-center justify-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
            >
              <Trash2 size={14} />
              Delete Approval
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-line px-6">
          {(
            [
              ['conversation', 'Conversation'],
              ['attachments', 'Attachments'],
              ['audit', 'Audit Trail'],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
                tab === key ? 'border-navy text-navy' : 'border-transparent text-slate hover:text-navy'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'conversation' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate">
                  Customer-visible messages and internal replies in one thread — internal-only messages are badged and
                  stay private.
                </p>
                <button onClick={() => setForwardOpen(true)} className="btn-secondary flex-none">
                  <Send size={14} />
                  Forward to Internal Member
                </button>
              </div>

              <ConversationThread messages={feed} emptyLabel="No conversation yet." />

              {awaiting.map((f) => (
                <div key={f.id} className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                        <Clock size={13} />
                        Awaiting response from {f.recipientName} ({f.recipientRole})
                      </div>
                      <p className="mt-1 text-xs text-slate">
                        {f.requestType} request sent via {f.sentVia} on {formatDateTime(f.sentAt)}
                        {f.ccCustomer ? ' — customer cc\'d' : ' — internal only'}
                      </p>
                      <p className="mt-1 text-xs italic text-slate">&ldquo;{f.question}&rdquo;</p>
                    </div>
                    <button
                      onClick={() => simulateReply(f.id)}
                      className="flex flex-none items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                      title="Test capability: simulate the internal recipient replying from their test mailbox"
                    >
                      <FlaskConical size={13} />
                      Simulate Test Mailbox Reply
                    </button>
                  </div>
                  {f.includeHistory && (f.includedMessages?.length ?? 0) > 0 && (
                    <div className="mt-2 border-t border-amber-200/70 pt-2">
                      <button
                        onClick={() => toggleHistory(f.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-amber-800 hover:underline"
                      >
                        <MessagesSquare size={12} />
                        Full conversation included ({f.includedMessages!.length} message{f.includedMessages!.length === 1 ? '' : 's'})
                        {expandedHistory.has(f.id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                      {expandedHistory.has(f.id) && (
                        <div className="mt-2 max-h-56 overflow-y-auto rounded-lg bg-white/70 p-3">
                          <ConversationThread messages={f.includedMessages!} emptyLabel="No conversation was included." />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="rounded-xl border border-line p-4">
                <label className="field-label">GEM Response</label>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={3}
                  placeholder="Write a message to the customer..."
                  className="textarea-input"
                />
                <div className="mt-2">
                  <AttachmentManager attachments={replyAttachments} onChange={setReplyAttachments} label="Attach to this message" />
                </div>
                <div className="mt-3 flex justify-end">
                  <button onClick={sendCsmReply} disabled={!replyBody.trim()} className="btn-primary">
                    <Send size={14} />
                    Send to Customer
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'attachments' && <ApprovalAttachmentsView approval={approval} />}

          {tab === 'audit' && <AuditTrailView approval={approval} />}
        </div>
      </div>

      {accessOpen && <AccessModal approval={approval} onClose={() => setAccessOpen(false)} />}
      {forwardOpen && <ForwardToInternalModal approval={approval} onClose={() => setForwardOpen(false)} />}
      {deleteOpen && <DeleteApprovalModal approval={approval} onClose={() => setDeleteOpen(false)} onDeleted={onClose} />}
    </div>
  );
};
