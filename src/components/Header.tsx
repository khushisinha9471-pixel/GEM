import React from 'react';
import { Bell, LayoutGrid, RefreshCw, Search, ChevronDown, Moon, CircleUserRound } from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown';

const GemLogo: React.FC = () => (
  <svg viewBox="0 0 24 24" className="h-9 w-9">
    <defs>
      <radialGradient id="gemLogoGrad" cx="50%" cy="50%" r="65%">
        <stop offset="0%" stopColor="#F7C948" />
        <stop offset="100%" stopColor="#C8860D" />
      </radialGradient>
    </defs>
    <g fill="url(#gemLogoGrad)">
      {Array.from({ length: 10 }).map((_, i) => (
        <ellipse key={i} cx="12" cy="6.2" rx="2.1" ry="5.3" transform={`rotate(${i * 36} 12 12)`} />
      ))}
    </g>
    <circle cx="12" cy="12" r="2.3" fill="#8A5A00" />
  </svg>
);

export const Header: React.FC<{ onOpenApproval: (id: string) => void }> = ({ onOpenApproval }) => {
  const [notifOpen, setNotifOpen] = React.useState(false);

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
        <button className="hidden items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-slate hover:bg-surface md:flex">
          <LayoutGrid size={14} />
          Switch portal
        </button>
        <span className="hidden text-xs text-slate/80 lg:block">Data as of 10 Sept 2026, 21:43:15 GMT+5:30</span>
        <button className="rounded-full p-1.5 hover:bg-surface" title="Refresh">
          <RefreshCw size={17} />
        </button>
        <div className="relative">
          <button className="rounded-full p-1.5 hover:bg-surface" onClick={() => setNotifOpen((v) => !v)} title="Notifications">
            <Bell size={17} />
          </button>
          {notifOpen && <NotificationsDropdown onClose={() => setNotifOpen(false)} onOpenApproval={onOpenApproval} />}
        </div>
        <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-surface">
          <CircleUserRound size={26} strokeWidth={1.5} className="text-slate" />
          <span className="hidden text-sm font-medium text-navy sm:block">Harini V</span>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
};
