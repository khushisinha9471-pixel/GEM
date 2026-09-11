import type { Approval, ConversationMessage } from '../types';

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

// Matches the row number shown in the table's S.No. column for this approval:
// its position in the currently filtered/sorted list, falling back to its
// position in the full default-sorted list if it's no longer in view.
export function serialNumberOf(approvals: Approval[], filtered: Approval[], id: string | null): number | null {
  if (!id) return null;
  const idxFiltered = filtered.findIndex((a) => a.id === id);
  if (idxFiltered >= 0) return idxFiltered + 1;
  const base = [...approvals].sort((a, b) => b.seq - a.seq);
  const idxBase = base.findIndex((a) => a.id === id);
  return idxBase >= 0 ? idxBase + 1 : null;
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
