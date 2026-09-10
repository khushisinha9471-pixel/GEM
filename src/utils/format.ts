export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} | ${formatTime(iso)}`;
}

export function formatCost(cost: number | null | undefined): string {
  if (cost === null || cost === undefined) return '—';
  return `$${cost.toLocaleString('en-US')}`;
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}

export function itemPartLabel(a: { partNumber?: string; partDescription?: string; engineeringItem?: string }): string {
  if (a.partNumber && a.partDescription) return `PN ${a.partNumber} — ${a.partDescription}`;
  if (a.partDescription) return a.partDescription;
  if (a.engineeringItem) return a.engineeringItem;
  return '—';
}
