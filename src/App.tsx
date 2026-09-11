import React from 'react';
import { StoreProvider, useStore } from './state/store';
import { WORK_ORDER, CUSTOMERS } from './data/seed';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { Toolbar, DEFAULT_FILTERS, type Filters } from './components/Toolbar';
import { ApprovalsTable } from './components/ApprovalsTable';
import { ToastContainer } from './components/ToastContainer';
import { CreateApprovalModal } from './components/CreateApprovalModal';
import { ApprovalDetailPanel } from './components/ApprovalDetailPanel';
import { NotifyCustomerModal } from './components/NotifyCustomerModal';
import { CloseApprovalModal } from './components/CloseApprovalModal';
import { searchableText } from './utils/approvalHelpers';
import type { Approval, ApprovalStatus } from './types';

const AppShell: React.FC = () => {
  const { state, dispatch } = useStore();
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS);
  const [statusCard, setStatusCard] = React.useState<ApprovalStatus | 'All'>('All');
  const [createOpen, setCreateOpen] = React.useState(false);
  const [notifyOpen, setNotifyOpen] = React.useState<{ open: boolean; approvalId?: string }>({ open: false });
  const [selectedApprovalId, setSelectedApprovalId] = React.useState<string | null>(null);
  const [closeApprovalId, setCloseApprovalId] = React.useState<string | null>(null);

  const approvals = state.approvals;
  const openCount = approvals.filter((a) => a.status === 'Open').length;
  const closedCount = approvals.filter((a) => a.status === 'Closed').length;

  const effectiveStatus: ApprovalStatus | 'All' = filters.status !== 'All' ? filters.status : statusCard;

  const filtered = approvals
    .filter((a) => (effectiveStatus === 'All' ? true : a.status === effectiveStatus))
    .filter((a) => (filters.customerId === 'all' ? true : a.access === 'all' || a.selectedCustomerIds.includes(filters.customerId)))
    .filter((a) => (filters.approvalType === 'All' ? true : a.type === filters.approvalType))
    .filter((a) => (filters.subtype === 'All' ? true : a.subtype === filters.subtype))
    .filter((a) => (search.trim() === '' ? true : searchableText(a).includes(search.trim().toLowerCase())))
    .sort((a, b) => b.seq - a.seq);

  const selectedApproval = approvals.find((a) => a.id === selectedApprovalId) ?? null;
  const closeApproval = approvals.find((a) => a.id === closeApprovalId) ?? null;

  return (
    <div className="min-h-screen bg-surface">
      <Header onOpenApproval={setSelectedApprovalId} />

      <main className="mx-auto max-w-[1440px] px-6 py-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-8">
          <SummaryCards openCount={openCount} closedCount={closedCount} activeFilter={statusCard} onSelect={setStatusCard} />
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-navy">Customer Approvals</h1>
            <p className="mt-1 text-sm text-slate">
              <span className="font-semibold text-navy">Work Order:</span> {WORK_ORDER.id}
              <span className="mx-2 text-line">|</span>
              <span className="font-semibold text-navy">Engine:</span> {WORK_ORDER.engineModel} | ESN {WORK_ORDER.esn}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <Toolbar
            search={search}
            onSearch={setSearch}
            filters={filters}
            onFilters={setFilters}
            customers={CUSTOMERS}
            onCreate={() => setCreateOpen(true)}
            onNotify={() => setNotifyOpen({ open: true })}
          />
        </div>

        <p className="mb-3 text-xs font-medium text-slate">
          Showing {filtered.length} of {approvals.length} approvals
        </p>

        <ApprovalsTable
          approvals={filtered}
          role="csm"
          onOpenConversation={(a: Approval) => setSelectedApprovalId(a.id)}
          onReopen={(a: Approval) => dispatch({ type: 'REOPEN_APPROVAL', approvalId: a.id })}
          onRequestClose={(a: Approval) => setCloseApprovalId(a.id)}
          customerColumnLabel="Customer Comment"
        />
      </main>

      <ToastContainer />

      {createOpen && <CreateApprovalModal onClose={() => setCreateOpen(false)} onCreated={(id) => setSelectedApprovalId(id)} />}

      {selectedApproval && (
        <ApprovalDetailPanel
          approval={selectedApproval}
          onClose={() => setSelectedApprovalId(null)}
          onNotify={(id) => setNotifyOpen({ open: true, approvalId: id })}
          onRequestClose={(id) => setCloseApprovalId(id)}
        />
      )}

      {notifyOpen.open && (
        <NotifyCustomerModal
          initialApprovalId={notifyOpen.approvalId}
          onClose={() => setNotifyOpen({ open: false })}
        />
      )}

      {closeApproval && <CloseApprovalModal approval={closeApproval} onClose={() => setCloseApprovalId(null)} />}
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
