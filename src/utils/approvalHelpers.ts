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

export function customerVisibleMessages(a: Approval): ConversationMessage[] {
  return a.messages
    .filter((m) => m.channel === 'customer' || m.channel === 'shared-to-customer')
    .sort((x, y) => (x.date < y.date ? -1 : 1));
}

export function internalMessages(a: Approval): ConversationMessage[] {
  return a.messages.filter((m) => m.channel === 'internal').sort((x, y) => (x.date < y.date ? -1 : 1));
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
