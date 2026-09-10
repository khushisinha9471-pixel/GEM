import React from 'react';
import { FileText, Paperclip, Eye } from 'lucide-react';
import type { Approval, Attachment } from '../types';
import { formatDate } from '../utils/format';
import { customerVisibleMessages } from '../utils/approvalHelpers';

function collectCustomerVisibleAttachments(a: Approval): Attachment[] {
  const map = new Map<string, Attachment>();
  customerVisibleMessages(a).forEach((m) => m.attachments.forEach((att) => map.set(att.id, att)));
  return Array.from(map.values());
}

export const CustomerAttachmentsView: React.FC<{ approval: Approval }> = ({ approval }) => {
  const all = collectCustomerVisibleAttachments(approval);
  const reportsLibrary = all.filter((a) => a.source === 'reports-library');
  const external = all.filter((a) => a.source !== 'reports-library');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-navy">Shared Documents</h3>
        <p className="mb-2 text-xs text-slate">Reports and records shared with you by the GEM team.</p>
        {reportsLibrary.length === 0 ? (
          <p className="text-xs italic text-slate/60">No documents shared yet.</p>
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
        <h3 className="text-sm font-semibold text-navy">Other Attachments</h3>
        <p className="mb-2 text-xs text-slate">Files exchanged directly in this conversation.</p>
        {external.length === 0 ? (
          <p className="text-xs italic text-slate/60">No other attachments.</p>
        ) : (
          <div className="divide-y divide-line rounded-lg border border-line">
            {external.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                <Paperclip size={16} className="flex-none text-slate" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">{r.name}</p>
                  <p className="text-xs text-slate">
                    {r.uploadedBy ? `Uploaded by ${r.uploadedBy}` : 'Uploaded'} · {formatDate(r.date)}
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
    </div>
  );
};
