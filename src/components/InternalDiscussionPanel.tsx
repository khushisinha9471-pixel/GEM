import React from 'react';
import { Clock, Mail, Paperclip, Share2, Lock, Send, FlaskConical, MessagesSquare, ChevronDown, ChevronUp } from 'lucide-react';
import type { Approval, ConversationMessage } from '../types';
import { formatDateTime } from '../utils/format';
import { internalMessages } from '../utils/approvalHelpers';
import { useStore } from '../state/store';
import { ConversationThread } from './ConversationThread';

const SIMULATED_REPLIES = [
  'We recommend replacing the part rather than proceeding with the proposed repair.',
  'Reviewed the findings — repair is acceptable within limits; proceed as originally scoped.',
  'Recommend obtaining an updated borescope image before making a final call.',
  'Cost looks in line with prior similar events — no objection from a cost standpoint.',
];

export const InternalDiscussionPanel: React.FC<{
  approval: Approval;
  onForward: () => void;
  onShare: (message: ConversationMessage) => void;
}> = ({ approval, onForward, onShare }) => {
  const { dispatch } = useStore();
  const messages = internalMessages(approval);
  const awaiting = approval.forwardRequests.filter((f) => f.status === 'awaiting');
  const [expandedHistory, setExpandedHistory] = React.useState<Set<string>>(new Set());

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-navy">Internal Discussion</h3>
          <p className="text-xs text-slate">Private by default. CSM ↔ Engineer / Internal Team.</p>
        </div>
        <button onClick={onForward} className="btn-secondary">
          <Send size={14} />
          Forward to Internal Member
        </button>
      </div>

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

      {messages.length === 0 && awaiting.length === 0 && (
        <p className="py-8 text-center text-sm text-slate/60">No internal discussion yet. Forward this approval to an internal member to request input.</p>
      )}

      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="rounded-xl border border-line bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-navy">{m.authorName}</span>
              <span className="text-xs text-slate">— {m.authorTitle}</span>
              <span className="text-xs text-slate/70">{formatDateTime(m.date)}</span>
              {m.capturedFromEmail && (
                <span className="inline-flex items-center gap-1 rounded-full bg-navy-50 px-2 py-0.5 text-[10px] font-semibold text-navy">
                  <Mail size={10} /> Captured automatically from email
                </span>
              )}
              {m.internalDecision === 'shared' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <Share2 size={10} /> Shared with customer
                </span>
              )}
              {m.internalDecision === 'kept-internal' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate/10 px-2 py-0.5 text-[10px] font-semibold text-slate">
                  <Lock size={10} /> Kept internal
                </span>
              )}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-navy">{m.body}</p>
            {m.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {m.attachments.map((a) => (
                  <span key={a.id} className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-1 text-[11px] font-medium text-navy">
                    <Paperclip size={10} />
                    {a.name}
                  </span>
                ))}
              </div>
            )}
            {!m.internalDecision && (
              <div className="mt-3 flex gap-2 border-t border-line pt-3">
                <button onClick={() => onShare(m)} className="btn-primary !px-3 !py-1.5 text-xs">
                  <Share2 size={13} />
                  Share with Customer
                </button>
                <button
                  onClick={() => dispatch({ type: 'KEEP_INTERNAL', approvalId: approval.id, messageId: m.id })}
                  className="btn-secondary !px-3 !py-1.5 text-xs"
                >
                  <Lock size={13} />
                  Keep Internal
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
