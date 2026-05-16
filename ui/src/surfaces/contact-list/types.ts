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
}

export interface ContactListResult {
  items?: ContactRow[];
  contacts?: ContactRow[];
  total?: number;
  page?: number;
  totalPages?: number;
}
