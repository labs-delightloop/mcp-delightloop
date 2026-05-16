export interface CampaignResult {
  campaignId: string;
  name?: string;
  status?: string;
  goal?: string;
  motion?: string;
  createdAt?: string;
  updatedAt?: string;
  campaignData?: {
    motion?: { motionId?: string; name?: string };
    goal?: { name?: string };
    recipients?: { expectedRecipients?: number };
  };
}

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
