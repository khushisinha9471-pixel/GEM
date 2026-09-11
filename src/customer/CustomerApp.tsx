import React from 'react';
import { CustomerStoreProvider, useCustomerStore } from './customerStore';
import { WORK_ORDER } from '../data/seed';
import { CustomerHeader } from './CustomerHeader';
import { SummaryCards } from '../components/SummaryCards';
import { CustomerToolbar, DEFAULT_CUSTOMER_FILTERS, type CustomerFilters } from './CustomerToolbar';
import { ApprovalsTable } from '../components/ApprovalsTable';
import { CustomerToastContainer } from './CustomerToastContainer';
import { CustomerApprovalDetail } from './CustomerApprovalDetail';
import { searchableText } from '../utils/approvalHelpers';
import type { Approval, ApprovalStatus } from '../types';
import { ChevronRight } from 'lucide-react';

const CustomerAppShell: React.FC = () => {
  const { state } = useCustomerStore();
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<CustomerFilters>(DEFAULT_CUSTOMER_FILTERS);
  const [statusCard, setStatusCard] = React.useState<ApprovalStatus | 'All'>('All');
  const [selectedApprovalId, setSelectedApprovalId] = React.useState<string | null>(null);

  const approvals = state.approvals;
  const openCount = approvals.filter((a) => a.status === 'Open').length;
  const closedCount = approvals.filter((a) => a.status === 'Closed').length;

  const effectiveStatus: ApprovalStatus | 'All' = filters.status !== 'All' ? filters.status : statusCard;

  const filtered = approvals
    .filter((a) => (effectiveStatus === 'All' ? true : a.status === effectiveStatus))
    .filter((a) => (filters.approvalType === 'All' ? true : a.type === filters.approvalType))
    .filter((a) => (filters.subtype === 'All' ? true : a.subtype === filters.subtype))
    .filter((a) => (search.trim() === '' ? true : searchableText(a).includes(search.trim().toLowerCase())))
    .sort((a, b) => b.seq - a.seq);

  const selectedApproval = approvals.find((a) => a.id === selectedApprovalId) ?? null;

  return (
    <div className="min-h-screen bg-surface">
      <CustomerHeader onOpenApproval={setSelectedApprovalId} />

      <main className="mx-auto max-w-[1440px] px-6 py-6">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate">
          <span className="font-medium text-navy">Work Orders</span>
          <ChevronRight size={14} />
          <span className="font-medium text-navy">{WORK_ORDER.id}</span>
          <ChevronRight size={14} />
          <span>Approvals</span>
        </div>

        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-navy">Approvals</h1>
            <p className="mt-1 text-sm text-slate">
              <span className="font-semibold text-navy">Work Order:</span> {WORK_ORDER.id}
              <span className="mx-2 text-line">|</span>
              <span className="font-semibold text-navy">Engine:</span> {WORK_ORDER.engineModel} | ESN {WORK_ORDER.esn}
            </p>
          </div>
          <SummaryCards openCount={openCount} closedCount={closedCount} activeFilter={statusCard} onSelect={setStatusCard} />
        </div>

        <div className="mb-4">
          <CustomerToolbar search={search} onSearch={setSearch} filters={filters} onFilters={setFilters} />
        </div>

        <p className="mb-3 text-xs font-medium text-slate">
          Showing {filtered.length} of {approvals.length} approvals
        </p>

        <ApprovalsTable
          approvals={filtered}
          onOpen={(a: Approval) => setSelectedApprovalId(a.id)}
          customerColumnLabel="Your Response"
          customerEmptyLabel="Awaiting your response"
        />
      </main>

      <CustomerToastContainer />

      {selectedApproval && (
        <CustomerApprovalDetail approval={selectedApproval} onClose={() => setSelectedApprovalId(null)} />
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
