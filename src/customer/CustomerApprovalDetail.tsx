import React from 'react';
import { X, Send } from 'lucide-react';
import type { Approval, Attachment, CustomerDecision } from '../types';
import { CUSTOMER_DECISIONS } from '../types';
import { StatusPill, OutcomeBadge } from '../components/StatusPill';
import { formatCost, itemPartLabel } from '../utils/format';
import { customerVisibleMessages } from '../utils/approvalHelpers';
import { ConversationThread } from '../components/ConversationThread';
import { useCustomerStore } from './customerStore';
import { CustomerAttachmentsView } from './CustomerAttachmentsView';
import { CustomerAttachmentPicker } from './CustomerAttachmentPicker';

type Tab = 'conversation' | 'attachments';

const DECISION_BUTTON_STYLES: Record<CustomerDecision, string> = {
  Approved: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  'Approve with Condition': 'border-sky-300 bg-sky-50 text-sky-700',
  Rejected: 'border-red-300 bg-red-50 text-red-700',
  'Clarification Requested': 'border-amber-300 bg-amber-50 text-amber-700',
  'Negotiation Requested': 'border-amber-300 bg-amber-50 text-amber-700',
};

// The customer picks a decision by the action they're taking ("Request
// Clarification"); the CSM side still shows the resulting state
// ("Clarification Requested") everywhere else — table, conversation badges.
const CUSTOMER_DECISION_LABELS: Record<CustomerDecision, string> = {
  Approved: 'Approved',
  'Approve with Condition': 'Approve with Condition',
  Rejected: 'Rejected',
  'Clarification Requested': 'Request Clarification',
  'Negotiation Requested': 'Request Negotiation',
};

export const CustomerApprovalDetail: React.FC<{ approval: Approval; serial: number; onClose: () => void }> = ({
  approval,
  serial,
  onClose,
}) => {
  const { dispatch } = useCustomerStore();
  const [tab, setTab] = React.useState<Tab>('conversation');
  const [decision, setDecision] = React.useState<CustomerDecision | null>(null);
  const [replyBody, setReplyBody] = React.useState('');
  const [replyAttachments, setReplyAttachments] = React.useState<Attachment[]>([]);

  const visibleMessages = customerVisibleMessages(approval);

  function sendReply() {
    if (!decision) return;
    dispatch({ type: 'ADD_CUSTOMER_DECISION', approvalId: approval.id, decision, comment: replyBody.trim(), attachments: replyAttachments });
    setDecision(null);
    setReplyBody('');
    setReplyAttachments([]);
  }

  return (
    <div className="modal-overlay">
      <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-white shadow-pop">
        {/* Header */}
        <div className="border-b border-line px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-navy">#{serial}</h2>
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
        </div>

        {/* Tabs */}
        <div className="flex border-b border-line px-6">
          {(
            [
              ['conversation', 'Conversation'],
              ['attachments', 'Attachments'],
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
              <ConversationThread messages={visibleMessages} emptyLabel="No conversation yet on this approval." />

              <div className="rounded-xl border border-line p-4">
                <label className="field-label">Your Response</label>
                <div className="flex flex-wrap gap-2">
                  {CUSTOMER_DECISIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDecision(d)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        decision === d ? DECISION_BUTTON_STYLES[d] : 'border-line text-slate hover:bg-surface'
                      }`}
                    >
                      {CUSTOMER_DECISION_LABELS[d]}
                    </button>
                  ))}
                </div>

                <label className="field-label mt-3">Comment (optional)</label>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={3}
                  placeholder="Add any additional comment..."
                  className="textarea-input"
                />
                <div className="mt-2">
                  <CustomerAttachmentPicker attachments={replyAttachments} onChange={setReplyAttachments} />
                </div>
                <div className="mt-3 flex justify-end">
                  <button onClick={sendReply} disabled={!decision} className="btn-primary">
                    <Send size={14} />
                    Send Response
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'attachments' && <CustomerAttachmentsView approval={approval} />}
        </div>
      </div>
    </div>
  );
};
