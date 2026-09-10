import React from 'react';
import { FileText, Paperclip, Mail, Eye } from 'lucide-react';
import type { Approval, Attachment } from '../types';
import { formatDate } from '../utils/format';

function collectAttachments(a: Approval): Attachment[] {
  const fromMessages = a.messages.flatMap((m) => m.attachments);
  const fromForwards = a.forwardRequests.flatMap((f) => f.attachments);
  const map = new Map<string, Attachment>();
  [...fromMessages, ...fromForwards].forEach((att) => map.set(att.id, att));
  return Array.from(map.values());
}

export const ApprovalAttachmentsView: React.FC<{ approval: Approval }> = ({ approval }) => {
  const all = collectAttachments(approval);
  const reportsLibrary = all.filter((a) => a.source === 'reports-library');
  const external = all.filter((a) => a.source === 'external');
  const fromEmail = all.filter((a) => a.source === 'email');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-navy">Reports Library</h3>
        <p className="mb-2 text-xs text-slate">Documents linked from the Reports Library — remain at their original location.</p>
        {reportsLibrary.length === 0 ? (
          <p className="text-xs italic text-slate/60">No reports linked.</p>
        ) : (
          <div className="divide-y divide-line rounded-lg border border-line">
            {reportsLibrary.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                <FileText size={16} className="flex-none text-navy" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">{r.name}</p>
                  <p className="text-xs text-slate">
                    {r.reportType ?? 'Report'} · {formatDate(r.date)}
                  </p>
                </div>
                <button className="btn-ghost">
                  <Eye size={13} /> View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-navy">External Attachments</h3>
        <p className="mb-2 text-xs text-slate">Documents uploaded directly to this approval.</p>
        {external.length === 0 ? (
          <p className="text-xs italic text-slate/60">No external attachments.</p>
        ) : (
          <div className="divide-y divide-line rounded-lg border border-line">
            {external.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                <Paperclip size={16} className="flex-none text-slate" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">{r.name}</p>
                  <p className="text-xs text-slate">
                    Uploaded by {r.uploadedBy ?? '—'} · {formatDate(r.date)}
                  </p>
                </div>
                <button className="btn-ghost">
                  <Eye size={13} /> View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {fromEmail.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-navy">Received via Internal Email</h3>
          <p className="mb-2 text-xs text-slate">Associated with the relevant internal response.</p>
          <div className="divide-y divide-line rounded-lg border border-line">
            {fromEmail.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                <Mail size={16} className="flex-none text-navy" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">{r.name}</p>
                  <p className="text-xs text-slate">Captured from email · {formatDate(r.date)}</p>
                </div>
                <button className="btn-ghost">
                  <Eye size={13} /> View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
