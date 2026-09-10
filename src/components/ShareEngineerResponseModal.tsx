import React from 'react';
import { X, Share2 } from 'lucide-react';
import type { Approval, ConversationMessage } from '../types';
import { CUSTOMERS } from '../data/seed';
import { CustomerMultiSelect } from './CustomerMultiSelect';
import { useStore } from '../state/store';
import { formatDateTime } from '../utils/format';

export const ShareEngineerResponseModal: React.FC<{
  approval: Approval;
  message: ConversationMessage;
  onClose: () => void;
}> = ({ approval, message, onClose }) => {
  const { dispatch } = useStore();
  const [scope, setScope] = React.useState<'all' | 'selected'>('all');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [context, setContext] = React.useState('');

  function share() {
    dispatch({
      type: 'SHARE_WITH_CUSTOMER',
      approvalId: approval.id,
      sourceMessageId: message.id,
      context: context.trim() || undefined,
      customerIds: scope === 'all' ? 'all' : selected,
    });
    onClose();
  }

  return (
    <div className="modal-overlay-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-pop">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-navy">Share with Customer</h2>
            <p className="text-xs text-slate">Make this internal response visible in the customer conversation.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate hover:bg-surface hover:text-navy">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div>
            <label className="field-label">Customer(s)</label>
            <div className="flex gap-2">
              <button
                onClick={() => setScope('all')}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                  scope === 'all' ? 'border-navy bg-navy-50 text-navy' : 'border-line text-slate hover:bg-surface'
                }`}
              >
                All Customers
              </button>
              <button
                onClick={() => setScope('selected')}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                  scope === 'selected' ? 'border-navy bg-navy-50 text-navy' : 'border-line text-slate hover:bg-surface'
                }`}
              >
                Select Customers
              </button>
            </div>
            {scope === 'selected' && (
              <div className="mt-2">
                <CustomerMultiSelect customers={CUSTOMERS} selected={selected} onChange={setSelected} />
              </div>
            )}
          </div>

          <div>
            <label className="field-label">Response to Share</label>
            <div className="rounded-lg border border-line bg-surface/40 p-3">
              <p className="text-sm font-semibold text-navy">
                {message.authorName} {message.authorTitle ? `— ${message.authorTitle}` : ''}
              </p>
              <p className="mt-1 text-xs text-slate">{formatDateTime(message.date)}</p>
              <p className="mt-2 text-sm text-navy">{message.body}</p>
            </div>
          </div>

          <div>
            <label className="field-label">Add Context (optional)</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={2}
              placeholder="Add any contextual note for the customer..."
              className="textarea-input"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={share} disabled={scope === 'selected' && selected.length === 0} className="btn-primary">
            <Share2 size={14} />
            Share Response
          </button>
        </div>
      </div>
    </div>
  );
};
