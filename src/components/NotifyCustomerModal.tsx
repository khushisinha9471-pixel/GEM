import React from 'react';
import { X, Send, Search } from 'lucide-react';
import { CUSTOMERS } from '../data/seed';
import { CustomerMultiSelect } from './CustomerMultiSelect';
import { useStore } from '../state/store';
import { formatCost, itemPartLabel } from '../utils/format';
import { StatusPill } from './StatusPill';

export const NotifyCustomerModal: React.FC<{ initialApprovalId?: string; onClose: () => void }> = ({
  initialApprovalId,
  onClose,
}) => {
  const { state, dispatch } = useStore();
  const [scope, setScope] = React.useState<'all' | 'selected'>('all');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [approvalId, setApprovalId] = React.useState(initialApprovalId ?? '');
  const [query, setQuery] = React.useState('');
  const [message, setMessage] = React.useState('');

  const approval = state.approvals.find((a) => a.id === approvalId) ?? null;

  React.useEffect(() => {
    if (approval) {
      setMessage(`Approval ${approval.id} requires your review. Please review the requirement and provide your response.`);
    }
  }, [approval?.id]);

  const results = state.approvals
    .filter((a) => `${a.id} ${a.type} ${a.subtype ?? ''} ${itemPartLabel(a)}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  function send() {
    if (!approval || !message.trim()) return;
    dispatch({
      type: 'NOTIFY_CUSTOMER',
      approvalId: approval.id,
      customerIds: scope === 'all' ? 'all' : selected,
      message: message.trim(),
    });
    onClose();
  }

  return (
    <div className="modal-overlay-center">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-pop">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-navy">Notify Customer</h2>
            <p className="text-xs text-slate">Send a notification regarding an approval — this does not change access.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate hover:bg-surface hover:text-navy">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
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
            <label className="field-label">Notify Regarding *</label>
            <div className="flex items-center gap-2 rounded-lg border border-line px-3 py-2">
              <Search size={14} className="text-slate" />
              <input
                value={query || (approval ? `${approval.id} | ${approval.type}${approval.subtype ? ` | ${approval.subtype}` : ''} | ${itemPartLabel(approval)}` : '')}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setApprovalId('');
                }}
                placeholder="Search by approval ID, type, subtype, item/part..."
                className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-slate/60"
              />
            </div>
            {query && !approval && (
              <div className="mt-1 max-h-44 overflow-y-auto rounded-lg border border-line">
                {results.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setApprovalId(a.id);
                      setQuery('');
                    }}
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-surface"
                  >
                    <span className="text-sm font-medium text-navy">
                      {a.id} | {a.type}
                      {a.subtype ? ` | ${a.subtype}` : ''}
                    </span>
                    <span className="text-xs text-slate">{itemPartLabel(a)}</span>
                  </button>
                ))}
                {results.length === 0 && <p className="px-3 py-2 text-xs text-slate">No matches.</p>}
              </div>
            )}
          </div>

          {approval && (
            <div className="rounded-lg border border-line bg-surface/40 p-3 text-xs">
              <div className="grid grid-cols-2 gap-y-1.5 text-navy">
                <span className="text-slate">Approval:</span>
                <span className="font-medium">{approval.id}</span>
                <span className="text-slate">Type:</span>
                <span className="font-medium">{approval.type}</span>
                <span className="text-slate">Subtype:</span>
                <span className="font-medium">{approval.subtype ?? '—'}</span>
                <span className="text-slate">Item / Part:</span>
                <span className="font-medium">{itemPartLabel(approval)}</span>
                <span className="text-slate">Cost:</span>
                <span className="font-medium">{formatCost(approval.cost)}</span>
                <span className="text-slate">Status:</span>
                <span>
                  <StatusPill status={approval.status} />
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="field-label">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="textarea-input" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={send} disabled={!approval || !message.trim()} className="btn-primary">
            <Send size={14} />
            Send Notification
          </button>
        </div>
      </div>
    </div>
  );
};
