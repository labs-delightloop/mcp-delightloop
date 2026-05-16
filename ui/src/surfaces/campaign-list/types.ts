export type CampaignStatusFilter =
  | ''
  | 'draft'
  | 'live'
  | 'paused'
  | 'preparing'
  | 'completed';

export interface CampaignListItem {
  campaignId: string;
  name?: string;
  status?: string;
  goal?: string;
  motion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignListResult {
  campaigns: CampaignListItem[];
  total?: number;
  page?: number;
  totalPages?: number;
}

export interface CampaignMetrics {
  totalRecipients?: number;
  totalGiftsSent?: number;
  totalDelivered?: number;
  totalFeedback?: number;
  draftCount?: number;
  pendingConfirmation?: number;
  acknowledged?: number;
  [key: string]: number | undefined;
}
