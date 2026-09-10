import React from 'react';
import { X, Trash2, TriangleAlert } from 'lucide-react';
import type { Approval } from '../types';
import { useStore } from '../state/store';

export const DeleteApprovalModal: React.FC<{ approval: Approval; onClose: () => void; onDeleted: () => void }> = ({
  approval,
  onClose,
  onDeleted,
}) => {
  const { dispatch } = useStore();

  function confirmDelete() {
    dispatch({ type: 'DELETE_APPROVAL', approvalId: approval.id });
    onDeleted();
  }

  return (
    <div className="modal-overlay-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-pop">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <TriangleAlert size={18} className="text-red-600" />
            <h2 className="text-base font-semibold text-navy">Delete Approval</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate hover:bg-surface hover:text-navy">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5">
          <p className="text-sm text-navy">
            Delete <span className="font-semibold">{approval.id}</span> — {approval.type}
            {approval.subtype ? ` — ${approval.subtype}` : ''}?
          </p>
          <p className="mt-2 text-sm text-slate">
            This permanently removes the approval, its entire conversation, attachments, and audit trail. This action
            cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-red-700"
          >
            <Trash2 size={14} />
            Delete Approval
          </button>
        </div>
      </div>
    </div>
  );
};
