import React, { createContext, useContext, useMemo, useReducer } from 'react';
import type { Approval, Attachment, ConversationMessage, CustomerDecision } from '../types';
import { INITIAL_APPROVALS } from '../data/seed';

export const CUSTOMER_PERSONA = { id: 'cust-a', name: 'Brian Whitman', initials: 'BW' };

let idSeq = 5000;
const genId = (prefix: string) => `${prefix}-${idSeq++}`;

export interface Toast {
  id: string;
  title: string;
  body?: string;
  tone: 'success' | 'info';
}

export interface CustomerNotification {
  id: string;
  approvalId: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
}

interface State {
  approvals: Approval[];
  notifications: CustomerNotification[];
  toasts: Toast[];
}

type Action =
  | { type: 'ADD_CUSTOMER_DECISION'; approvalId: string; decision: CustomerDecision; comment: string; attachments: Attachment[] }
  | { type: 'MARK_NOTIFICATION_READ'; id: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'DISMISS_TOAST'; id: string };

function nowIso() {
  return new Date().toISOString();
}

const DEFAULT_DECISION_TEXT: Record<CustomerDecision, string> = {
  Approved: 'Approved.',
  'Approved with Condition': 'Approved, subject to the condition noted.',
  Rejected: 'Not approved.',
  'Clarification Requested': 'Please provide more information before we can respond.',
  'Negotiation Requested': "We'd like to discuss this further before deciding.",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_CUSTOMER_DECISION': {
      const body = action.comment.trim() || DEFAULT_DECISION_TEXT[action.decision];
      const approvals = state.approvals.map((a) => {
        if (a.id !== action.approvalId) return a;
        const message: ConversationMessage = {
          id: genId('msg'),
          channel: 'customer',
          authorName: CUSTOMER_PERSONA.name,
          authorRole: 'Customer',
          body,
          date: nowIso(),
          attachments: action.attachments,
          decision: action.decision,
        };
        return {
          ...a,
          customerDecision: action.decision,
          messages: [...a.messages, message],
          audit: [
            ...a.audit,
            {
              id: genId('audit'),
              date: nowIso(),
              actor: CUSTOMER_PERSONA.name,
              action: 'Customer responded',
              detail: `Decision: ${action.decision}. ${body}`,
            },
          ],
        };
      });
      return {
        ...state,
        approvals,
        toasts: [...state.toasts, { id: genId('toast'), title: 'Response sent', body: 'Your response has been sent to the GEM team.', tone: 'success' }],
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
    default:
      return state;
  }
}

const initialState: State = {
  approvals: INITIAL_APPROVALS.filter((a) => a.access === 'all' || a.selectedCustomerIds.includes(CUSTOMER_PERSONA.id)),
  notifications: [
    {
      id: 'cnotif-1',
      approvalId: 'APP-001',
      title: 'Approval Requires Your Review',
      body: 'Approval APP-001 requires your review. Please review the additional repair requirement and provide your response.',
      date: '2026-09-10T10:16:00+05:30',
      read: false,
    },
    {
      id: 'cnotif-2',
      approvalId: 'APP-003',
      title: 'Approval Requires Your Review',
      body: 'Approval APP-003 requires your review. Please review the proposed exchange and confirm approval.',
      date: '2026-09-06T09:45:00+05:30',
      read: false,
    },
    {
      id: 'cnotif-3',
      approvalId: 'APP-004',
      title: 'Approval Requires Your Review',
      body: 'Approval APP-004 requires your review. Please confirm the price deviation is acceptable.',
      date: '2026-09-08T09:35:00+05:30',
      read: true,
    },
  ],
  toasts: [],
};

interface StoreValue {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const CustomerStoreContext = createContext<StoreValue | null>(null);

export const CustomerStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <CustomerStoreContext.Provider value={value}>{children}</CustomerStoreContext.Provider>;
};

export function useCustomerStore(): StoreValue {
  const ctx = useContext(CustomerStoreContext);
  if (!ctx) throw new Error('useCustomerStore must be used within CustomerStoreProvider');
  return ctx;
}

export function genCustomerAttachmentId() {
  return genId('att');
}
