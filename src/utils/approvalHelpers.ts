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
