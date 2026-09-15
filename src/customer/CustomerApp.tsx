import React from 'react';
import { CustomerStoreProvider, useCustomerStore } from './customerStore';
import { WORK_ORDER } from '../data/seed';
import { CustomerHeader } from './CustomerHeader';
import { SummaryCards } from '../components/SummaryCards';
import { CustomerToolbar, DEFAULT_CUSTOMER_FILTERS, type CustomerFilters } from './CustomerToolbar';
import { ApprovalsTable } from '../components/ApprovalsTable';
import { CustomerToastContainer } from './CustomerToastContainer';
import { CustomerApprovalDetail } from './CustomerApprovalDetail';
import { searchableText, serialNumberOf, isOverdue, pendingApprovalValue } from '../utils/approvalHelpers';
import type { Approval, ApprovalStatus, CustomerDecision } from '../types';

const CustomerAppShell: React.FC = () => {
  const { state, dispatch } = useCustomerStore();
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<CustomerFilters>(DEFAULT_CUSTOMER_FILTERS);
  const [statusCard, setStatusCard] = React.useState<ApprovalStatus | 'All'>('All');
  const [overdueOnly, setOverdueOnly] = React.useState(false);
  const [selectedApprovalId, setSelectedApprovalId] = React.useState<string | null>(null);
  const [draftDecision, setDraftDecision] = React.useState<CustomerDecision | null>(null);

  const approvals = state.approvals;
  const openCount = approvals.filter((a) => a.status === 'Open').length;
  const overdueCount = approvals.filter(isOverdue).length;
  const pendingValue = pendingApprovalValue(approvals);

  const effectiveStatus: ApprovalStatus | 'All' = filters.status !== 'All' ? filters.status : statusCard;

  const filtered = approvals
    .filter((a) => (effectiveStatus === 'All' ? true : a.status === effectiveStatus))
    .filter((a) => (overdueOnly ? isOverdue(a) : true))
    .filter((a) => (filters.approvalType === 'All' ? true : a.type === filters.approvalType))
    .filter((a) =>
      filters.decision === 'All'
        ? true
        : filters.decision === 'Awaiting Decision'
        ? !a.customerDecision
        : a.customerDecision === filters.decision
    )
    .filter((a) => (search.trim() === '' ? true : searchableText(a).includes(search.trim().toLowerCase())))
    .sort((a, b) => a.seq - b.seq);

  const selectedApproval = approvals.find((a) => a.id === selectedApprovalId) ?? null;
  const selectedSerial = serialNumberOf(approvals, filtered, selectedApprovalId);

  function handleQuickDecision(a: Approval, decision: CustomerDecision) {
    dispatch({ type: 'ADD_CUSTOMER_DECISION', approvalId: a.id, decision, comment: '', attachments: [] });
  }

  function openApproval(id: string, decision?: CustomerDecision) {
    setSelectedApprovalId(id);
    setDraftDecision(decision ?? null);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface">
      <CustomerHeader onOpenApproval={(id) => openApproval(id)} />

      <div className="flex flex-1 flex-col overflow-hidden px-8">
        <div className="flex-none pb-4 pt-6">
          <h1 className="text-[26px] font-bold tracking-tight text-navy">Approvals</h1>
          <p className="mt-1 text-sm text-slate">
            <span className="font-semibold text-navy">Work Order:</span> {WORK_ORDER.id}
            <span className="mx-2 text-line">|</span>
            <span className="font-semibold text-navy">Engine:</span> {WORK_ORDER.engineModel} | ESN {WORK_ORDER.esn}
          </p>

          <div className="mt-4">
            <SummaryCards
              openCount={openCount}
              overdueCount={overdueCount}
              pendingValue={pendingValue}
              openActive={statusCard === 'Open'}
              overdueActive={overdueOnly}
              onToggleOpen={() => setStatusCard((c) => (c === 'Open' ? 'All' : 'Open'))}
              onToggleOverdue={() => setOverdueOnly((v) => !v)}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium text-slate">
              Showing {filtered.length} of {approvals.length} approvals
            </p>
            <CustomerToolbar search={search} onSearch={setSearch} filters={filters} onFilters={setFilters} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-6">
          <ApprovalsTable
            approvals={filtered}
            role="customer"
            onOpenConversation={(a: Approval, decision) => openApproval(a.id, decision)}
            onQuickDecision={handleQuickDecision}
            customerColumnLabel="Your Comment"
          />
        </div>
      </div>

      <CustomerToastContainer />

      {selectedApproval && (
        <CustomerApprovalDetail
          approval={selectedApproval}
          serial={selectedSerial ?? 0}
          initialDecision={draftDecision}
          onClose={() => {
            setSelectedApprovalId(null);
            setDraftDecision(null);
          }}
        />
      )}
    </div>
  );
};

export default function CustomerApp() {
  return (
    <CustomerStoreProvider>
      <CustomerAppShell />
    </CustomerStoreProvider>
  );
}
