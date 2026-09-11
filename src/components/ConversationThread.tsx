import React from 'react';
import { Paperclip, Mail, Lock } from 'lucide-react';
import type { ConversationMessage, CustomerDecision } from '../types';
import { formatDateTime } from '../utils/format';

const roleStyles: Record<string, { bubble: string; align: string; label: string }> = {
  CSM: { bubble: 'bg-navy text-white', align: 'items-end', label: 'text-navy' },
  Customer: { bubble: 'bg-surface text-navy border border-line', align: 'items-start', label: 'text-slate' },
  Internal: { bubble: 'bg-amber-50 text-navy border border-amber-200', align: 'items-start', label: 'text-amber-700' },
};

const DECISION_BADGE_STYLES: Record<CustomerDecision, string> = {
  Approved: 'bg-emerald-50 text-emerald-700',
  'Approve with Condition': 'bg-sky-50 text-sky-700',
  Rejected: 'bg-red-50 text-red-700',
  'Clarification Requested': 'bg-amber-50 text-amber-700',
  'Negotiation Requested': 'bg-amber-50 text-amber-700',
};

export const MessageBubble: React.FC<{ message: ConversationMessage }> = ({ message }) => {
  const isInternalOnly = message.channel === 'internal';
  const style = roleStyles[message.authorRole] ?? roleStyles.Customer;
  const isCsm = message.authorRole === 'CSM';

  return (
    <div className={`flex flex-col ${isCsm ? 'items-end' : 'items-start'}`}>
      <div className="mb-1 flex flex-wrap items-center gap-1.5 text-xs font-semibold">
        <span className={style.label}>
          {message.authorName}
          {message.authorTitle ? ` — ${message.authorTitle}` : ''}
        </span>
        {message.decision && (
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${DECISION_BADGE_STYLES[message.decision]}`}>
            {message.decision}
          </span>
        )}
        {message.capturedFromEmail && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-navy-50 px-1.5 py-0.5 text-[10px] font-medium text-navy">
            <Mail size={10} /> Captured automatically from email
          </span>
        )}
        {isInternalOnly && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-slate/10 px-1.5 py-0.5 text-[10px] font-medium text-slate">
            <Lock size={10} /> Internal only
          </span>
        )}
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isCsm ? 'bg-navy text-white' : isInternalOnly ? 'border border-amber-200 bg-amber-50 text-navy' : 'border border-line bg-white text-navy'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.body}</p>
        {message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.attachments.map((a) => (
              <span
                key={a.id}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${
                  isCsm ? 'bg-white/15 text-white' : 'bg-surface text-navy'
                }`}
              >
                <Paperclip size={10} />
                {a.name}
              </span>
            ))}
          </div>
        )}
      </div>
      <span className="mt-1 text-[11px] text-slate/70">{formatDateTime(message.date)}</span>
    </div>
  );
};

export const ConversationThread: React.FC<{ messages: ConversationMessage[]; emptyLabel: string }> = ({
  messages,
  emptyLabel,
}) => {
  if (messages.length === 0) {
    return <p className="py-8 text-center text-sm text-slate/60">{emptyLabel}</p>;
  }
  return (
    <div className="space-y-4">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
    </div>
  );
};
