export interface RecipientRow {
  recipientId: string;
  status: string;
  contactId?: string;
  name?: string;
  email?: string;
  landingPageUrl?: string | null;
  claimPageUrl?: string | null;
  tags?: Array<{ name: string; color: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipientListResult {
  recipients: RecipientRow[];
  total?: number;
  page?: number;
  totalPages?: number;
  campaignId: string;
  statusCounts?: Record<string, number>;
}

export const RECIPIENT_STATUSES = [
  'draft',
  'ready',
  'invited',
  'invite_sent',
  'address_confirmed',
  'processing',
  'shipped',
  'in_transit',
  'delivered',
  'acknowledged',
  'cancelled',
] as const;

export type RecipientStatus = (typeof RECIPIENT_STATUSES)[number];
