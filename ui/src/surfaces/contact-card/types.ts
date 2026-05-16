export interface ContactTag {
  name: string;
  color?: string;
}

export interface CustomField {
  key: string;
  value: string | number | boolean | null;
}

export interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  secondaryEmail?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  seniority?: string;
  department?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  location?: string;
  country?: string;
  city?: string;
  timezone?: string;
  tags?: ContactTag[];
  customFields?: CustomField[] | Record<string, unknown>;
  source?: string;
  profileImage?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Normalises the raw `contact_get` passthrough payload. The Delightloop API
 * returns `mailId` / `phoneNumber` / `companyName` rather than the friendlier
 * names we want to render.
 */
export function normalizeContact(raw: Record<string, unknown>): Contact {
  const get = <T = unknown>(...keys: string[]): T | undefined => {
    for (const k of keys) {
      const v = raw[k];
      if (v !== undefined && v !== null && v !== '') return v as T;
    }
    return undefined;
  };

  const id =
    get<string>('id', '_id', 'contactId') ?? String(raw.contactId ?? '');

  const firstName = get<string>('firstName');
  const lastName = get<string>('lastName');
  const explicitFullName = get<string>('fullName', 'name');
  const fullName =
    explicitFullName ?? ([firstName, lastName].filter(Boolean).join(' ') || undefined);

  return {
    id,
    firstName,
    lastName,
    fullName,
    email: get<string>('email', 'mailId', 'primaryEmail'),
    secondaryEmail: get<string>('secondaryEmail', 'secondaryMailId'),
    phone: get<string>('phone', 'phoneNumber'),
    company: get<string>('company', 'companyName'),
    jobTitle: get<string>('jobTitle', 'title'),
    seniority: get<string>('seniority'),
    department: get<string>('department'),
    linkedinUrl: get<string>('linkedinUrl', 'linkedIn', 'linkedInUrl'),
    twitterUrl: get<string>('twitterUrl', 'twitter'),
    location: get<string>('location'),
    country: get<string>('country'),
    city: get<string>('city'),
    timezone: get<string>('timezone', 'timeZone'),
    tags: get<ContactTag[]>('tags'),
    customFields: get<CustomField[] | Record<string, unknown>>(
      'customFields',
      'custom_fields'
    ),
    source: get<string>('source'),
    profileImage: get<string>('profileImage', 'profile_image', 'avatarUrl'),
    address: get<string>('address'),
    createdAt: get<string>('createdAt', 'created_at'),
    updatedAt: get<string>('updatedAt', 'updated_at'),
  };
}
