export type ApprovalType = 'O&A' | 'Purchase' | 'Engineering Request' | 'Invoice Acknowledgement';

export type OASubtype = 'Additional Repair' | 'Additional Replace' | 'Exchange' | 'Price Deviation' | 'Carry Forward';
export type PurchaseSubtype = 'LLP Purchase' | 'Customer Provided Part';
export type Subtype = OASubtype | PurchaseSubtype | null;

export type ApprovalStatus = 'Open' | 'Closed';

export type FinalOutcome =
  | 'Approved'
  | 'Approved with Conditions'
  | 'Rejected'
  | 'Carry Forward'
  | 'Customer Supplied Another Part'
  | 'Another Part Installed'
  | 'Acknowledged'
  | 'Payment Timing Confirmed';

export const APPROVAL_TYPES: ApprovalType[] = ['O&A', 'Purchase', 'Engineering Request', 'Invoice Acknowledgement'];

export const SUBTYPES_BY_TYPE: Record<ApprovalType, string[]> = {
  'O&A': ['Additional Repair', 'Additional Replace', 'Exchange', 'Price Deviation', 'Carry Forward'],
  Purchase: ['LLP Purchase', 'Customer Provided Part'],
  'Engineering Request': [],
  'Invoice Acknowledgement': [],
};

export const FINAL_OUTCOMES: FinalOutcome[] = [
  'Approved',
  'Approved with Conditions',
  'Rejected',
  'Carry Forward',
  'Customer Supplied Another Part',
  'Another Part Installed',
  'Acknowledged',
  'Payment Timing Confirmed',
];

export interface Attachment {
  id: string;
  name: string;
  source: 'reports-library' | 'external' | 'email';
  reportId?: string;
  reportType?: string;
  uploadedBy?: string;
  date: string; // ISO
}

export type MessageChannel = 'customer' | 'internal' | 'shared-to-customer';
export type MessageAuthorRole = 'CSM' | 'Customer' | 'Internal';

export interface ConversationMessage {
  id: string;
  channel: MessageChannel;
  authorName: string;
  authorRole: MessageAuthorRole;
  authorTitle?: string; // e.g. "Engineer"
  body: string;
  date: string; // ISO
  attachments: Attachment[];
  capturedFromEmail?: boolean;
  sharedFromMessageId?: string; // if this is a shared-to-customer echo of an internal message
  sharedByCsmName?: string;
  sharedContext?: string;
  internalDecision?: 'shared' | 'kept-internal';
}

export interface InternalForwardRequest {
  id: string;
  recipientName: string;
  recipientRole: string;
  recipientEmail: string;
  requestType: string;
  question: string;
  attachments: Attachment[];
  sentAt: string; // ISO
  sentVia: 'Gmail' | 'Outlook';
  status: 'awaiting' | 'responded';
  responseMessageId?: string;
  includeHistory?: boolean;
  includedMessages?: ConversationMessage[]; // snapshot of the customer conversation at send time, when includeHistory is true
}

export interface AuditEvent {
  id: string;
  date: string; // ISO
  actor: string;
  action: string;
  detail?: string;
}

export interface CustomerAccess {
  customerId: string;
  granted: boolean;
}

export interface Approval {
  id: string; // APP-001
  seq: number;
  type: ApprovalType;
  subtype: Subtype;
  partNumber?: string;
  partDescription?: string;
  engineeringItem?: string; // for non-part items e.g. "Engine Test"
  requirement: string;
  cost: number | null;
  status: ApprovalStatus;
  createdAt: string; // ISO
  access: 'all' | 'selected';
  selectedCustomerIds: string[];
  messages: ConversationMessage[];
  forwardRequests: InternalForwardRequest[];
  audit: AuditEvent[];
  outcome: FinalOutcome | null;
  closedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
}

export interface InternalMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface ReportLibraryItem {
  id: string;
  name: string;
  type: string;
  date: string; // ISO
}

export interface AppNotification {
  id: string;
  kind: 'internal-response' | 'customer-response';
  approvalId: string;
  title: string;
  body: string;
  date: string; // ISO
  read: boolean;
}
