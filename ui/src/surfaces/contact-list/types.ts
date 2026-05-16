export interface ContactRow {
  contactId: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  companyName?: string;
  jobTitle?: string;
  linkedinUrl?: string;
  profileImage?: string;
  tags?: Array<{ name: string; color?: string }>;
  createdAt?: string;
  updatedAt?: string;
  // TODO: needs source/address in contact_list tool
  source?: string;
  address?: string;
}

export type SortField = 'name' | 'createdAt';
export type SortDir = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid';

export interface ContactListResult {
  items?: ContactRow[];
  contacts?: ContactRow[];
  total?: number;
  page?: number;
  totalPages?: number;
}
