import React from 'react';
import { X, Send, Mail, MessagesSquare, ChevronDown, ChevronUp } from 'lucide-react';
import type { Approval, Attachment } from '../types';
import { INTERNAL_MEMBERS, REQUEST_TYPES } from '../data/seed';
import { AttachmentManager } from './AttachmentManager';
import { ConversationThread } from './ConversationThread';
import { useStore, genForwardId } from '../state/store';
import { itemPartLabel } from '../utils/format';
import { customerVisibleMessages } from '../utils/approvalHelpers';
import { CUSTOMERS } from '../data/seed';

export const ForwardToInternalModal: React.FC<{ approval: Approval; onClose: () => void }> = ({ approval, onClose }) => {
  const { state, dispatch } = useStore();
  const [recipientId, setRecipientId] = React.useState('');
  const [requestType, setRequestType] = React.useState(REQUEST_TYPES[0]);
  const [question, setQuestion] = React.useState(approval.requirement);
  const [ccCustomer, setCcCustomer] = React.useState(true);
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [provider, setProvider] = React.useState<'Gmail' | 'Outlook'>(state.emailConnection.provider ?? 'Gmail');
  const [query, setQuery] = React.useState('');
  const [sendingAccount, setSendingAccount] = React.useState(state.emailConnection.account ?? '');
  const [testRecipientEmail, setTestRecipientEmail] = React.useState('');
  const [includeHistory, setIncludeHistory] = React.useState(true);
  const [historyExpanded, setHistoryExpanded] = React.useState(false);

  const recipient = INTERNAL_MEMBERS.find((m) => m.id === recipientId);
  const filteredMembers = INTERNAL_MEMBERS.filter((m) => `${m.name} ${m.role}`.toLowerCase().includes(query.toLowerCase()));
  const conversationHistory = customerVisibleMessages(approval);

  const subjectLine = `[${approval.id}] ${requestType} Requested – ${itemPartLabel(approval)}`;
  const effectiveRecipientEmail = testRecipientEmail.trim() || recipient?.email;

  function send() {
    if (!recipient || !question.trim()) return;
    if (sendingAccount.trim() && sendingAccount.trim() !== state.emailConnection.account) {
      dispatch({ type: 'SET_EMAIL_CONNECTION', provider, account: sendingAccount.trim() });
    }
    dispatch({
      type: 'FORWARD_TO_INTERNAL',
      approvalId: approval.id,
      forwardRequest: {
        id: genForwardId(),
        recipientName: recipient.name,
        recipientRole: recipient.role,
        recipientEmail: effectiveRecipientEmail ?? recipient.email,
        requestType,
        question: question.trim(),
        attachments,
        sentAt: new Date().toISOString(),
        sentVia: provider,
        status: 'awaiting',
        includeHistory,
        includedMessages: includeHistory ? conversationHistory : [],
        ccCustomer,
      },
    });
    onClose();
  }

  const ccNames =
    approval.access === 'all'
      ? 'all mapped customers'
      : CUSTOMERS.filter((c) => approval.selectedCustomerIds.includes(c.id))
          .map((c) => c.name)
          .join(', ') || 'mapped customers';

  return (
    <div className="modal-overlay-center">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-pop">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-navy">Forward to Internal Member</h2>
            <p className="text-xs text-slate">Request input without granting Customer Portal access — sent via email.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate hover:bg-surface hover:text-navy">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div>
            <label className="field-label">Internal Recipient *</label>
            <input
              value={query || (recipient ? `${recipient.name} — ${recipient.role}` : '')}
              onChange={(e) => {
                setQuery(e.target.value);
                setRecipientId('');
              }}
              placeholder="Search internal team member..."
              className="field-input"
            />
            {query && !recipient && (
              <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-line">
                {filteredMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setRecipientId(m.id);
                      setQuery('');
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface"
                  >
                    <span className="font-medium text-navy">{m.name}</span>
                    <span className="text-xs text-slate">{m.role}</span>
                  </button>
                ))}
                {filteredMembers.length === 0 && <p className="px-3 py-2 text-xs text-slate">No matches.</p>}
              </div>
            )}
          </div>

          <div>
            <label className="field-label">Request Type</label>
            <select value={requestType} onChange={(e) => setRequestType(e.target.value)} className="select-input">
              {REQUEST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Message to Internal Member *</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              placeholder="Customer has requested an engineer's recommendation. Please advise whether we should proceed with the repair or replace the part."
              className="textarea-input"
            />
            <p className="mt-1 text-xs text-slate">Pre-filled with the requirement — edit freely before sending.</p>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line p-3">
            <input
              type="checkbox"
              checked={ccCustomer}
              onChange={(e) => setCcCustomer(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#0B2345]"
            />
            <span className="flex-1">
              <span className="text-sm font-semibold text-navy">CC Customer</span>
              <span className="mt-0.5 block text-xs text-slate">
                Include {ccNames} on this email. The internal member's reply — and this thread — will appear directly
                in the customer conversation, recorded automatically on the portal.
              </span>
            </span>
          </label>

          <AttachmentManager attachments={attachments} onChange={setAttachments} />

          <div className="rounded-xl border border-line p-3">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={includeHistory}
                onChange={(e) => setIncludeHistory(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#0B2345]"
              />
              <span className="flex-1">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-navy">
                  <MessagesSquare size={14} />
                  Include full conversation history
                </span>
                <span className="mt-0.5 block text-xs text-slate">
                  Send the customer conversation so far ({conversationHistory.length} message
                  {conversationHistory.length === 1 ? '' : 's'}) along with your question, so{' '}
                  {recipient?.name ?? 'the reviewer'} has the complete context — not just this one message.
                </span>
              </span>
            </label>

            {includeHistory && conversationHistory.length > 0 && (
              <div className="mt-3 border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => setHistoryExpanded((v) => !v)}
                  className="flex items-center gap-1 text-xs font-medium text-navy hover:underline"
                >
                  {historyExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {historyExpanded ? 'Hide' : 'Preview'} what will be forwarded
                </button>
                {historyExpanded && (
                  <div className="mt-3 max-h-56 overflow-y-auto rounded-lg bg-surface/40 p-3">
                    <ConversationThread messages={conversationHistory} emptyLabel="No conversation yet." />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-line bg-surface/40 p-3">
            <p className="text-xs font-semibold text-slate">Email Preview</p>
            <div className="mt-2 space-y-1 text-xs text-navy">
              <p>
                <span className="font-medium text-slate">To:</span> {effectiveRecipientEmail ?? '—'}
              </p>
              {ccCustomer && (
                <p>
                  <span className="font-medium text-slate">CC:</span> {ccNames}
                </p>
              )}
              <p>
                <span className="font-medium text-slate">Subject:</span> {subjectLine}
              </p>
              <p className="text-slate">
                Includes: Approval ID, Type/Subtype, Item/Part, Requirement, Cost, your question, and{' '}
                {attachments.length} attachment(s)
                {includeHistory && conversationHistory.length > 0
                  ? `, plus the full conversation history (${conversationHistory.length} prior message${
                      conversationHistory.length === 1 ? '' : 's'
                    }).`
                  : '.'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-line p-3">
            <p className="text-sm font-semibold text-navy">Email Integration — Live Test</p>
            <p className="mt-0.5 text-xs text-slate">
              Connects a real Gmail or Outlook mailbox. The Approval ID is identified from the subject line and
              captures the reply automatically once it arrives — no manual copy/paste.
            </p>

            <div className="mt-3 flex gap-2">
              {(['Gmail', 'Outlook'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${
                    provider === p ? 'border-navy bg-navy-50 text-navy' : 'border-line text-slate hover:bg-surface'
                  }`}
                >
                  <Mail size={14} />
                  {p}
                </button>
              ))}
            </div>

            <div className="mt-3">
              <label className="field-label">Sending Account</label>
              <input
                value={sendingAccount}
                onChange={(e) => setSendingAccount(e.target.value)}
                placeholder="you@company.com"
                className="field-input"
              />
            </div>

            <div className="mt-3">
              <label className="field-label">Test Recipient Email (optional)</label>
              <input
                value={testRecipientEmail}
                onChange={(e) => setTestRecipientEmail(e.target.value)}
                placeholder="Override the recipient above for a live round-trip test"
                className="field-input"
              />
              <p className="mt-1 text-xs text-slate">
                Leave blank to send to {recipient ? recipient.email : 'the selected recipient'}. Set this to run a
                real send → reply → auto-capture test against this approval.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={send} disabled={!recipient || !question.trim()} className="btn-primary">
            <Send size={14} />
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
};
