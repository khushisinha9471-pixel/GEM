import React from 'react';
import { X, Send } from 'lucide-react';
import type { Approval, Attachment } from '../types';
import { StatusPill, OutcomeBadge } from '../components/StatusPill';
import { formatCost, itemPartLabel } from '../utils/format';
import { customerVisibleMessages } from '../utils/approvalHelpers';
import { ConversationThread } from '../components/ConversationThread';
import { useCustomerStore } from './customerStore';
import { CustomerAttachmentsView } from './CustomerAttachmentsView';
import { CustomerAttachmentPicker } from './CustomerAttachmentPicker';

type Tab = 'conversation' | 'attachments';

export const CustomerApprovalDetail: React.FC<{ approval: Approval; onClose: () => void }> = ({ approval, onClose }) => {
  const { dispatch } = useCustomerStore();
  const [tab, setTab] = React.useState<Tab>('conversation');
  const [replyBody, setReplyBody] = React.useState('');
  const [replyAttachments, setReplyAttachments] = React.useState<Attachment[]>([]);

  const visibleMessages = customerVisibleMessages(approval);

  function sendReply() {
    if (!replyBody.trim()) return;
    dispatch({ type: 'ADD_CUSTOMER_RESPONSE', approvalId: approval.id, body: replyBody.trim(), attachments: replyAttachments });
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
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={3}
                  placeholder="Type your response to the GEM team..."
                  className="textarea-input"
                />
                <div className="mt-2">
                  <CustomerAttachmentPicker attachments={replyAttachments} onChange={setReplyAttachments} />
                </div>
                <div className="mt-3 flex justify-end">
                  <button onClick={sendReply} disabled={!replyBody.trim()} className="btn-primary">
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
