import React from 'react';
import { Bell, RefreshCw, Search, ChevronDown } from 'lucide-react';
import { CustomerNotificationsDropdown } from './CustomerNotificationsDropdown';
import { CUSTOMER_PERSONA } from './customerStore';

export const CustomerHeader: React.FC<{ onOpenApproval: (id: string) => void }> = ({ onOpenApproval }) => {
  const [notifOpen, setNotifOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M12 2 2 7l10 5 10-5-10-5Zm0 7.5L4 5.6v3L12 13l8-4.4v-3L12 9.5ZM4 11.4v3.1L12 19l8-4.5v-3.1l-8 4.4-8-4.4Z" />
          </svg>
        </div>
        <span className="text-[17px] font-semibold tracking-tight text-navy">Global Engine Maintenance</span>
        <span className="ml-1 rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate">
          Customer Portal
        </span>
      </div>

      <div className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-line bg-surface/60 px-3 py-2 mx-8 md:flex">
        <Search size={16} className="text-slate" />
        <input
          className="w-full bg-transparent text-sm text-navy placeholder:text-slate/70 outline-none"
          placeholder="Search work order, serial…"
        />
      </div>

      <div className="flex items-center gap-4 text-slate">
        <span className="hidden text-xs text-slate/80 lg:block">Data as of 10 Sept 2026, 21:43 GMT+5:30</span>
        <button className="rounded-full p-1.5 hover:bg-surface" title="Refresh">
          <RefreshCw size={17} />
        </button>
        <div className="relative">
          <button className="rounded-full p-1.5 hover:bg-surface" onClick={() => setNotifOpen((v) => !v)} title="Notifications">
            <Bell size={17} />
          </button>
          {notifOpen && <CustomerNotificationsDropdown onClose={() => setNotifOpen(false)} onOpenApproval={onOpenApproval} />}
        </div>
        <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-surface">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-100 text-xs font-semibold text-navy">
            {CUSTOMER_PERSONA.initials}
          </span>
          <span className="hidden text-sm font-medium text-navy sm:block">{CUSTOMER_PERSONA.name}</span>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
};
