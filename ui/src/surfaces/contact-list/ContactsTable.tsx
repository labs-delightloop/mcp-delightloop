import { Card } from '@/components/application/cards/card';
import type { ContactRow } from './types';

interface ContactsTableProps {
  contacts: ContactRow[];
  loading?: boolean;
  onOpenRow?: (contact: ContactRow) => void;
}

function displayName(c: ContactRow): string {
  if (c.fullName) return c.fullName;
  const parts = [c.firstName, c.lastName].filter(Boolean);
  return parts.length ? parts.join(' ') : '—';
}

function initials(c: ContactRow): string {
  const name = displayName(c);
  if (name === '—') return '?';
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ContactsTable({
  contacts,
  loading,
  onOpenRow,
}: ContactsTableProps) {
  return (
    <Card.Root>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40">
            <tr className="text-left text-tertiary">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Company</th>
              <th className="px-5 py-3 font-medium">Job Title</th>
              <th className="px-5 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-5 py-8 text-center text-tertiary" colSpan={5}>
                  Loading contacts…
                </td>
              </tr>
            )}
            {!loading && contacts.length === 0 && (
              <tr>
                <td className="px-5 py-8 text-center text-tertiary" colSpan={5}>
                  No contacts found.
                </td>
              </tr>
            )}
            {!loading &&
              contacts.map((c) => (
                <tr
                  key={c.contactId}
                  onClick={onOpenRow ? () => onOpenRow(c) : undefined}
                  className={
                    onOpenRow
                      ? 'border-t border-secondary hover:bg-secondary/30 cursor-pointer'
                      : 'border-t border-secondary'
                  }
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-utility-brand-50 text-utility-brand-700 text-xs font-semibold">
                        {initials(c)}
                      </span>
                      <span className="text-primary font-medium">
                        {displayName(c)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-secondary">{c.email || '—'}</td>
                  <td className="px-5 py-3 text-secondary">
                    {c.companyName || '—'}
                  </td>
                  <td className="px-5 py-3 text-secondary">
                    {c.jobTitle || '—'}
                  </td>
                  <td className="px-5 py-3 text-tertiary">
                    {formatDate(c.updatedAt ?? c.createdAt)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card.Root>
  );
}
