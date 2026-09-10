import React from 'react';
import { Paperclip, Upload, X } from 'lucide-react';
import type { Attachment } from '../types';
import { genCustomerAttachmentId, CUSTOMER_PERSONA } from './customerStore';

export const CustomerAttachmentPicker: React.FC<{
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}> = ({ attachments, onChange }) => {
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newAtts: Attachment[] = Array.from(files).map((f) => ({
      id: genCustomerAttachmentId(),
      name: f.name,
      source: 'external',
      uploadedBy: CUSTOMER_PERSONA.name,
      date: new Date().toISOString().slice(0, 10),
    }));
    onChange([...attachments, ...newAtts]);
  }

  function remove(id: string) {
    onChange(attachments.filter((a) => a.id !== id));
  }

  return (
    <div>
      <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary">
        <Upload size={14} />
        Add Attachment
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`mt-2 rounded-lg border border-dashed px-3 py-3 text-center text-xs transition ${
          dragOver ? 'border-navy bg-navy-50 text-navy' : 'border-line text-slate/70'
        }`}
      >
        Drag and drop a file here, or use the button above
      </div>

      {attachments.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center gap-2 rounded-lg border border-line bg-surface/40 px-3 py-2">
              <Paperclip size={14} className="flex-none text-slate" />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-navy">{a.name}</span>
              <button type="button" onClick={() => remove(a.id)} className="flex-none text-slate hover:text-red-600">
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
