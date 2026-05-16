import { Card } from '@/components/application/cards/card';
import { StatusPill } from './StatusPill';
import type { RecipientRow } from './types';

interface RecipientsTableProps {
  recipients: RecipientRow[];
  loading?: boolean;
}

function initials(name?: string): string {
  if (!name) return '?';
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

export function RecipientsTable({ recipients, loading }: RecipientsTableProps) {
  return (
    <Card.Root>
      <div className="px-5 py-4 border-b border-secondary flex items-center justify-between">
        <div>
          <h3 className="text-md font-semibold text-primary">Recipients</h3>
          <p className="text-sm text-tertiary">
            {recipients.length} {recipients.length === 1 ? 'person' : 'people'}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40">
            <tr className="text-left text-tertiary">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Tags</th>
              <th className="px-5 py-3 font-medium">Last update</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-5 py-8 text-center text-tertiary" colSpan={5}>
                  Loading recipients…
                </td>
              </tr>
            )}
            {!loading && recipients.length === 0 && (
              <tr>
                <td className="px-5 py-8 text-center text-tertiary" colSpan={5}>
                  No recipients yet.
                </td>
              </tr>
            )}
            {!loading &&
              recipients.map((r) => (
                <tr
                  key={r.recipientId}
                  className="border-t border-secondary hover:bg-secondary/30"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-utility-brand-50 text-utility-brand-700 text-xs font-semibold">
                        {initials(r.name)}
                      </span>
                      <span className="text-primary font-medium">
                        {r.name || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-secondary">{r.email || '—'}</td>
                  <td className="px-5 py-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-5 py-3">
                    {r.tags && r.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {r.tags.map((t, idx) => (
                          <span
                            key={`${t.name}-${idx}`}
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                            style={{ backgroundColor: `${t.color}22`, color: t.color }}
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-tertiary">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-tertiary">
                    {formatDate(r.updatedAt ?? r.createdAt)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card.Root>
  );
}
