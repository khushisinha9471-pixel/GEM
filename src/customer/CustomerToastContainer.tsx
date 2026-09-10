import React from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import { useCustomerStore } from './customerStore';

export const CustomerToastContainer: React.FC = () => {
  const { state, dispatch } = useCustomerStore();

  React.useEffect(() => {
    const timers = state.toasts.map((t) => setTimeout(() => dispatch({ type: 'DISMISS_TOAST', id: t.id }), 4500));
    return () => timers.forEach(clearTimeout);
  }, [state.toasts, dispatch]);

  if (state.toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex w-80 flex-col gap-2">
      {state.toasts.map((t) => (
        <div key={t.id} className="flex items-start gap-2.5 rounded-xl border border-line bg-white px-4 py-3 shadow-pop">
          {t.tone === 'success' ? (
            <CheckCircle2 size={18} className="mt-0.5 flex-none text-emerald-600" />
          ) : (
            <Info size={18} className="mt-0.5 flex-none text-navy" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-navy">{t.title}</p>
            {t.body && <p className="mt-0.5 text-xs text-slate">{t.body}</p>}
          </div>
          <button onClick={() => dispatch({ type: 'DISMISS_TOAST', id: t.id })} className="text-slate hover:text-navy">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
