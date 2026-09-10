import React from 'react';
import { X, ShieldCheck, Send, CheckCircle2, RotateCcw, FlaskConical } from 'lucide-react';
import type { Approval, Attachment, ConversationMessage } from '../types';
import { StatusPill, OutcomeBadge } from './StatusPill';
import { formatCost, itemPartLabel } from '../utils/format';
import { customerVisibleMessages } from '../utils/approvalHelpers';
import { ConversationThread } from './ConversationThread';
import { InternalDiscussionPanel } from './InternalDiscussionPanel';
import { ApprovalAttachmentsView } from './ApprovalAttachmentsView';
import { AuditTrailView } from './AuditTrailView';
import { AccessModal } from './AccessModal';
import { CloseApprovalModal } from './CloseApprovalModal';
import { ForwardToInternalModal } from './ForwardToInternalModal';
import { ShareEngineerResponseModal } from './ShareEngineerResponseModal';
import { AttachmentManager } from './AttachmentManager';
import { useStore } from '../state/store';
import { CUSTOMERS } from '../data/seed';

type Tab = 'conversation' | 'internal' | 'attachments' | 'audit';

const SIMULATED_CUSTOMER_REPLIES = [
  'Thank you, please proceed.',
  'We need more information before we can approve this.',
  'Can you confirm the revised cost impact?',
  'We will supply an alternative part.',
];

export const ApprovalDetailPanel: React.FC<{
  approval: Approval;
  onClose: () => void;
  onNotify: (approvalId: string) => void;
}> = ({ approval, onClose, onNotify }) => {
  const { dispatch } = useStore();
  const [tab, setTab] = React.useState<Tab>('conversation');
  const [accessOpen, setAccessOpen] = React.useState(false);
  const [closeOpen, setCloseOpen] = React.useState(false);
  const [forwardOpen, setForwardOpen] = React.useState(false);
  const [shareMessage, setShareMessage] = React.useState<ConversationMessage | null>(null);

  const [replyBody, setReplyBody] = React.useState('');
  const [replyAttachments, setReplyAttachments] = React.useState<Attachment[]>([]);

  const visibleMessages = customerVisibleMessages(approval);
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

  function simulateCustomerReply() {
    const body = SIMULATED_CUSTOMER_REPLIES[Math.floor(Math.random() * SIMULATED_CUSTOMER_REPLIES.length)];
    dispatch({ type: 'SIMULATE_CUSTOMER_REPLY', approvalId: approval.id, body });
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
              <button onClick={() => setCloseOpen(true)} className="btn-primary">
                <CheckCircle2 size={14} />
                Close Approval
              </button>
            ) : (
              <button onClick={() => dispatch({ type: 'REOPEN_APPROVAL', approvalId: approval.id })} className="btn-secondary">
                <RotateCcw size={14} />
                Reopen
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-line px-6">
          {(
            [
              ['conversation', 'Customer Conversation'],
              ['internal', 'Internal Discussion'],
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
              <div className="rounded-lg border border-dashed border-line bg-surface/30 px-3 py-2 text-xs text-slate">
                Customer-visible thread — internal discussion stays private unless explicitly shared.
              </div>
              <ConversationThread messages={visibleMessages} emptyLabel="No customer conversation yet." />

              <div className="flex items-center gap-2 border-t border-line pt-4">
                <button
                  onClick={simulateCustomerReply}
                  className="flex items-center gap-1.5 rounded-lg border border-dashed border-line px-2.5 py-1.5 text-xs font-medium text-slate hover:bg-surface"
                  title="Test capability: simulate the customer replying via the Customer Portal"
                >
                  <FlaskConical size={13} />
                  Simulate Customer Reply (Test)
                </button>
              </div>

              <div className="rounded-xl border border-line p-4">
                <label className="field-label">CSM Response</label>
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

          {tab === 'internal' && (
            <InternalDiscussionPanel approval={approval} onForward={() => setForwardOpen(true)} onShare={setShareMessage} />
          )}

          {tab === 'attachments' && <ApprovalAttachmentsView approval={approval} />}

          {tab === 'audit' && <AuditTrailView approval={approval} />}
        </div>
      </div>

      {accessOpen && <AccessModal approval={approval} onClose={() => setAccessOpen(false)} />}
      {closeOpen && <CloseApprovalModal approval={approval} onClose={() => setCloseOpen(false)} />}
      {forwardOpen && <ForwardToInternalModal approval={approval} onClose={() => setForwardOpen(false)} />}
      {shareMessage && (
        <ShareEngineerResponseModal approval={approval} message={shareMessage} onClose={() => setShareMessage(null)} />
      )}
    </div>
  );
};
