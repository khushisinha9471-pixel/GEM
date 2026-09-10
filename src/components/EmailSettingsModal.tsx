import React from 'react';
import { X, Mail, CheckCircle2, FlaskConical } from 'lucide-react';
import { useStore } from '../state/store';

export const EmailSettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state, dispatch } = useStore();
  const [testStatus, setTestStatus] = React.useState<'idle' | 'sending' | 'received'>('idle');

  function connect(provider: 'Gmail' | 'Outlook') {
    const account = provider === 'Gmail' ? 'harini.v@gem-mro.com' : 'harini.v@gem-mro.onmicrosoft.com';
    dispatch({ type: 'SET_EMAIL_CONNECTION', provider, account });
  }

  function runTest() {
    setTestStatus('sending');
    setTimeout(() => setTestStatus('received'), 1400);
  }

  return (
    <div className="modal-overlay-center">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-pop">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-navy">Email Integration Settings</h2>
            <p className="text-xs text-slate">Connect the mailbox used to forward approvals to internal team members.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate hover:bg-surface hover:text-navy">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="grid grid-cols-2 gap-3">
            {(['Gmail', 'Outlook'] as const).map((p) => {
              const connected = state.emailConnection.provider === p;
              return (
                <button
                  key={p}
                  onClick={() => connect(p)}
                  className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left ${
                    connected ? 'border-navy bg-navy-50' : 'border-line hover:bg-surface'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <Mail size={18} className="text-navy" />
                    {connected && <CheckCircle2 size={16} className="text-emerald-600" />}
                  </div>
                  <span className="text-sm font-semibold text-navy">{p}</span>
                  <span className="text-xs text-slate">{connected ? 'Connected' : 'Not connected'}</span>
                </button>
              );
            })}
          </div>

          {state.emailConnection.provider && (
            <div className="rounded-lg border border-line bg-surface/40 p-3 text-xs text-navy">
              Connected as <span className="font-semibold">{state.emailConnection.account}</span> via{' '}
              {state.emailConnection.provider}. Internal forwarding emails will be sent from this mailbox, and replies
              are monitored automatically to capture responses against the correct Approval ID.
            </div>
          )}

          <div className="rounded-xl border border-line p-4">
            <p className="text-sm font-semibold text-navy">Test Mailbox</p>
            <p className="mt-1 text-xs text-slate">
              Verify the end-to-end flow: send a test request, have the test recipient reply, and confirm Certra
              captures the response automatically.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <button onClick={runTest} disabled={testStatus === 'sending'} className="btn-secondary">
                <FlaskConical size={14} />
                {testStatus === 'idle' && 'Run Test Round-Trip'}
                {testStatus === 'sending' && 'Sending to test mailbox…'}
                {testStatus === 'received' && 'Run Again'}
              </button>
              {testStatus === 'received' && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 size={14} /> Reply captured successfully — connection verified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">
          <button onClick={onClose} className="btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
