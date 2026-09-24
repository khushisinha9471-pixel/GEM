import React from 'react';
import { X, Send } from 'lucide-react';
import type { Approval, Attachment, CustomerDecision } from '../types';
import { CUSTOMER_DECISIONS, CUSTOMER_DECISION_LABELS } from '../types';
import { StatusPill, OutcomeBadge } from '../components/StatusPill';
import { customerVisibleMessages } from '../utils/approvalHelpers';
import { ConversationThread } from '../components/ConversationThread';
import { useCustomerStore } from './customerStore';
import { CustomerAttachmentsView } from './CustomerAttachmentsView';
import { CustomerAttachmentPicker } from './CustomerAttachmentPicker';

type Tab = 'conversation' | 'attachments';

export const CustomerApprovalDetail: React.FC<{
  approval: Approval;
  serial: number;
  onClose: () => void;
  initialDecision?: CustomerDecision | null;
}> = ({ approval, serial, onClose, initialDecision }) => {
  const { dispatch } = useCustomerStore();
  const [tab, setTab] = React.useState<Tab>('conversation');
  const [decision, setDecision] = React.useState<CustomerDecision | null>(
    initialDecision ?? approval.customerDecision ?? null
  );
  const [replyBody, setReplyBody] = React.useState('');
  const [replyAttachments, setReplyAttachments] = React.useState<Attachment[]>([]);

  // A reply to an existing decision shouldn't force re-picking it — default
  // the dropdown to whatever was picked before opening (e.g. from the quick
  // table dropdown), falling back to whatever's already on record.
  React.useEffect(() => {
    setDecision(initialDecision ?? approval.customerDecision ?? null);
    setReplyBody('');
    setReplyAttachments([]);
  }, [approval.id]);

  const visibleMessages = customerVisibleMessages(approval);

  function sendReply() {
    if (!decision) return;
    dispatch({ type: 'ADD_CUSTOMER_DECISION', approvalId: approval.id, decision, comment: replyBody.trim(), attachments: replyAttachments });
    setReplyBody('');
    setReplyAttachments([]);
  }

  return (
    <div className="modal-overlay">
      <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-white shadow-pop">
        {/* Header */}
        <div className="border-b border-line px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-navy">#{serial}</h2>
                <StatusPill status={approval.status} />
                {approval.outcome && <OutcomeBadge outcome={approval.outcome} />}
              </div>
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 text-slate hover:bg-surface hover:text-navy">
              <X size={20} />
            </button>
          </div>
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
        <div className="flex flex-1 flex-col overflow-hidden">
          {tab === 'conversation' && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <ConversationThread messages={visibleMessages} emptyLabel="No conversation yet on this approval." />
              </div>

              <div className="flex-none border-t border-line px-6 py-4">
                <label className="field-label">Your Decision</label>
                <select
                  value={decision ?? ''}
                  onChange={(e) => setDecision((e.target.value || null) as CustomerDecision | null)}
                  className="select-input"
                >
                  <option value="">Select a decision</option>
                  {CUSTOMER_DECISIONS.map((d) => (
                    <option key={d} value={d}>
                      {CUSTOMER_DECISION_LABELS[d]}
                    </option>
                  ))}
                </select>

                <label className="field-label mt-3">Comment (optional)</label>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={2}
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

          {tab === 'attachments' && (
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <CustomerAttachmentsView approval={approval} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
