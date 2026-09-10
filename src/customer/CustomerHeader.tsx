import React from 'react';
import { Bell, RefreshCw, Search, ChevronDown, Moon, CircleUserRound } from 'lucide-react';
import { CustomerNotificationsDropdown } from './CustomerNotificationsDropdown';
import { CUSTOMER_PERSONA, useCustomerStore } from './customerStore';
import { GemLogo } from '../components/GemLogo';

export const CustomerHeader: React.FC<{ onOpenApproval: (id: string) => void }> = ({ onOpenApproval }) => {
  const { state } = useCustomerStore();
  const [notifOpen, setNotifOpen] = React.useState(false);
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white px-6">
      <div className="flex items-center gap-3">
        <GemLogo />
        <span className="text-[17px] font-semibold tracking-tight text-navy">Global Engine Maintenance</span>
      </div>

      <div className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-line bg-surface/60 px-3 py-2 mx-8 md:flex">
        <Search size={16} className="text-slate" />
        <input
          className="w-full bg-transparent text-sm text-navy placeholder:text-slate/70 outline-none"
          placeholder="Search serial, work order, company…"
        />
      </div>

      <div className="flex items-center gap-4 text-slate">
        <button className="rounded-full p-1.5 hover:bg-surface" title="Toggle theme">
          <Moon size={17} />
        </button>
        <button className="rounded-full p-1.5 hover:bg-surface" title="Refresh">
          <RefreshCw size={17} />
        </button>
        <div className="relative">
          <button className="relative rounded-full p-1.5 hover:bg-surface" onClick={() => setNotifOpen((v) => !v)} title="Notifications">
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && <CustomerNotificationsDropdown onClose={() => setNotifOpen(false)} onOpenApproval={onOpenApproval} />}
        </div>
        <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-surface">
          <CircleUserRound size={26} strokeWidth={1.5} className="text-slate" />
          <span className="hidden text-sm font-medium text-navy sm:block">{CUSTOMER_PERSONA.name}</span>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
};
