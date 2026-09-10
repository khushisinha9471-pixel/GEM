import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import type { Approval } from '../types';
import { CUSTOMERS } from '../data/seed';
import { CustomerMultiSelect } from './CustomerMultiSelect';
import { useStore } from '../state/store';

export const AccessModal: React.FC<{ approval: Approval; onClose: () => void }> = ({ approval, onClose }) => {
  const { dispatch } = useStore();
  const [access, setAccess] = React.useState<'all' | 'selected'>(approval.access);
  const [selected, setSelected] = React.useState<string[]>(approval.selectedCustomerIds);

  function save() {
    dispatch({
      type: 'UPDATE_ACCESS',
      approvalId: approval.id,
      access,
      selectedCustomerIds: access === 'selected' ? selected : [],
    });
    onClose();
  }

  return (
    <div className="modal-overlay-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-pop">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-navy" />
            <h2 className="text-base font-semibold text-navy">Approval Access</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate hover:bg-surface hover:text-navy">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5">
          <p className="text-xs text-slate">
            Work Order access and Approval access are separate. A customer may have access to the Work Order but not
            necessarily to this specific approval.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setAccess('all')}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                access === 'all' ? 'border-navy bg-navy-50 text-navy' : 'border-line text-slate hover:bg-surface'
              }`}
            >
              All Mapped Customers
            </button>
            <button
              onClick={() => setAccess('selected')}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                access === 'selected' ? 'border-navy bg-navy-50 text-navy' : 'border-line text-slate hover:bg-surface'
              }`}
            >
              Selected Customers
            </button>
          </div>
          {access === 'selected' && <CustomerMultiSelect customers={CUSTOMERS} selected={selected} onChange={setSelected} />}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={save} className="btn-primary">
            Save Access
          </button>
        </div>
      </div>
    </div>
  );
};
