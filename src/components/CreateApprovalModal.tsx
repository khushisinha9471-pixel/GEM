import React from 'react';
import { X } from 'lucide-react';
import { APPROVAL_TYPES, SUBTYPES_BY_TYPE } from '../types';
import type { ApprovalType, Attachment, Approval, ConversationMessage } from '../types';
import { useStore, genMessageId } from '../state/store';
import { CUSTOMERS } from '../data/seed';
import { AttachmentManager } from './AttachmentManager';
import { CustomerMultiSelect } from './CustomerMultiSelect';

export const CreateApprovalModal: React.FC<{ onClose: () => void; onCreated: (id: string) => void }> = ({
  onClose,
  onCreated,
}) => {
  const { dispatch, nextSeq } = useStore();

  const [approvalType, setApprovalType] = React.useState<ApprovalType | ''>('');
  const [subtype, setSubtype] = React.useState('');
  const [partNumber, setPartNumber] = React.useState('');
  const [partDescription, setPartDescription] = React.useState('');
  const [requirement, setRequirement] = React.useState('');
  const [cost, setCost] = React.useState('');
  const [expectedClosureDate, setExpectedClosureDate] = React.useState('');
  const [csmResponse, setCsmResponse] = React.useState('');
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [access, setAccess] = React.useState<'all' | 'selected'>('all');
  const [selectedCustomerIds, setSelectedCustomerIds] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const subtypeOptions = approvalType ? SUBTYPES_BY_TYPE[approvalType] : [];

  function validate() {
    const e: Record<string, string> = {};
    if (!approvalType) e.approvalType = 'Approval Type is required.';
    if (!requirement.trim()) e.requirement = 'Requirement is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate() || !approvalType) return;

    const seq = nextSeq();
    const id = `APP-${String(seq).padStart(3, '0')}`;
    const createdAt = new Date().toISOString();

    const messages: ConversationMessage[] = [];
    if (csmResponse.trim()) {
      messages.push({
        id: genMessageId(),
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: csmResponse.trim(),
        date: createdAt,
        attachments,
      });
    }

    const approval: Approval = {
      id,
      seq,
      type: approvalType,
      subtype: (subtype || null) as Approval['subtype'],
      partNumber: partNumber || undefined,
      partDescription: partDescription || undefined,
      requirement: requirement.trim(),
      cost: cost.trim() === '' ? null : Number(cost),
      status: 'Open',
      createdAt,
      access,
      selectedCustomerIds: access === 'selected' ? selectedCustomerIds : [],
      messages,
      forwardRequests: [],
      audit: [
        {
          id: `audit-${id}`,
          date: createdAt,
          actor: 'Harini V (CSM)',
          action: 'Approval created',
          detail: `${id} created as ${approvalType}${subtype ? ` — ${subtype}` : ''}. Status set to Open.`,
        },
      ],
      outcome: null,
      customerDecision: null,
      responseDueAt: expectedClosureDate ? `${expectedClosureDate}T23:59:59+05:30` : null,
    };

    dispatch({ type: 'CREATE_APPROVAL', approval });
    dispatch({
      type: 'ADD_TOAST',
      toast: {
        id: `toast-${id}`,
        title: 'Approval created',
        body: csmResponse.trim() ? 'Approval created and customer notified of your message.' : 'Approval created as Open.',
        tone: 'success',
      },
    });
    onCreated(id);
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-pop">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-navy">Create Approval</h2>
            <p className="text-xs text-slate">Fields marked with * are mandatory.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate hover:bg-surface hover:text-navy">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label className="field-label">Approval Type *</label>
            <select
              value={approvalType}
              onChange={(e) => {
                setApprovalType(e.target.value as ApprovalType);
                setSubtype('');
              }}
              className="select-input"
            >
              <option value="">Select an approval type</option>
              {APPROVAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.approvalType && <p className="mt-1 text-xs text-red-600">{errors.approvalType}</p>}
          </div>

          <div>
            <label className="field-label">Subtype</label>
            <select
              value={subtype}
              onChange={(e) => setSubtype(e.target.value)}
              disabled={!approvalType || subtypeOptions.length === 0}
              className="select-input disabled:cursor-not-allowed disabled:bg-surface/60 disabled:text-slate/60"
            >
              <option value="">{!approvalType ? 'Select an Approval Type first' : subtypeOptions.length === 0 ? 'No Subtype' : 'Select a subtype (optional)'}</option>
              {subtypeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Part</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                placeholder="Part Number (e.g. 123456)"
                className="field-input"
              />
              <input
                value={partDescription}
                onChange={(e) => setPartDescription(e.target.value)}
                placeholder="Description (e.g. HPT Blade)"
                className="field-input"
              />
            </div>
            {(partNumber || partDescription) && (
              <p className="mt-1.5 text-xs text-slate">
                Preview: <span className="font-medium text-navy">{partNumber ? `PN ${partNumber}` : ''}{partNumber && partDescription ? ' — ' : ''}{partDescription}</span>
              </p>
            )}
          </div>

          <div>
            <label className="field-label">Requirement *</label>
            <textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              rows={4}
              placeholder="What needs approval, and why — e.g. HPT blade needs additional repair beyond the approved workscope."
              className="textarea-input"
            />
            {errors.requirement && <p className="mt-1 text-xs text-red-600">{errors.requirement}</p>}
          </div>

          <div>
            <label className="field-label">Cost</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate">$</span>
              <input
                value={cost}
                onChange={(e) => setCost(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="12,500"
                className="field-input pl-6"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Expected Approval Closure Date</label>
            <input
              type="date"
              value={expectedClosureDate}
              onChange={(e) => setExpectedClosureDate(e.target.value)}
              className="field-input"
            />
            <p className="mt-1 text-xs text-slate">
              Used to flag this approval as overdue if it's still awaiting a decision after this date.
            </p>
          </div>

          <div>
            <label className="field-label">GEM Comment</label>
            <textarea
              value={csmResponse}
              onChange={(e) => setCsmResponse(e.target.value)}
              rows={3}
              placeholder="Your additional message to the customer"
              className="textarea-input"
            />
          </div>

          <AttachmentManager attachments={attachments} onChange={setAttachments} />

          <div>
            <label className="field-label">Approval Access</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAccess('all')}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                  access === 'all' ? 'border-navy bg-navy-50 text-navy' : 'border-line text-slate hover:bg-surface'
                }`}
              >
                All Mapped Customers
              </button>
              <button
                type="button"
                onClick={() => setAccess('selected')}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                  access === 'selected' ? 'border-navy bg-navy-50 text-navy' : 'border-line text-slate hover:bg-surface'
                }`}
              >
                Selected Customers
              </button>
            </div>
            {access === 'selected' && (
              <div className="mt-2">
                <CustomerMultiSelect customers={CUSTOMERS} selected={selectedCustomerIds} onChange={setSelectedCustomerIds} />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary">
            Create Approval
          </button>
        </div>
      </div>
    </div>
  );
};
