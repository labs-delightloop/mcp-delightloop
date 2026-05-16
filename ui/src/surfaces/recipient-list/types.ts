import type { RecipientRow } from '../campaign-details/types';

export type { RecipientRow };

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
