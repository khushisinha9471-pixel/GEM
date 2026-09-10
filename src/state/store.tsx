import React, { createContext, useContext, useMemo, useReducer, useCallback } from 'react';
import type {
  Approval,
  AppNotification,
  ConversationMessage,
  InternalForwardRequest,
  Attachment,
  FinalOutcome,
} from '../types';
import { INITIAL_APPROVALS, nextApprovalSeq, CUSTOMERS } from '../data/seed';

let idSeq = 1000;
const genId = (prefix: string) => `${prefix}-${idSeq++}`;

export interface Toast {
  id: string;
  title: string;
  body?: string;
  tone: 'success' | 'info';
}

interface State {
  approvals: Approval[];
  notifications: AppNotification[];
  toasts: Toast[];
  emailConnection: { provider: 'Gmail' | 'Outlook' | null; account: string | null };
}

type Action =
  | { type: 'CREATE_APPROVAL'; approval: Approval }
  | { type: 'ADD_CSM_MESSAGE'; approvalId: string; body: string; attachments: Attachment[] }
  | { type: 'SIMULATE_CUSTOMER_REPLY'; approvalId: string; body: string }
  | { type: 'FORWARD_TO_INTERNAL'; approvalId: string; forwardRequest: InternalForwardRequest }
  | { type: 'SIMULATE_MAILBOX_REPLY'; approvalId: string; forwardRequestId: string; body: string }
  | {
      type: 'SHARE_WITH_CUSTOMER';
      approvalId: string;
      sourceMessageId: string;
      context?: string;
      customerIds: string[] | 'all';
    }
  | { type: 'KEEP_INTERNAL'; approvalId: string; messageId: string }
  | { type: 'NOTIFY_CUSTOMER'; approvalId: string; customerIds: string[] | 'all'; message: string }
  | { type: 'UPDATE_ACCESS'; approvalId: string; access: 'all' | 'selected'; selectedCustomerIds: string[] }
  | { type: 'CLOSE_APPROVAL'; approvalId: string; outcome: FinalOutcome }
  | { type: 'REOPEN_APPROVAL'; approvalId: string }
  | { type: 'DELETE_APPROVAL'; approvalId: string }
  | { type: 'MARK_NOTIFICATION_READ'; id: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'DISMISS_TOAST'; id: string }
  | { type: 'SET_EMAIL_CONNECTION'; provider: 'Gmail' | 'Outlook'; account: string };

function nowIso() {
  return new Date().toISOString();
}

function updateApproval(state: State, id: string, fn: (a: Approval) => Approval): Approval[] {
  return state.approvals.map((a) => (a.id === id ? fn(a) : a));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'CREATE_APPROVAL': {
      return { ...state, approvals: [action.approval, ...state.approvals] };
    }
    case 'ADD_CSM_MESSAGE': {
      const approvals = updateApproval(state, action.approvalId, (a) => ({
        ...a,
        messages: [
          ...a.messages,
          {
            id: genId('msg'),
            channel: 'customer',
            authorName: 'Harini V',
            authorRole: 'CSM',
            body: action.body,
            date: nowIso(),
            attachments: action.attachments,
          } as ConversationMessage,
        ],
        audit: [
          ...a.audit,
          { id: genId('audit'), date: nowIso(), actor: 'Harini V (CSM)', action: 'CSM response sent', detail: action.body },
        ],
      }));
      return { ...state, approvals };
    }
    case 'SIMULATE_CUSTOMER_REPLY': {
      let approvalLabel = action.approvalId;
      const approvals = updateApproval(state, action.approvalId, (a) => {
        approvalLabel = `${a.id} – ${a.subtype ?? a.type}`;
        const customerName = CUSTOMERS.find((c) => a.selectedCustomerIds.includes(c.id))?.name ?? CUSTOMERS[0].name;
        return {
          ...a,
          messages: [
            ...a.messages,
            {
              id: genId('msg'),
              channel: 'customer',
              authorName: a.access === 'selected' ? customerName : 'Customer',
              authorRole: 'Customer',
              body: action.body,
              date: nowIso(),
              attachments: [],
            } as ConversationMessage,
          ],
          audit: [
            ...a.audit,
            { id: genId('audit'), date: nowIso(), actor: 'Customer', action: 'Customer responded', detail: action.body },
          ],
        };
      });
      const notif: AppNotification = {
        id: genId('notif'),
        kind: 'customer-response',
        approvalId: action.approvalId,
        title: 'Customer Response Received',
        body: `${approvalLabel} – Customer has responded to the approval.`,
        date: nowIso(),
        read: false,
      };
      return {
        ...state,
        approvals,
        notifications: [notif, ...state.notifications],
        toasts: [...state.toasts, { id: genId('toast'), title: 'Customer response received', body: approvalLabel, tone: 'info' }],
      };
    }
    case 'FORWARD_TO_INTERNAL': {
      const approvals = updateApproval(state, action.approvalId, (a) => ({
        ...a,
        forwardRequests: [...a.forwardRequests, action.forwardRequest],
        audit: [
          ...a.audit,
          {
            id: genId('audit'),
            date: nowIso(),
            actor: 'Harini V (CSM)',
            action: 'Forwarded to internal member',
            detail: `Sent to ${action.forwardRequest.recipientName} (${action.forwardRequest.recipientRole}) via ${action.forwardRequest.sentVia} — ${action.forwardRequest.requestType}.`,
          },
        ],
      }));
      return {
        ...state,
        approvals,
        toasts: [
          ...state.toasts,
          {
            id: genId('toast'),
            title: 'Email sent',
            body: `[${action.approvalId}] request sent to ${action.forwardRequest.recipientName} via ${action.forwardRequest.sentVia}`,
            tone: 'success',
          },
        ],
      };
    }
    case 'SIMULATE_MAILBOX_REPLY': {
      let approvalLabel = action.approvalId;
      let responderName = 'Internal Member';
      const newMsgId = genId('msg');
      const approvals = updateApproval(state, action.approvalId, (a) => {
        const fwd = a.forwardRequests.find((f) => f.id === action.forwardRequestId);
        approvalLabel = `${a.id} – ${a.partDescription ?? a.engineeringItem ?? a.type} – ${a.subtype ?? ''}`.trim();
        responderName = fwd?.recipientName ?? 'Internal Member';
        return {
          ...a,
          forwardRequests: a.forwardRequests.map((f) =>
            f.id === action.forwardRequestId ? { ...f, status: 'responded', responseMessageId: newMsgId } : f
          ),
          messages: [
            ...a.messages,
            {
              id: newMsgId,
              channel: 'internal',
              authorName: fwd?.recipientName ?? 'Internal Member',
              authorRole: 'Internal',
              authorTitle: fwd?.recipientRole,
              body: action.body,
              date: nowIso(),
              attachments: [att_engineering()],
              capturedFromEmail: true,
            } as ConversationMessage,
          ],
          audit: [
            ...a.audit,
            {
              id: genId('audit'),
              date: nowIso(),
              actor: fwd?.recipientName ?? 'Internal Member',
              action: 'Internal email response captured',
              detail: `Captured automatically from email reply via ${fwd?.sentVia ?? 'email'}.`,
            },
          ],
        };
      });
      const notif: AppNotification = {
        id: genId('notif'),
        kind: 'internal-response',
        approvalId: action.approvalId,
        title: 'Internal Response Received',
        body: `${approvalLabel} — ${responderName} has responded to your request.`,
        date: nowIso(),
        read: false,
      };
      return {
        ...state,
        approvals,
        notifications: [notif, ...state.notifications],
        toasts: [
          ...state.toasts,
          { id: genId('toast'), title: 'Internal response captured from email', body: `${responderName} replied on ${action.approvalId}`, tone: 'success' },
        ],
      };
    }
    case 'SHARE_WITH_CUSTOMER': {
      const approvals = updateApproval(state, action.approvalId, (a) => {
        const source = a.messages.find((m) => m.id === action.sourceMessageId);
        if (!source) return a;
        const sharedMsg: ConversationMessage = {
          id: genId('msg'),
          channel: 'shared-to-customer',
          authorName: source.authorName,
          authorRole: source.authorRole,
          authorTitle: source.authorTitle,
          body: source.body,
          date: nowIso(),
          attachments: source.attachments,
          sharedFromMessageId: source.id,
          sharedByCsmName: 'Harini V',
          sharedContext: action.context,
        };
        return {
          ...a,
          messages: a.messages
            .map((m): ConversationMessage => (m.id === source.id ? { ...m, internalDecision: 'shared' as const } : m))
            .concat(sharedMsg),
          audit: [
            ...a.audit,
            {
              id: genId('audit'),
              date: nowIso(),
              actor: 'Harini V (CSM)',
              action: 'Shared internal response with customer',
              detail: `Response from ${source.authorName} shared with ${
                action.customerIds === 'all' ? 'all mapped customers' : `${action.customerIds.length} selected customer(s)`
              }.`,
            },
          ],
        };
      });
      return {
        ...state,
        approvals,
        toasts: [...state.toasts, { id: genId('toast'), title: 'Response shared with customer', tone: 'success' }],
      };
    }
    case 'KEEP_INTERNAL': {
      const approvals = updateApproval(state, action.approvalId, (a) => ({
        ...a,
        messages: a.messages.map(
          (m): ConversationMessage => (m.id === action.messageId ? { ...m, internalDecision: 'kept-internal' as const } : m)
        ),
        audit: [
          ...a.audit,
          { id: genId('audit'), date: nowIso(), actor: 'Harini V (CSM)', action: 'Internal response kept internal', detail: undefined },
        ],
      }));
      return { ...state, approvals };
    }
    case 'NOTIFY_CUSTOMER': {
      const approvals = updateApproval(state, action.approvalId, (a) => ({
        ...a,
        audit: [
          ...a.audit,
          {
            id: genId('audit'),
            date: nowIso(),
            actor: 'Harini V (CSM)',
            action: 'Customer notification sent',
            detail: `Notified ${action.customerIds === 'all' ? 'all mapped customers' : `${action.customerIds.length} selected customer(s)`}: "${action.message}"`,
          },
        ],
      }));
      return {
        ...state,
        approvals,
        toasts: [...state.toasts, { id: genId('toast'), title: 'Notification sent to customer', body: action.approvalId, tone: 'success' }],
      };
    }
    case 'UPDATE_ACCESS': {
      const approvals = updateApproval(state, action.approvalId, (a) => ({
        ...a,
        access: action.access,
        selectedCustomerIds: action.selectedCustomerIds,
        audit: [
          ...a.audit,
          {
            id: genId('audit'),
            date: nowIso(),
            actor: 'Harini V (CSM)',
            action: 'Approval access updated',
            detail: action.access === 'all' ? 'Access set to All Mapped Customers.' : `Access set to ${action.selectedCustomerIds.length} selected customer(s).`,
          },
        ],
      }));
      return { ...state, approvals, toasts: [...state.toasts, { id: genId('toast'), title: 'Approval access updated', tone: 'success' }] };
    }
    case 'CLOSE_APPROVAL': {
      const approvals = updateApproval(state, action.approvalId, (a) => ({
        ...a,
        status: 'Closed',
        outcome: action.outcome,
        closedAt: nowIso(),
        audit: [
          ...a.audit,
          { id: genId('audit'), date: nowIso(), actor: 'Harini V (CSM)', action: 'Status changed to Closed', detail: `Final Outcome recorded: ${action.outcome}.` },
        ],
      }));
      return { ...state, approvals, toasts: [...state.toasts, { id: genId('toast'), title: 'Approval closed', body: action.outcome, tone: 'success' }] };
    }
    case 'REOPEN_APPROVAL': {
      const approvals = updateApproval(state, action.approvalId, (a) => ({
        ...a,
        status: 'Open',
        audit: [...a.audit, { id: genId('audit'), date: nowIso(), actor: 'Harini V (CSM)', action: 'Status changed to Open', detail: 'Approval reopened.' }],
      }));
      return { ...state, approvals };
    }
    case 'DELETE_APPROVAL': {
      const deleted = state.approvals.find((a) => a.id === action.approvalId);
      return {
        ...state,
        approvals: state.approvals.filter((a) => a.id !== action.approvalId),
        notifications: state.notifications.filter((n) => n.approvalId !== action.approvalId),
        toasts: [
          ...state.toasts,
          { id: genId('toast'), title: 'Approval deleted', body: deleted?.id, tone: 'info' },
        ],
      };
    }
    case 'MARK_NOTIFICATION_READ': {
      return { ...state, notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)) };
    }
    case 'MARK_ALL_NOTIFICATIONS_READ': {
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    }
    case 'ADD_TOAST': {
      return { ...state, toasts: [...state.toasts, action.toast] };
    }
    case 'DISMISS_TOAST': {
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    }
    case 'SET_EMAIL_CONNECTION': {
      return { ...state, emailConnection: { provider: action.provider, account: action.account } };
    }
    default:
      return state;
  }
}

function att_engineering(): Attachment {
  return {
    id: genId('att'),
    name: 'Engineering_Recommendation.pdf',
    source: 'email',
    date: new Date().toISOString().slice(0, 10),
  };
}

const initialState: State = {
  approvals: INITIAL_APPROVALS,
  notifications: [
    {
      id: 'notif-seed-1',
      kind: 'customer-response',
      approvalId: 'APP-001',
      title: 'Customer Response Received',
      body: 'APP-001 – Additional Repair – HPT Blade. Customer has responded to the approval.',
      date: '2026-09-10T14:20:00+05:30',
      read: true,
    },
  ],
  toasts: [],
  emailConnection: { provider: 'Gmail', account: 'khushi.work9471@gmail.com' },
};

interface StoreValue {
  state: State;
  dispatch: React.Dispatch<Action>;
  nextSeq: () => number;
}

const StoreContext = createContext<StoreValue | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const nextSeq = useCallback(() => nextApprovalSeq(state.approvals), [state.approvals]);
  const value = useMemo(() => ({ state, dispatch, nextSeq }), [state, nextSeq]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function genAttachmentId() {
  return genId('att');
}
export function genMessageId() {
  return genId('msg');
}
export function genForwardId() {
  return genId('fwd');
}
