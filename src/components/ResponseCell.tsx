import React from 'react';
import { Paperclip, Mail } from 'lucide-react';
import type { ConversationMessage } from '../types';
import { formatDateTime, truncate } from '../utils/format';

export const ResponseCell: React.FC<{ message: ConversationMessage | null; emptyLabel: string }> = ({
  message,
  emptyLabel,
}) => {
  if (!message) {
    return <span className="text-sm italic text-slate/60">{emptyLabel}</span>;
  }
  return (
    <div className="min-w-0">
      <p className="text-sm leading-snug text-navy line-clamp-2" title={message.body}>
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
};
