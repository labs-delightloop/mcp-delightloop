import { useMemo, useState } from 'react';
import {
  Bell01,
  Calendar,
  ChevronSelectorVertical,
  Clock,
  Copy01,
  Eye,
  Gift01,
  Link01,
  Plus,
  ThumbsUp,
} from '@untitledui/icons';
import { Avatar } from '../../lib/Avatar';
import { Loader } from '../../lib/Loader';
import { StatusPill } from './StatusPill';
import type { RecipientRow } from './types';

interface RecipientsTableProps {
  recipients: RecipientRow[];
  loading?: boolean;
  selectedIds?: Set<string>;
  onToggle?: (id: string) => void;
  onToggleAll?: (ids: string[], selected: boolean) => void;
}

function formatDateAdded(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function SortHeader({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-tertiary">
      {label}
      <ChevronSelectorVertical className="size-3.5 text-tertiary" />
    </span>
  );
}

function CopyButton({ value }: { value?: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      className="ml-1 inline-flex items-center text-tertiary hover:text-primary"
      aria-label="Copy email"
    >
      <Copy01 className={`size-3 ${copied ? 'text-utility-success-600' : ''}`} />
    </button>
  );
}

function GiftThumb({ src }: { src?: string | null }) {
  if (src) {
    return (
      <img
        src={src}
        alt="gift"
        className="size-8 rounded object-cover border border-secondary"
      />
    );
  }
  return (
    <div className="size-8 rounded border border-secondary bg-gradient-to-br from-utility-brand-100 to-utility-pink-100 flex items-center justify-center">
      <Gift01 className="size-4 text-utility-brand-700" />
    </div>
  );
}

function IconActionBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-md p-1 text-tertiary hover:text-primary hover:bg-secondary/40 transition-colors"
    >
      <Icon className="size-4" />
    </button>
  );
}

export function RecipientsTable({
  recipients,
  loading,
  selectedIds,
  onToggle,
  onToggleAll,
}: RecipientsTableProps) {
  const localSelected = useState<Set<string>>(new Set());
  const selected = selectedIds ?? localSelected[0];
  const setLocal = localSelected[1];

  const toggleOne = (id: string) => {
    if (onToggle) return onToggle(id);
    setLocal((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (ids: string[], checked: boolean) => {
    if (onToggleAll) return onToggleAll(ids, checked);
    setLocal((prev) => {
      const next = new Set(prev);
      if (checked) ids.forEach((id) => next.add(id));
      else ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const visibleIds = useMemo(() => recipients.map((r) => r.recipientId), [recipients]);
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const someSelected =
    !allSelected && visibleIds.some((id) => selected.has(id));

  return (
    <div className="rounded-lg border border-secondary bg-primary overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/30">
            <tr className="text-left text-xs font-medium text-tertiary">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => toggleAll(visibleIds, e.target.checked)}
                  className="size-4 rounded border-secondary"
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3 font-medium">
                <SortHeader label="Recipient" />
              </th>
              <th className="px-4 py-3 font-medium">
                <SortHeader label="Company & Role" />
              </th>
              <th className="px-4 py-3 font-medium">Gift</th>
              <th className="px-4 py-3 font-medium">
                <SortHeader label="Status" />
              </th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium">
                <SortHeader label="Key Dates" />
              </th>
              <th className="px-4 py-3 font-medium">Insights</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-12" colSpan={9}>
                  <div className="flex items-center justify-center">
                    <Loader size={48} />
                  </div>
                </td>
              </tr>
            )}
            {!loading && recipients.length === 0 && (
              <tr>
                <td className="px-4 py-12 text-center text-tertiary" colSpan={9}>
                  No recipients yet.
                </td>
              </tr>
            )}
            {!loading &&
              recipients.map((r) => {
                const isSelected = selected.has(r.recipientId);
                return (
                  <tr
                    key={r.recipientId}
                    className="border-t border-secondary hover:bg-secondary/20"
                  >
                    <td className="px-4 py-3 align-middle">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(r.recipientId)}
                        className="size-4 rounded border-secondary"
                        aria-label={`Select ${r.name ?? r.recipientId}`}
                      />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={r.profileImage} name={r.name} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-primary font-medium truncate">
                              {r.name || '—'}
                            </span>
                            {/* TODO: requires expanded recipient_list output (linkedinUrl) */}
                            <Link01 className="size-3.5 text-utility-blue-light-600" />
                          </div>
                          {r.email && (
                            <div className="flex items-center text-xs text-tertiary">
                              <span className="truncate">{r.email}</span>
                              <CopyButton value={r.email} />
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {/* TODO: requires expanded recipient_list output (company, role) */}
                      <div className="min-w-0">
                        <div className="text-primary truncate">
                          {r.company ?? '—'}
                        </div>
                        <div className="text-xs text-tertiary truncate">
                          {r.role ?? '—'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <GiftThumb src={r.giftThumbnail} />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {r.tags && r.tags.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                          {r.tags.map((t, idx) => (
                            <span
                              key={`${t.name}-${idx}`}
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                              style={{
                                backgroundColor: `${t.color}22`,
                                color: t.color,
                              }}
                            >
                              {t.name}
                            </span>
                          ))}
                          <IconActionBtn icon={Plus} label="Add tag" />
                        </div>
                      ) : (
                        <IconActionBtn icon={Plus} label="Add tag" />
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="inline-flex items-center gap-1.5 text-xs text-tertiary">
                        <Calendar className="size-3.5" />
                        <span>Date Added: {formatDateAdded(r.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-1">
                        <IconActionBtn icon={Clock} label="Activity" />
                        <IconActionBtn icon={ThumbsUp} label="Engagement" />
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-1">
                        <IconActionBtn icon={Eye} label="View" />
                        <IconActionBtn icon={Bell01} label="Notify" />
                        <IconActionBtn icon={Link01} label="Copy link" />
                        <IconActionBtn icon={Plus} label="More" />
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
