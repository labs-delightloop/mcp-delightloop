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
