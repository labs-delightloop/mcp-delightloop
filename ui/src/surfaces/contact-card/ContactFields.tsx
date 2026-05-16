import { Card } from '@/components/application/cards/card';
import type { Contact, CustomField } from './types';

interface ContactFieldsProps {
  contact: Contact;
}

interface Field {
  label: string;
  value: string;
}

function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function joinLocation(contact: Contact): string | undefined {
  if (contact.location) return contact.location;
  const parts = [contact.city, contact.country].filter(Boolean);
  return parts.length ? parts.join(', ') : undefined;
}

function customFieldEntries(
  cf: Contact['customFields']
): Field[] {
  if (!cf) return [];
  if (Array.isArray(cf)) {
    return (cf as CustomField[])
      .filter((f) => f && f.key && f.value != null && f.value !== '')
      .map((f) => ({ label: f.key, value: String(f.value) }));
  }
  return Object.entries(cf)
    .filter(([_, v]) => v != null && v !== '')
    .map(([k, v]) => ({ label: k, value: String(v) }));
}

function buildFields(contact: Contact): Field[] {
  const base: Array<[string, string | undefined]> = [
    ['Job title', contact.jobTitle],
    ['Company', contact.company],
    ['Department', contact.department],
    ['Seniority', contact.seniority],
    ['Email', contact.email],
    ['Secondary email', contact.secondaryEmail],
    ['Phone', contact.phone],
    ['Location', joinLocation(contact)],
    ['Timezone', contact.timezone],
    ['LinkedIn', contact.linkedinUrl],
    ['Twitter', contact.twitterUrl],
    ['Source', contact.source],
    ['Created', formatDate(contact.createdAt)],
    ['Updated', formatDate(contact.updatedAt)],
  ];

  const fields: Field[] = base
    .filter(([_, v]) => v && v.length > 0)
    .map(([label, value]) => ({ label, value: value as string }));

  return [...fields, ...customFieldEntries(contact.customFields)];
}

export function ContactFields({ contact }: ContactFieldsProps) {
  const fields = buildFields(contact);

  if (fields.length === 0) {
    return (
      <Card.Root>
        <div className="px-6 py-5">
          <h3 className="text-md font-semibold text-primary">Details</h3>
          <p className="mt-3 text-sm text-tertiary">No additional details.</p>
        </div>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <div className="px-6 py-5">
        <h3 className="text-md font-semibold text-primary">Details</h3>
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {fields.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="text-xs text-tertiary">{f.label}</dt>
              <dd className="mt-0.5 text-sm text-secondary break-words">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Card.Root>
  );
}
