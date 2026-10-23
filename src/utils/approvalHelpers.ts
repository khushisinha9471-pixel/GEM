import type { Approval, ConversationMessage } from '../types';
import { DEMO_NOW } from '../data/seed';

export function latestCsmResponse(a: Approval): ConversationMessage | null {
  const msgs = a.messages.filter((m) => m.channel === 'customer' && m.authorRole === 'CSM');
  if (msgs.length === 0) return null;
  return msgs.reduce((latest, m) => (m.date > latest.date ? m : latest));
}

export function latestCustomerResponse(a: Approval): ConversationMessage | null {
  const msgs = a.messages.filter((m) => m.channel === 'customer' && m.authorRole === 'Customer');
  if (msgs.length === 0) return null;
  return msgs.reduce((latest, m) => (m.date > latest.date ? m : latest));
}

// Messages visible to the customer: anything on the 'customer' channel,
// including internal replies whose forward request was cc'd to the customer.
export function customerVisibleMessages(a: Approval): ConversationMessage[] {
  return a.messages.filter((m) => m.channel === 'customer').sort((x, y) => (x.date < y.date ? -1 : 1));
}

// Full merged conversation for the CSM view: customer-visible messages plus
// internal-only messages, in one chronological feed (internal ones are
// badged in the UI rather than split into a separate tab).
export function mergedConversation(a: Approval): ConversationMessage[] {
  return [...a.messages].sort((x, y) => (x.date < y.date ? -1 : 1));
}

// When the customer's decision (Approved/Rejected/etc.) was last recorded —
// from the message that carried it, or (when they left no comment) from the
// audit trail entry logged at decision time.
export function decisionDate(a: Approval): string | null {
  const decisionMessages = a.messages.filter((m) => m.decision).sort((x, y) => (x.date > y.date ? -1 : 1));
  if (decisionMessages.length > 0) return decisionMessages[0].date;
  const decisionAudits = a.audit.filter((e) => e.action === 'Customer responded').sort((x, y) => (x.date > y.date ? -1 : 1));
  if (decisionAudits.length > 0) return decisionAudits[0].date;
  return null;
}

// Timestamp to show under the Approval Request badge: when the decision was
// made, or — while still pending — when the CSM's message put the ball in
// the customer's court (falling back to when the approval was created).
export function approvalRequestUpdatedAt(a: Approval): string {
  return decisionDate(a) ?? latestCsmResponse(a)?.date ?? a.createdAt;
}

const OVERDUE_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

// Still awaiting a customer decision and has been open for more than 2 days
// (relative to the fixed demo "now", not the viewer's real clock).
export function isOverdue(a: Approval): boolean {
  if (a.status !== 'Open' || a.customerDecision) return false;
  return new Date(DEMO_NOW).getTime() - new Date(a.createdAt).getTime() > OVERDUE_THRESHOLD_MS;
}

export function searchableText(a: Approval): string {
  return [
    a.id,
    a.type,
    a.subtype ?? '',
    a.partNumber ?? '',
    a.partDescription ?? '',
    a.engineeringItem ?? '',
    a.requirement,
    a.cost != null ? String(a.cost) : '',
    a.status,
  ]
    .join(' ')
    .toLowerCase();
}

export type SortBy = 'none' | 'createdOn' | 'cost';
export type SortDir = 'asc' | 'desc';
export interface SortState {
  by: SortBy;
  dir: SortDir;
}
export const DEFAULT_SORT: SortState = { by: 'none', dir: 'asc' };

// The table's normal ordering when no explicit sort is chosen: Open
// approvals first (longest-open at the top), then Closed approvals
// (most recently closed at the top).
function defaultStatusSort(a: Approval, b: Approval): number {
  if (a.status !== b.status) return a.status === 'Open' ? -1 : 1;
  if (a.status === 'Open') {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  }
  const aClosed = new Date(a.closedAt ?? a.createdAt).getTime();
  const bClosed = new Date(b.closedAt ?? b.createdAt).getTime();
  return bClosed - aClosed;
}

export function sortApprovals(approvals: Approval[], sort: SortState): Approval[] {
  const list = [...approvals];
  if (sort.by === 'none') return list.sort(defaultStatusSort);
  if (sort.by === 'createdOn') {
    return list.sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sort.dir === 'asc' ? diff : -diff;
    });
  }
  // Cost — approvals with no cost sink to the bottom regardless of direction.
  return list.sort((a, b) => {
    if (a.cost == null && b.cost == null) return 0;
    if (a.cost == null) return 1;
    if (b.cost == null) return -1;
    const diff = a.cost - b.cost;
    return sort.dir === 'asc' ? diff : -diff;
  });
}
