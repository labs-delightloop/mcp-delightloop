import { useMemo } from 'react';
import { PlayCircle } from '@untitledui/icons';
import { Card } from '@/components/application/cards/card';
import { StatusPill } from '../campaign-details/StatusPill';
import type { RecipientRow } from './types';

interface RecipientsTableInteractiveProps {
  recipients: RecipientRow[];
  loading?: boolean;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[], selected: boolean) => void;
  onLaunchOne: (id: string) => void;
  launching?: boolean;
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

export function RecipientsTableInteractive({
  recipients,
  loading,
  selectedIds,
  onToggle,
  onToggleAll,
  onLaunchOne,
  launching,
}: RecipientsTableInteractiveProps) {
  const visibleIds = useMemo(() => recipients.map((r) => r.recipientId), [recipients]);
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someSelected =
    !allSelected && visibleIds.some((id) => selectedIds.has(id));

  return (
    <Card.Root>
      <div className="px-5 py-4 border-b border-secondary flex items-center justify-between">
        <div>
          <h3 className="text-md font-semibold text-primary">Recipients</h3>
          <p className="text-sm text-tertiary">
            {recipients.length} {recipients.length === 1 ? 'person' : 'people'}
            {selectedIds.size > 0 ? ` · ${selectedIds.size} selected` : ''}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40">
            <tr className="text-left text-tertiary">
              <th className="px-5 py-3 font-medium w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => onToggleAll(visibleIds, e.target.checked)}
                  className="size-4 rounded border-secondary"
                  aria-label="Select all"
                />
              </th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Tags</th>
              <th className="px-5 py-3 font-medium">Last update</th>
              <th className="px-5 py-3 font-medium w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-5 py-8 text-center text-tertiary" colSpan={7}>
                  Loading recipients…
                </td>
              </tr>
            )}
            {!loading && recipients.length === 0 && (
              <tr>
                <td className="px-5 py-8 text-center text-tertiary" colSpan={7}>
                  No recipients found.
                </td>
              </tr>
            )}
            {!loading &&
              recipients.map((r) => {
                const isReady = r.status === 'ready';
                const isSelected = selectedIds.has(r.recipientId);
                return (
                  <tr
                    key={r.recipientId}
                    className="border-t border-secondary hover:bg-secondary/30"
                  >
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggle(r.recipientId)}
                        className="size-4 rounded border-secondary"
                        aria-label={`Select ${r.name ?? r.recipientId}`}
                      />
                    </td>
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
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        disabled={!isReady || launching}
                        onClick={() => isReady && !launching && onLaunchOne(r.recipientId)}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                          isReady && !launching
                            ? 'bg-utility-brand-50 text-utility-brand-700 hover:bg-utility-brand-100'
                            : 'bg-secondary/40 text-tertiary cursor-not-allowed'
                        }`}
                      >
                        <PlayCircle className="size-3.5" />
                        Launch
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </Card.Root>
  );
}
