import type {
  Approval,
  AuditEvent,
  Attachment,
  Customer,
  InternalMember,
  ReportLibraryItem,
  ConversationMessage,
} from '../types';

export const WORK_ORDER = {
  id: 'WO-2026-00125',
  engineModel: 'CFM56-7B',
  esn: '897300',
};

// Fixed "as of" reference time for this demo dataset (matches the "Data as
// of" text in the CSM header) — used instead of the real browser clock so
// overdue/pending calculations stay deterministic regardless of when the
// artifact is actually viewed.
export const DEMO_NOW = '2026-09-10T21:43:15+05:30';

export const CUSTOMERS: Customer[] = [
  { id: 'cust-a', name: 'Sarah Mitchell' },
  { id: 'cust-b', name: 'David Chen' },
  { id: 'cust-c', name: 'Priya Patel' },
  { id: 'cust-d', name: 'James Anderson' },
];

export const INTERNAL_MEMBERS: InternalMember[] = [
  { id: 'int-muazzi', name: 'Muazzi', role: 'Engineering VP', email: 'muazzi@gem-mro.com' },
  { id: 'int-priya', name: 'Priya Nair', role: 'Reliability Engineer', email: 'priya.nair@gem-mro.com' },
  { id: 'int-james', name: 'James Carter', role: 'Cost Analyst', email: 'james.carter@gem-mro.com' },
];

export const REQUEST_TYPES = [
  'Technical Recommendation',
  'Repair Recommendation',
  'Replacement Recommendation',
  'Engineering Review',
  'Cost Review',
  'Other',
];

export const REPORTS_LIBRARY: ReportLibraryItem[] = [
  { id: 'rpt-1', name: 'HPT Inspection Report', type: 'Inspection', date: '2026-09-08' },
  { id: 'rpt-2', name: 'Engineering Recommendation', type: 'Engineering', date: '2026-09-09' },
  { id: 'rpt-3', name: 'Shop Visit Report', type: 'Shop Visit', date: '2026-09-05' },
  { id: 'rpt-4', name: 'Borescope Findings', type: 'Inspection', date: '2026-09-06' },
  { id: 'rpt-5', name: 'LLP Records Package', type: 'Records', date: '2026-09-07' },
  { id: 'rpt-6', name: 'Fan Blade Condition Report', type: 'Inspection', date: '2026-09-04' },
  { id: 'rpt-7', name: 'Cost Estimate Summary', type: 'Financial', date: '2026-09-08' },
  { id: 'rpt-8', name: 'Test Cell Run Report', type: 'Test', date: '2026-09-09' },
  { id: 'rpt-9', name: 'BTB Package', type: 'Records', date: '2026-09-07' },
  { id: 'rpt-10', name: 'Bearing Wear Analysis', type: 'Engineering', date: '2026-09-06' },
];

let attCounter = 0;
function att(name: string, source: Attachment['source'], date: string, extra?: Partial<Attachment>): Attachment {
  attCounter += 1;
  return { id: `att-${attCounter}`, name, source, date, ...extra };
}

let msgCounter = 0;
function msg(partial: Omit<ConversationMessage, 'id' | 'attachments'> & { attachments?: Attachment[] }): ConversationMessage {
  msgCounter += 1;
  const { attachments, ...rest } = partial;
  return { id: `msg-${msgCounter}`, attachments: attachments ?? [], ...rest };
}

let auditCounter = 0;
function auditEvt(date: string, actor: string, action: string, detail?: string): AuditEvent {
  auditCounter += 1;
  return { id: `audit-${auditCounter}`, date, actor, action, detail };
}

function baseAudit(id: string, createdAt: string, type: string, subtype: string | null): AuditEvent[] {
  return [
    auditEvt(createdAt, 'Harini V (CSM)', 'Approval created', `${id} created as ${type}${subtype ? ` — ${subtype}` : ''}. Status set to Open.`),
  ];
}

interface Draft {
  seq: number;
  type: Approval['type'];
  subtype: Approval['subtype'];
  partNumber?: string;
  partDescription?: string;
  engineeringItem?: string;
  requirement: string;
  cost: number | null;
  status: Approval['status'];
  createdAt: string;
  access?: Approval['access'];
  selectedCustomerIds?: string[];
  messages: ConversationMessage[];
  forwardRequests?: Approval['forwardRequests'];
  extraAudit?: AuditEvent[];
  outcome?: Approval['outcome'];
  closedAt?: string;
  customerDecision?: Approval['customerDecision'];
}

function build(d: Draft): Approval {
  const id = `APP-${String(d.seq).padStart(3, '0')}`;
  return {
    id,
    seq: d.seq,
    type: d.type,
    subtype: d.subtype,
    partNumber: d.partNumber,
    partDescription: d.partDescription,
    engineeringItem: d.engineeringItem,
    requirement: d.requirement,
    cost: d.cost,
    status: d.status,
    createdAt: d.createdAt,
    access: d.access ?? 'all',
    selectedCustomerIds: d.selectedCustomerIds ?? [],
    messages: d.messages,
    forwardRequests: d.forwardRequests ?? [],
    audit: [...baseAudit(id, d.createdAt, d.type, d.subtype), ...(d.extraAudit ?? [])],
    outcome: d.outcome ?? null,
    closedAt: d.closedAt,
    customerDecision: d.customerDecision ?? null,
  };
}

const app001Messages: ConversationMessage[] = [
  msg({
    channel: 'customer',
    authorName: 'Harini V',
    authorRole: 'CSM',
    body: 'Please review the additional repair requirement above and confirm whether we may proceed.',
    date: '2026-09-10T10:15:00+05:30',
    attachments: [att('Inspection Report.pdf', 'reports-library', '2026-09-10', { reportType: 'Inspection' }), att('Findings Summary.pdf', 'external', '2026-09-10', { uploadedBy: 'Harini V' })],
  }),
  msg({
    channel: 'customer',
    authorName: 'Sarah Mitchell',
    authorRole: 'Customer',
    body: "Can we get an engineer's recommendation before approving this?",
    date: '2026-09-10T14:20:00+05:30',
    attachments: [att('Query_Notes.pdf', 'external', '2026-09-10', { uploadedBy: 'Sarah Mitchell' })],
    decision: 'Clarification Requested',
  }),
  msg({
    channel: 'customer',
    authorName: 'Harini V',
    authorRole: 'CSM',
    body: 'We will obtain an engineering recommendation and revert.',
    date: '2026-09-10T15:05:00+05:30',
  }),
];

export const INITIAL_APPROVALS: Approval[] = [
  // APP-001 — flagship demo: full Customer <-> CSM <-> Internal Engineer workflow
  build({
    seq: 1,
    type: 'O&A',
    subtype: 'Additional Repair',
    partNumber: '123456',
    partDescription: 'HPT Blade',
    requirement:
      'The HPT blade needs extra repair beyond what was originally approved, based on the inspection findings. We need your approval before we can proceed.',
    cost: 12500,
    status: 'Open',
    createdAt: '2026-09-10T09:45:00+05:30',
    messages: app001Messages,
    customerDecision: 'Clarification Requested',
    forwardRequests: [
      {
        id: 'fwd-1',
        recipientName: 'Muazzi',
        recipientRole: 'Engineering VP',
        recipientEmail: 'muazzi@gem-mro.com',
        requestType: 'Repair Recommendation',
        question:
          'Customer has requested an engineer\'s recommendation. Please advise whether we should proceed with the repair or replace the part.',
        attachments: [att('Inspection Report.pdf', 'reports-library', '2026-09-10', { reportType: 'Inspection' })],
        sentAt: '2026-09-10T15:10:00+05:30',
        sentVia: 'Gmail',
        status: 'awaiting',
        includeHistory: true,
        includedMessages: app001Messages,
        ccCustomer: true,
      },
    ],
    extraAudit: [
      auditEvt('2026-09-10T10:15:00+05:30', 'Harini V (CSM)', 'Customer response requested', 'Initial CSM message sent to customer.'),
      auditEvt('2026-09-10T14:20:00+05:30', 'Sarah Mitchell', 'Customer responded', 'Clarification Requested — customer requested engineering recommendation.'),
      auditEvt('2026-09-10T15:10:00+05:30', 'Harini V (CSM)', 'Forwarded to internal member', 'Sent to Muazzi (Engineering VP) via Gmail — Repair Recommendation. Customer cc\'d.'),
    ],
  }),

  // APP-002 — closed, Approved
  build({
    seq: 2,
    type: 'O&A',
    subtype: 'Additional Replace',
    partNumber: '789012',
    partDescription: 'Fan Blade',
    requirement: 'The fan blade was found damaged during inspection and needs to be replaced. This is outside the original job scope.',
    cost: 8200,
    status: 'Closed',
    createdAt: '2026-09-05T09:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Please review the replacement recommendation below and confirm your approval.',
        date: '2026-09-05T11:00:00+05:30',
        attachments: [att('Fan Blade Condition Report.pdf', 'reports-library', '2026-09-04', { reportType: 'Inspection' })],
      }),
      msg({
        channel: 'customer',
        authorName: 'David Chen',
        authorRole: 'Customer',
        body: 'Approved.',
        date: '2026-09-05T16:40:00+05:30',
        decision: 'Approved',
      }),
    ],
    outcome: 'Approved',
    customerDecision: 'Approved',
    closedAt: '2026-09-06T09:00:00+05:30',
    extraAudit: [
      auditEvt('2026-09-05T16:40:00+05:30', 'David Chen', 'Customer responded', 'Approved.'),
      auditEvt('2026-09-06T09:00:00+05:30', 'Harini V (CSM)', 'Status changed to Closed', 'Final Outcome recorded: Approved.'),
    ],
  }),

  // APP-003 — open, Exchange, awaiting customer decision
  build({
    seq: 3,
    type: 'O&A',
    subtype: 'Exchange',
    partNumber: '552341',
    partDescription: 'LPT Nozzle',
    requirement: 'The LPT nozzle is damaged and cannot be repaired. It needs to be exchanged for a working unit.',
    cost: 18400,
    status: 'Open',
    createdAt: '2026-08-27T09:20:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Please review the proposed exchange and let us know if you approve.',
        date: '2026-08-27T09:40:00+05:30',
        attachments: [att('Borescope Findings.pdf', 'reports-library', '2026-09-06', { reportType: 'Inspection' })],
      }),
    ],
  }),

  // APP-004 — open, Price Deviation, awaiting customer decision
  build({
    seq: 4,
    type: 'O&A',
    subtype: 'Price Deviation',
    partNumber: '991823',
    partDescription: 'Combustion Liner',
    requirement: 'The repair cost is higher than originally quoted because of updated labor estimates. We need your approval for this price change.',
    cost: 6300,
    status: 'Open',
    createdAt: '2026-09-08T09:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Please review the attached cost breakdown and confirm the price deviation is acceptable.',
        date: '2026-09-08T09:30:00+05:30',
        attachments: [att('Cost Estimate Summary.pdf', 'reports-library', '2026-09-08', { reportType: 'Financial' })],
      }),
    ],
  }),

  // APP-005 — open, Additional Repair, customer rejected (CSM still to follow up)
  build({
    seq: 5,
    type: 'O&A',
    subtype: 'Additional Repair',
    partNumber: '667234',
    partDescription: 'Wiring Harness',
    requirement: 'The wiring harness needs extra repair, based on what we found during inspection.',
    cost: 15000,
    status: 'Open',
    createdAt: '2026-09-02T09:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Additional repair is required. Please review — estimated cost is $15,000.',
        date: '2026-09-02T09:30:00+05:30',
      }),
      msg({
        channel: 'customer',
        authorName: 'Priya Patel',
        authorRole: 'Customer',
        body: 'Repair is not approved at this cost.',
        date: '2026-09-02T14:00:00+05:30',
        decision: 'Rejected',
      }),
    ],
    customerDecision: 'Rejected',
    extraAudit: [auditEvt('2026-09-02T14:00:00+05:30', 'Priya Patel', 'Customer responded', 'Rejected.')],
  }),

  // APP-006 — closed, Another Part Installed scenario
  build({
    seq: 6,
    type: 'O&A',
    subtype: 'Additional Replace',
    partNumber: '774411',
    partDescription: 'Oil Pressure Sensor',
    requirement: 'The original sensor part was not approved, so we found a different part. Please confirm you are okay with installing it instead.',
    cost: 4100,
    status: 'Closed',
    createdAt: '2026-08-30T09:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'An alternative part has been sourced for this replacement — please confirm you are comfortable proceeding with it.',
        date: '2026-08-30T10:00:00+05:30',
      }),
      msg({
        channel: 'customer',
        authorName: 'James Anderson',
        authorRole: 'Customer',
        body: 'Alternative part approved for installation.',
        date: '2026-08-30T15:00:00+05:30',
        decision: 'Approved',
      }),
    ],
    outcome: 'Another Part Installed',
    customerDecision: 'Approved',
    closedAt: '2026-08-31T09:00:00+05:30',
    extraAudit: [
      auditEvt('2026-08-31T09:00:00+05:30', 'Harini V (CSM)', 'Status changed to Closed', 'Final Outcome recorded: Another Part Installed.'),
    ],
  }),

  // APP-007 — open, Additional Repair, customer asked a question
  build({
    seq: 7,
    type: 'O&A',
    subtype: 'Additional Repair',
    partNumber: '334455',
    partDescription: 'Compressor Blade',
    requirement: 'The compressor blade is worn more than allowed and needs extra repair.',
    cost: 9800,
    status: 'Open',
    createdAt: '2026-09-08T13:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Please review the inspection findings and confirm whether the additional repair may proceed.',
        date: '2026-09-08T13:20:00+05:30',
      }),
      msg({
        channel: 'customer',
        authorName: 'Priya Patel',
        authorRole: 'Customer',
        body: 'Can you share more details on the inspection findings before we decide?',
        date: '2026-09-08T18:00:00+05:30',
        decision: 'Clarification Requested',
      }),
    ],
    customerDecision: 'Clarification Requested',
  }),

  // APP-008 — open, Additional Replace, customer approved (CSM still to close out)
  build({
    seq: 8,
    type: 'O&A',
    subtype: 'Additional Replace',
    partNumber: '778899',
    partDescription: 'Bearing Assembly',
    requirement: 'The bearing assembly is worn out and needs to be replaced.',
    cost: 21000,
    status: 'Open',
    createdAt: '2026-09-07T15:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'The bearing inspection report is attached — we recommend replacing it. Please confirm approval.',
        date: '2026-09-07T15:30:00+05:30',
        attachments: [att('Bearing Wear Analysis.pdf', 'reports-library', '2026-09-06', { reportType: 'Engineering' })],
      }),
    ],
    customerDecision: 'Approved',
    extraAudit: [auditEvt('2026-09-07T19:10:00+05:30', 'David Chen', 'Customer responded', 'Decision: Approved.')],
  }),

  // APP-009 — open, Additional Repair, awaiting customer decision
  build({
    seq: 9,
    type: 'O&A',
    subtype: 'Additional Repair',
    partNumber: '229981',
    partDescription: 'LPT Blade',
    requirement: 'The LPT blade needs extra repair beyond the original scope, based on the inspection findings. We need your approval before we can proceed.',
    cost: 5400,
    status: 'Open',
    createdAt: '2026-08-29T09:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Please review the attached inspection findings and confirm whether the additional repair may proceed.',
        date: '2026-08-29T09:20:00+05:30',
        attachments: [att('Borescope Findings.pdf', 'reports-library', '2026-09-08', { reportType: 'Inspection' })],
      }),
    ],
  }),

  // APP-010 — open, LLP Purchase, awaiting customer decision
  build({
    seq: 10,
    type: 'Purchase',
    subtype: 'LLP Purchase',
    partNumber: '445210',
    partDescription: 'HPT Disk',
    requirement: 'The HPT disk is beyond life limit and cannot be repaired. A new LLP part needs to be purchased before the engine can be released.',
    cost: 45000,
    status: 'Open',
    createdAt: '2026-09-09T11:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'The HPT disk has reached its life limit — please review the LLP purchase requirement and confirm approval to proceed.',
        date: '2026-09-09T11:15:00+05:30',
        attachments: [att('LLP Records Package.pdf', 'reports-library', '2026-09-07', { reportType: 'Records' })],
      }),
    ],
  }),

  // APP-011 — closed, Customer Provided Part, Approved
  build({
    seq: 11,
    type: 'Purchase',
    subtype: 'Customer Provided Part',
    partNumber: '118820',
    partDescription: 'Bleed Valve',
    requirement: 'A replacement bleed valve is needed. Please confirm whether you will supply the part or if we should purchase it on your behalf.',
    cost: 3200,
    status: 'Closed',
    createdAt: '2026-09-03T10:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Please confirm whether you will provide the bleed valve or if GEM should source it.',
        date: '2026-09-03T10:20:00+05:30',
      }),
      msg({
        channel: 'customer',
        authorName: 'James Anderson',
        authorRole: 'Customer',
        body: 'We will supply the part — approved.',
        date: '2026-09-03T15:00:00+05:30',
        decision: 'Approved',
      }),
    ],
    outcome: 'Customer Supplied Another Part',
    customerDecision: 'Approved',
    closedAt: '2026-09-04T09:00:00+05:30',
    extraAudit: [
      auditEvt('2026-09-03T15:00:00+05:30', 'James Anderson', 'Customer responded', 'Approved — customer will supply the part.'),
      auditEvt('2026-09-04T09:00:00+05:30', 'Harini V (CSM)', 'Status changed to Closed', 'Final Outcome recorded: Customer Supplied Another Part.'),
    ],
  }),

  // APP-012 — open, LLP Purchase, customer requested clarification
  build({
    seq: 12,
    type: 'Purchase',
    subtype: 'LLP Purchase',
    partNumber: '556710',
    partDescription: 'Fan Disk',
    requirement: 'The fan disk is approaching its life limit and a replacement LLP purchase is recommended before the next shop visit.',
    cost: 62000,
    status: 'Open',
    createdAt: '2026-09-07T10:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'We recommend purchasing a replacement fan disk now — please review the attached LLP records and confirm.',
        date: '2026-09-07T10:15:00+05:30',
        attachments: [att('LLP Records Package.pdf', 'reports-library', '2026-09-07', { reportType: 'Records' })],
      }),
      msg({
        channel: 'customer',
        authorName: 'David Chen',
        authorRole: 'Customer',
        body: 'How many cycles of life remain on the current disk?',
        date: '2026-09-07T16:30:00+05:30',
        decision: 'Clarification Requested',
      }),
    ],
    customerDecision: 'Clarification Requested',
    extraAudit: [auditEvt('2026-09-07T16:30:00+05:30', 'David Chen', 'Customer responded', 'Clarification Requested — asked about remaining life cycles.')],
  }),
];

export function nextApprovalSeq(approvals: Approval[]): number {
  return approvals.reduce((max, a) => Math.max(max, a.seq), 0) + 1;
}
