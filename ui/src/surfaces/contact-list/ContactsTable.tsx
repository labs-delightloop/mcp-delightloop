import { Card } from '@/components/application/cards/card';
import {
  ArrowDown,
  ArrowUp,
  Edit03,
  LinkExternal01,
  SwitchVertical01,
} from '@untitledui/icons';
import { Avatar } from '../../lib/Avatar';
import { Loader } from '../../lib/Loader';
import type { ContactRow, SortDir, SortField } from './types';

interface ContactsTableProps {
  contacts: ContactRow[];
  loading?: boolean;
  onOpenRow?: (contact: ContactRow) => void;
  sortField: SortField;
  sortDir: SortDir;
  onSortChange: (field: SortField) => void;
}

function displayName(c: ContactRow): string {
  if (c.fullName) return c.fullName;
  const parts = [c.firstName, c.lastName].filter(Boolean);
  return parts.length ? parts.join(' ') : '—';
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function sourcePillClass(source?: string): string {
  const s = (source ?? '').toLowerCase();
  if (s === 'manual') {
    return 'bg-utility-blue-50 text-utility-blue-700';
  }
  if (s === 'api') {
    return 'bg-utility-gray-50 text-utility-gray-700';
  }
  if (s === 'import' || s === 'csv') {
    return 'bg-utility-success-50 text-utility-success-700';
  }
  return 'bg-utility-gray-50 text-utility-gray-700';
}

interface SortHeaderProps {
  label: string;
  field: SortField;
  active: boolean;
  dir: SortDir;
  onSortChange: (field: SortField) => void;
}

function SortHeader({ label, field, active, dir, onSortChange }: SortHeaderProps) {
  return (
    <button
      type="button"
      onClick={() => onSortChange(field)}
      className="inline-flex items-center gap-1 font-medium text-tertiary hover:text-primary transition-colors"
    >
      <span>{label}</span>
      {active ? (
        dir === 'asc' ? (
          <ArrowUp className="size-3.5 text-utility-brand-600" />
        ) : (
          <ArrowDown className="size-3.5 text-utility-brand-600" />
        )
      ) : (
        <SwitchVertical01 className="size-3.5 opacity-60" />
      )}
    </button>
  );
}

export function ContactsTable({
  contacts,
  loading,
  onOpenRow,
  sortField,
  sortDir,
  onSortChange,
}: ContactsTableProps) {
  return (
    <Card.Root>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40">
            <tr className="text-left">
              <th className="px-5 py-3">
                <SortHeader
                  label="Name"
                  field="name"
                  active={sortField === 'name'}
                  dir={sortDir}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-5 py-3 font-medium text-tertiary">Company</th>
              <th className="px-5 py-3 font-medium text-tertiary">Role</th>
              <th className="px-5 py-3 font-medium text-tertiary">Source</th>
              <th className="px-5 py-3 font-medium text-tertiary">Address</th>
              <th className="px-5 py-3">
                <SortHeader
                  label="Created At"
                  field="createdAt"
                  active={sortField === 'createdAt'}
                  dir={sortDir}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-5 py-3 font-medium text-tertiary text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-5 py-12" colSpan={7}>
                  <div className="flex items-center justify-center">
                    <Loader size={48} />
                  </div>
                </td>
              </tr>
            )}
            {!loading && contacts.length === 0 && (
              <tr>
                <td
                  className="px-5 py-12 text-center text-tertiary"
                  colSpan={7}
                >
                  No contacts found.
                </td>
              </tr>
            )}
            {!loading &&
              contacts.map((c) => {
                const name = displayName(c);
                return (
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
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          src={c.profileImage}
                          name={name}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-primary font-medium truncate">
                              {name}
                            </span>
                            {c.linkedinUrl && (
                              <a
                                href={c.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="LinkedIn profile"
                                className="inline-flex items-center justify-center rounded p-0.5 text-utility-brand-600 hover:bg-utility-brand-50"
                              >
                                <LinkExternal01 className="size-3.5" />
                              </a>
                            )}
                          </div>
                          {c.email && (
                            <div className="text-xs text-tertiary truncate">
                              {c.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-secondary">
                      {c.companyName || '—'}
                    </td>
                    <td className="px-5 py-3 text-secondary">
                      <div className="max-w-[200px] truncate">
                        {c.jobTitle || '—'}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {c.source ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sourcePillClass(
                            c.source
                          )}`}
                        >
                          {c.source}
                        </span>
                      ) : (
                        <span className="text-tertiary">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-secondary">
                      {c.address || '—'}
                    </td>
                    <td className="px-5 py-3 text-tertiary whitespace-nowrap">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenRow?.(c);
                        }}
                        aria-label="Edit contact"
                        className="inline-flex items-center justify-center rounded-md p-1.5 text-tertiary hover:bg-secondary hover:text-primary transition-colors"
                      >
                        <Edit03 className="size-4" />
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
