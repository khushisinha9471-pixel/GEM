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

export const CUSTOMERS: Customer[] = [
  { id: 'cust-a', name: 'AerCap Holdings' },
  { id: 'cust-b', name: 'SMBC Aviation Capital' },
  { id: 'cust-c', name: 'Avolon Aerospace' },
  { id: 'cust-d', name: 'BOC Aviation' },
];

export const INTERNAL_MEMBERS: InternalMember[] = [
  { id: 'int-moazi', name: 'Moazi Rahman', role: 'Engineer', email: 'moazi.rahman@gem-mro.com' },
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
  };
}

export const INITIAL_APPROVALS: Approval[] = [
  // APP-001 — flagship demo: full Customer <-> CSM <-> Internal Engineer workflow
  build({
    seq: 1,
    type: 'O&A',
    subtype: 'Additional Repair',
    partNumber: '123456',
    partDescription: 'HPT Blade',
    requirement:
      'HPT blade requires additional repair beyond the original approved workscope due to inspection findings. Customer approval is needed before repair can proceed.',
    cost: 12500,
    status: 'Open',
    createdAt: '2026-09-10T09:45:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Additional repair is required based on inspection findings. Please review the additional repair requirement and confirm whether the repair may proceed.',
        date: '2026-09-10T10:15:00+05:30',
        attachments: [att('Inspection Report.pdf', 'reports-library', '2026-09-10', { reportType: 'Inspection' }), att('Findings Summary.pdf', 'external', '2026-09-10', { uploadedBy: 'Harini V' })],
      }),
      msg({
        channel: 'customer',
        authorName: 'AerCap Holdings',
        authorRole: 'Customer',
        body: "Can we get an engineer's recommendation before approving this?",
        date: '2026-09-10T14:20:00+05:30',
        attachments: [att('Query_Notes.pdf', 'external', '2026-09-10', { uploadedBy: 'AerCap Holdings' })],
      }),
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'We will obtain an engineering recommendation and revert.',
        date: '2026-09-10T15:05:00+05:30',
      }),
    ],
    forwardRequests: [
      {
        id: 'fwd-1',
        recipientName: 'Moazi Rahman',
        recipientRole: 'Engineer',
        recipientEmail: 'moazi.rahman@gem-mro.com',
        requestType: 'Repair Recommendation',
        question:
          'Customer has requested an engineer\'s recommendation. Please advise whether we should proceed with the repair or replace the part.',
        attachments: [att('Inspection Report.pdf', 'reports-library', '2026-09-10', { reportType: 'Inspection' })],
        sentAt: '2026-09-10T15:10:00+05:30',
        sentVia: 'Gmail',
        status: 'awaiting',
      },
    ],
    extraAudit: [
      auditEvt('2026-09-10T10:15:00+05:30', 'Harini V (CSM)', 'Customer response requested', 'Initial CSM message sent to customer.'),
      auditEvt('2026-09-10T14:20:00+05:30', 'AerCap Holdings', 'Customer responded', 'Customer requested engineering recommendation.'),
      auditEvt('2026-09-10T15:10:00+05:30', 'Harini V (CSM)', 'Forwarded to internal member', 'Sent to Moazi Rahman (Engineer) via Gmail — Repair Recommendation.'),
    ],
  }),

  // APP-002 — closed, Approved
  build({
    seq: 2,
    type: 'O&A',
    subtype: 'Additional Replace',
    partNumber: '789012',
    partDescription: 'Fan Blade',
    requirement: 'Replacement required outside original scope due to blade damage identified during fan blade inspection.',
    cost: 8200,
    status: 'Closed',
    createdAt: '2026-09-05T09:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Replacement details shared.',
        date: '2026-09-05T11:00:00+05:30',
        attachments: [att('Fan Blade Condition Report.pdf', 'reports-library', '2026-09-04', { reportType: 'Inspection' })],
      }),
      msg({
        channel: 'customer',
        authorName: 'SMBC Aviation Capital',
        authorRole: 'Customer',
        body: 'Approved.',
        date: '2026-09-05T16:40:00+05:30',
      }),
    ],
    outcome: 'Approved',
    closedAt: '2026-09-06T09:00:00+05:30',
    extraAudit: [
      auditEvt('2026-09-05T16:40:00+05:30', 'SMBC Aviation Capital', 'Customer responded', 'Customer approved the replacement.'),
      auditEvt('2026-09-06T09:00:00+05:30', 'Harini V (CSM)', 'Status changed to Closed', 'Final Outcome recorded: Approved.'),
    ],
  }),

  // APP-003
  build({
    seq: 3,
    type: 'Purchase',
    subtype: 'LLP Purchase',
    partNumber: '456789',
    partDescription: 'HPT Disk',
    requirement: 'LLP replacement requires customer approval and records review before procurement can proceed.',
    cost: 95000,
    status: 'Open',
    createdAt: '2026-09-07T10:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'LLP purchase details and supporting records shared for review.',
        date: '2026-09-07T10:30:00+05:30',
        attachments: [att('LLP Records Package.pdf', 'reports-library', '2026-09-07', { reportType: 'Records' })],
      }),
      msg({
        channel: 'customer',
        authorName: 'Avolon Aerospace',
        authorRole: 'Customer',
        body: 'Please provide the BTB package.',
        date: '2026-09-08T09:15:00+05:30',
      }),
    ],
  }),

  // APP-004
  build({
    seq: 4,
    type: 'Purchase',
    subtype: 'Customer Provided Part',
    partNumber: '345678',
    partDescription: 'LPT Blade',
    requirement: 'Customer will provide an alternative replacement part in lieu of shop-sourced material.',
    cost: null,
    status: 'Open',
    createdAt: '2026-09-08T12:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Please confirm the customer-provided part details.',
        date: '2026-09-08T12:20:00+05:30',
      }),
      msg({
        channel: 'customer',
        authorName: 'BOC Aviation',
        authorRole: 'Customer',
        body: 'We will provide the part.',
        date: '2026-09-08T17:00:00+05:30',
      }),
    ],
  }),

  // APP-005
  build({
    seq: 5,
    type: 'Engineering Request',
    subtype: null,
    engineeringItem: 'Engine Test',
    requirement: 'Additional troubleshooting required following anomalous test cell readings.',
    cost: null,
    status: 'Open',
    createdAt: '2026-09-09T08:30:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Engineering review requested.',
        date: '2026-09-09T09:00:00+05:30',
      }),
      msg({
        channel: 'customer',
        authorName: 'AerCap Holdings',
        authorRole: 'Customer',
        body: 'Please provide engineering clarification.',
        date: '2026-09-09T13:45:00+05:30',
      }),
    ],
  }),

  // APP-006
  build({
    seq: 6,
    type: 'O&A',
    subtype: 'Exchange',
    partNumber: '552341',
    partDescription: 'LPT Nozzle',
    requirement: 'LPT nozzle segment exchange recommended in lieu of repair due to extent of thermal distress.',
    cost: 18400,
    status: 'Open',
    createdAt: '2026-09-06T09:20:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Exchange option proposed for the LPT nozzle segment — please review.',
        date: '2026-09-06T09:40:00+05:30',
        attachments: [att('Borescope Findings.pdf', 'reports-library', '2026-09-06', { reportType: 'Inspection' })],
      }),
      msg({
        channel: 'customer',
        authorName: 'BOC Aviation',
        authorRole: 'Customer',
        body: 'What is the lead time on the exchange unit?',
        date: '2026-09-06T15:10:00+05:30',
      }),
    ],
  }),

  // APP-007
  build({
    seq: 7,
    type: 'O&A',
    subtype: 'Price Deviation',
    partNumber: '991823',
    partDescription: 'Combustion Liner',
    requirement: 'Repair cost exceeds original quoted price due to revised labor estimate — customer approval required for the deviation.',
    cost: 6300,
    status: 'Open',
    createdAt: '2026-09-08T09:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Price deviation details attached for your review and approval.',
        date: '2026-09-08T09:30:00+05:30',
        attachments: [att('Cost Estimate Summary.pdf', 'reports-library', '2026-09-08', { reportType: 'Financial' })],
      }),
    ],
  }),

  // APP-008
  build({
    seq: 8,
    type: 'O&A',
    subtype: 'Carry Forward',
    partNumber: '118820',
    partDescription: 'Fan Case',
    requirement: 'Minor fan case damage is within carry-forward limits per manual — proposing carry forward rather than repair at this visit.',
    cost: null,
    status: 'Open',
    createdAt: '2026-09-09T11:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Proposing to carry forward the fan case finding — within manual limits. Please confirm.',
        date: '2026-09-09T11:20:00+05:30',
      }),
    ],
  }),

  // APP-009
  build({
    seq: 9,
    type: 'Purchase',
    subtype: 'LLP Purchase',
    partNumber: '224455',
    partDescription: 'HPT Disk Stage 2',
    requirement: 'Stage 2 HPT disk has reached life limit and requires LLP purchase and customer approval prior to procurement.',
    cost: 112000,
    status: 'Open',
    createdAt: '2026-09-04T09:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'LLP purchase required — records and pricing attached.',
        date: '2026-09-04T09:45:00+05:30',
        attachments: [att('LLP Records Package.pdf', 'reports-library', '2026-09-07', { reportType: 'Records' })],
      }),
      msg({
        channel: 'customer',
        authorName: 'SMBC Aviation Capital',
        authorRole: 'Customer',
        body: 'Reviewing with our records team, will revert shortly.',
        date: '2026-09-05T10:00:00+05:30',
      }),
    ],
  }),

  // APP-010 — Carry Forward scenario (section 41)
  build({
    seq: 10,
    type: 'O&A',
    subtype: 'Additional Repair',
    partNumber: '667234',
    partDescription: 'External Wiring Harness',
    requirement: 'Additional repair required to the external wiring harness identified during inspection.',
    cost: 15000,
    status: 'Closed',
    createdAt: '2026-09-02T09:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Additional repair required. Cost: $15,000.',
        date: '2026-09-02T09:30:00+05:30',
      }),
      msg({
        channel: 'customer',
        authorName: 'Avolon Aerospace',
        authorRole: 'Customer',
        body: 'Repair is not approved.',
        date: '2026-09-02T14:00:00+05:30',
      }),
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'This is an external part and can be carried forward for later action.',
        date: '2026-09-02T15:00:00+05:30',
      }),
      msg({
        channel: 'customer',
        authorName: 'Avolon Aerospace',
        authorRole: 'Customer',
        body: 'Carry forward approved.',
        date: '2026-09-03T10:00:00+05:30',
      }),
    ],
    outcome: 'Carry Forward',
    closedAt: '2026-09-03T11:00:00+05:30',
    extraAudit: [
      auditEvt('2026-09-03T11:00:00+05:30', 'Harini V (CSM)', 'Status changed to Closed', 'Final Outcome recorded: Carry Forward.'),
    ],
  }),

  // APP-011 — Customer Supplied Another Part scenario (section 42)
  build({
    seq: 11,
    type: 'Purchase',
    subtype: 'Customer Provided Part',
    partNumber: '882910',
    partDescription: 'Accessory Gearbox',
    requirement: 'Proposed replacement of accessory gearbox — customer approval requested.',
    cost: 26500,
    status: 'Closed',
    createdAt: '2026-09-01T09:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Proposed replacement accessory gearbox — please review and approve.',
        date: '2026-09-01T09:30:00+05:30',
      }),
      msg({
        channel: 'customer',
        authorName: 'BOC Aviation',
        authorRole: 'Customer',
        body: 'We do not approve this replacement.',
        date: '2026-09-01T16:00:00+05:30',
      }),
      msg({
        channel: 'customer',
        authorName: 'BOC Aviation',
        authorRole: 'Customer',
        body: 'We will provide an alternative part.',
        date: '2026-09-02T10:00:00+05:30',
      }),
    ],
    outcome: 'Customer Supplied Another Part',
    closedAt: '2026-09-03T09:00:00+05:30',
    extraAudit: [
      auditEvt('2026-09-03T09:00:00+05:30', 'Harini V (CSM)', 'Status changed to Closed', 'Final Outcome recorded: Customer Supplied Another Part.'),
    ],
  }),

  // APP-012 — Another Part Installed scenario (section 43)
  build({
    seq: 12,
    type: 'O&A',
    subtype: 'Additional Replace',
    partNumber: '774411',
    partDescription: 'Oil Pressure Sensor',
    requirement: 'Original proposed sensor replacement not approved — alternative part sourced and proposed.',
    cost: 4100,
    status: 'Closed',
    createdAt: '2026-08-30T09:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Original proposed action not approved by customer — alternative part sourced.',
        date: '2026-08-30T10:00:00+05:30',
      }),
      msg({
        channel: 'customer',
        authorName: 'AerCap Holdings',
        authorRole: 'Customer',
        body: 'Alternative part approved for installation.',
        date: '2026-08-30T15:00:00+05:30',
      }),
    ],
    outcome: 'Another Part Installed',
    closedAt: '2026-08-31T09:00:00+05:30',
    extraAudit: [
      auditEvt('2026-08-31T09:00:00+05:30', 'Harini V (CSM)', 'Status changed to Closed', 'Final Outcome recorded: Another Part Installed. Alternative part installed.'),
    ],
  }),

  // APP-013 — Invoice Acknowledgement, closed
  build({
    seq: 13,
    type: 'Invoice Acknowledgement',
    subtype: null,
    engineeringItem: 'Invoice INV-88213',
    requirement: 'Interim invoice issued for completed workscope milestones — customer acknowledgement of payment timing requested.',
    cost: 214000,
    status: 'Closed',
    createdAt: '2026-08-29T09:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Interim invoice issued — please acknowledge payment timing.',
        date: '2026-08-29T09:30:00+05:30',
      }),
      msg({
        channel: 'customer',
        authorName: 'SMBC Aviation Capital',
        authorRole: 'Customer',
        body: 'Payment timing confirmed as per agreed schedule.',
        date: '2026-08-29T16:00:00+05:30',
      }),
    ],
    outcome: 'Payment Timing Confirmed',
    closedAt: '2026-08-30T09:00:00+05:30',
    extraAudit: [
      auditEvt('2026-08-30T09:00:00+05:30', 'Harini V (CSM)', 'Status changed to Closed', 'Final Outcome recorded: Payment Timing Confirmed.'),
    ],
  }),

  // APP-014
  build({
    seq: 14,
    type: 'Purchase',
    subtype: 'Customer Provided Part',
    partNumber: '667788',
    partDescription: 'Borescope Plug',
    requirement: 'Customer-provided borescope plug to be used in lieu of shop stock — confirmation requested.',
    cost: null,
    status: 'Open',
    createdAt: '2026-09-09T14:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Please confirm whether the customer-provided borescope plug will be shipped or is on-site.',
        date: '2026-09-09T14:20:00+05:30',
      }),
    ],
  }),

  // APP-015
  build({
    seq: 15,
    type: 'Engineering Request',
    subtype: null,
    engineeringItem: 'Vibration Troubleshooting',
    requirement: 'Elevated vibration reading during test cell run requires engineering troubleshooting before release.',
    cost: null,
    status: 'Open',
    createdAt: '2026-09-09T16:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Flagging elevated vibration reading from test cell run for engineering review.',
        date: '2026-09-09T16:15:00+05:30',
        attachments: [att('Test Cell Run Report.pdf', 'reports-library', '2026-09-09', { reportType: 'Test' })],
      }),
    ],
  }),

  // APP-016
  build({
    seq: 16,
    type: 'Invoice Acknowledgement',
    subtype: null,
    engineeringItem: 'Invoice INV-88250',
    requirement: 'Final invoice issued for shop visit completion — customer acknowledgement requested.',
    cost: 1180000,
    status: 'Open',
    createdAt: '2026-09-10T08:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Final invoice issued — please review and acknowledge.',
        date: '2026-09-10T08:15:00+05:30',
        attachments: [att('Final Invoice INV-88250.pdf', 'external', '2026-09-10', { uploadedBy: 'Harini V' })],
      }),
    ],
  }),

  // APP-017
  build({
    seq: 17,
    type: 'O&A',
    subtype: 'Additional Repair',
    partNumber: '334455',
    partDescription: 'Compressor Blade Set',
    requirement: 'Compressor blade set requires additional repair due to erosion beyond serviceable limits.',
    cost: 9800,
    status: 'Open',
    createdAt: '2026-09-08T13:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Compressor blade set erosion requires additional repair — please review.',
        date: '2026-09-08T13:20:00+05:30',
      }),
      msg({
        channel: 'customer',
        authorName: 'Avolon Aerospace',
        authorRole: 'Customer',
        body: 'Can you share the erosion measurement data?',
        date: '2026-09-08T18:00:00+05:30',
      }),
    ],
  }),

  // APP-018
  build({
    seq: 18,
    type: 'O&A',
    subtype: 'Additional Replace',
    partNumber: '778899',
    partDescription: 'Bearing Assembly',
    requirement: 'Bearing assembly shows wear beyond repair limits and requires replacement.',
    cost: 21000,
    status: 'Open',
    createdAt: '2026-09-07T15:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Bearing wear analysis attached — replacement recommended.',
        date: '2026-09-07T15:30:00+05:30',
        attachments: [att('Bearing Wear Analysis.pdf', 'reports-library', '2026-09-06', { reportType: 'Engineering' })],
      }),
    ],
  }),

  // APP-019
  build({
    seq: 19,
    type: 'Purchase',
    subtype: 'LLP Purchase',
    partNumber: '990011',
    partDescription: 'LPT Disk',
    requirement: 'LPT disk has reached cyclic life limit and requires LLP purchase prior to reassembly.',
    cost: 138500,
    status: 'Open',
    createdAt: '2026-09-03T09:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'LPT disk life limit reached — LLP purchase required prior to reassembly.',
        date: '2026-09-03T09:30:00+05:30',
      }),
      msg({
        channel: 'customer',
        authorName: 'BOC Aviation',
        authorRole: 'Customer',
        body: 'Please share the current market pricing before we approve.',
        date: '2026-09-04T11:00:00+05:30',
      }),
    ],
  }),

  // APP-020
  build({
    seq: 20,
    type: 'Invoice Acknowledgement',
    subtype: null,
    engineeringItem: 'Invoice INV-88301',
    requirement: 'Progress invoice for teardown and inspection phase — acknowledgement requested.',
    cost: 340000,
    status: 'Open',
    createdAt: '2026-09-06T10:00:00+05:30',
    messages: [
      msg({
        channel: 'customer',
        authorName: 'Harini V',
        authorRole: 'CSM',
        body: 'Progress invoice for teardown and inspection — please acknowledge.',
        date: '2026-09-06T10:20:00+05:30',
      }),
    ],
  }),
];

export function nextApprovalSeq(approvals: Approval[]): number {
  return approvals.reduce((max, a) => Math.max(max, a.seq), 0) + 1;
}
