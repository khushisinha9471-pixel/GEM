import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import type { Approval, FinalOutcome } from '../types';
import { FINAL_OUTCOMES } from '../types';
import { useStore } from '../state/store';

export const CloseApprovalModal: React.FC<{ approval: Approval; onClose: () => void }> = ({ approval, onClose }) => {
  const { dispatch } = useStore();
  const [outcome, setOutcome] = React.useState<FinalOutcome | ''>('');

  function submit() {
    if (!outcome) return;
    dispatch({ type: 'REQUEST_CLOSE', approvalId: approval.id, outcome });
    onClose();
  }

  return (
    <div className="modal-overlay-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-pop">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-navy" />
            <h2 className="text-base font-semibold text-navy">Close Approval — {approval.id}</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate hover:bg-surface hover:text-navy">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5">
          <p className="text-xs text-slate">
            Record the final resolution for this approval. This represents the actual outcome, not an intermediate
            communication state.
          </p>
          <div>
            <label className="field-label">Final Outcome *</label>
            <div className="grid grid-cols-1 gap-1.5">
              {FINAL_OUTCOMES.map((o) => (
                <label
                  key={o}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm ${
                    outcome === o ? 'border-navy bg-navy-50 text-navy font-medium' : 'border-line text-slate hover:bg-surface'
                  }`}
                >
                  <input type="radio" name="outcome" checked={outcome === o} onChange={() => setOutcome(o)} className="accent-[#0B2345]" />
                  {o}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={submit} disabled={!outcome} className="btn-primary">
            Close Approval
          </button>
        </div>
      </div>
    </div>
  );
};
