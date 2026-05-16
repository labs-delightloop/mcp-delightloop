import { FilterLines, SearchLg } from '@untitledui/icons';
import type { CampaignStatusFilter } from './types';

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: CampaignStatusFilter;
  onStatusChange: (value: CampaignStatusFilter) => void;
  total: number;
}

const STATUS_OPTIONS: Array<{ value: CampaignStatusFilter; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'live', label: 'Live' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
];

export function Toolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  total,
}: ToolbarProps) {
  return (
    <div className="rounded-lg border border-secondary bg-primary p-3 flex flex-col md:flex-row md:items-center gap-3">
      <div className="relative flex-1">
        <SearchLg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search campaigns by name…"
          className="w-full rounded-md border border-secondary bg-primary py-2 pl-9 pr-3 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-utility-brand-500 focus:border-utility-brand-500"
        />
      </div>

      <div className="relative">
        <FilterLines className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary" />
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as CampaignStatusFilter)}
          className="appearance-none rounded-md border border-secondary bg-primary py-2 pl-9 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-utility-brand-500 focus:border-utility-brand-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="text-sm text-tertiary md:ml-auto whitespace-nowrap">
        {total} {total === 1 ? 'result' : 'results'}
      </div>
    </div>
  );
}
