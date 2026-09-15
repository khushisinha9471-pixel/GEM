import React from 'react';
import { StoreProvider, useStore } from './state/store';
import { WORK_ORDER } from './data/seed';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { Toolbar, DEFAULT_FILTERS, type Filters } from './components/Toolbar';
import { ApprovalsTable } from './components/ApprovalsTable';
import { ToastContainer } from './components/ToastContainer';
import { CreateApprovalModal } from './components/CreateApprovalModal';
import { ApprovalDetailPanel } from './components/ApprovalDetailPanel';
import { searchableText, isOverdue, pendingApprovalValue } from './utils/approvalHelpers';
import type { Approval, ApprovalStatus } from './types';

const AppShell: React.FC = () => {
  const { state, dispatch } = useStore();
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS);
  const [statusCard, setStatusCard] = React.useState<ApprovalStatus | 'All'>('All');
  const [overdueOnly, setOverdueOnly] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [selectedApprovalId, setSelectedApprovalId] = React.useState<string | null>(null);

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
    .sort((a, b) => b.seq - a.seq);

  const selectedApproval = approvals.find((a) => a.id === selectedApprovalId) ?? null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface">
      <Header onOpenApproval={setSelectedApprovalId} />

      <div className="flex flex-1 flex-col overflow-hidden px-8">
        <div className="flex-none pb-4 pt-6">
          <h1 className="text-[26px] font-bold tracking-tight text-navy">Customer Approvals</h1>
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
            <Toolbar
              search={search}
              onSearch={setSearch}
              filters={filters}
              onFilters={setFilters}
              onCreate={() => setCreateOpen(true)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-6">
          <ApprovalsTable
            approvals={filtered}
            role="csm"
            onOpenConversation={(a: Approval) => setSelectedApprovalId(a.id)}
            onReopen={(a: Approval) => dispatch({ type: 'REOPEN_APPROVAL', approvalId: a.id })}
            onRequestClose={(a: Approval) => dispatch({ type: 'REQUEST_CLOSE', approvalId: a.id })}
            customerColumnLabel="Customer Comment"
          />
        </div>
      </div>

      <ToastContainer />

      {createOpen && <CreateApprovalModal onClose={() => setCreateOpen(false)} onCreated={(id) => setSelectedApprovalId(id)} />}

      {selectedApproval && (
        <ApprovalDetailPanel
          approval={selectedApproval}
          serial={selectedApproval.seq}
          onClose={() => setSelectedApprovalId(null)}
          onRequestClose={(id) => dispatch({ type: 'REQUEST_CLOSE', approvalId: id })}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}
