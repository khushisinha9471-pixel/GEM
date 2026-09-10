import React from 'react';
import { FileText, Paperclip, Upload, X, Link2 } from 'lucide-react';
import type { Attachment, ReportLibraryItem } from '../types';
import { ReportsLibraryPickerModal } from './ReportsLibraryPickerModal';
import { genAttachmentId } from '../state/store';

export const AttachmentManager: React.FC<{
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
  label?: string;
}> = ({ attachments, onChange, label = 'Attachments' }) => {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function addExternalFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newAtts: Attachment[] = Array.from(files).map((f) => ({
      id: genAttachmentId(),
      name: f.name,
      source: 'external',
      uploadedBy: 'Harini V',
      date: new Date().toISOString().slice(0, 10),
    }));
    onChange([...attachments, ...newAtts]);
  }

  function linkReports(reports: ReportLibraryItem[]) {
    const newAtts: Attachment[] = reports.map((r) => ({
      id: genAttachmentId(),
      name: r.name,
      source: 'reports-library',
      reportId: r.id,
      reportType: r.type,
      date: r.date,
    }));
    onChange([...attachments, ...newAtts]);
    setPickerOpen(false);
  }

  function remove(id: string) {
    onChange(attachments.filter((a) => a.id !== id));
  }

  const alreadyLinkedReportIds = attachments.filter((a) => a.source === 'reports-library' && a.reportId).map((a) => a.reportId!);

  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setPickerOpen(true)} className="btn-secondary">
          <Link2 size={14} />
          Link from Reports Library
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary">
          <Upload size={14} />
          Add External Attachment
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            addExternalFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addExternalFiles(e.dataTransfer.files);
        }}
        className={`mt-2 rounded-lg border border-dashed px-3 py-3 text-center text-xs transition ${
          dragOver ? 'border-navy bg-navy-50 text-navy' : 'border-line text-slate/70'
        }`}
      >
        Drag and drop files here, or use the buttons above
      </div>

      {attachments.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center gap-2 rounded-lg border border-line bg-surface/40 px-3 py-2">
              {a.source === 'reports-library' ? (
                <FileText size={14} className="flex-none text-navy" />
              ) : (
                <Paperclip size={14} className="flex-none text-slate" />
              )}
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-navy">{a.name}</span>
              <span className="flex-none text-[10px] font-semibold uppercase tracking-wide text-slate/70">
                {a.source === 'reports-library' ? 'Reports Library' : a.source === 'email' ? 'Email' : 'External'}
              </span>
              <button type="button" onClick={() => remove(a.id)} className="flex-none text-slate hover:text-red-600">
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {pickerOpen && (
        <ReportsLibraryPickerModal alreadyLinkedIds={alreadyLinkedReportIds} onClose={() => setPickerOpen(false)} onLink={linkReports} />
      )}
    </div>
  );
};
