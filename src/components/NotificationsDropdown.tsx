import React from 'react';
import { useStore } from '../state/store';
import { formatDateTime } from '../utils/format';
import { CheckCheck, MessageSquareText, UserRound } from 'lucide-react';

export const NotificationsDropdown: React.FC<{ onClose: () => void; onOpenApproval?: (id: string) => void }> = ({
  onClose,
  onOpenApproval,
}) => {
  const { state, dispatch } = useStore();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const notifications = [...state.notifications].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div ref={ref} className="absolute right-0 top-10 z-40 w-96 overflow-hidden rounded-xl border border-line bg-white shadow-pop">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="text-sm font-semibold text-navy">Notifications</span>
        <button
          className="flex items-center gap-1 text-xs font-medium text-slate hover:text-navy"
          onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}
        >
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 && <div className="px-4 py-6 text-center text-sm text-slate">No notifications yet.</div>}
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => {
              dispatch({ type: 'MARK_NOTIFICATION_READ', id: n.id });
              onOpenApproval?.(n.approvalId);
              onClose();
            }}
            className={`flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left last:border-0 hover:bg-surface/60 ${
              n.read ? 'bg-white' : 'bg-navy-50/50'
            }`}
          >
            <div
              className={`mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full ${
                n.kind === 'internal-response' ? 'bg-navy-100 text-navy' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {n.kind === 'internal-response' ? <UserRound size={15} /> : <MessageSquareText size={15} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-navy">{n.title}</span>
                {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-slate">{n.body}</p>
              <span className="mt-1 block text-[11px] text-slate/70">{formatDateTime(n.date)}</span>
              <span className="mt-1 inline-block text-xs font-medium text-navy">View →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
