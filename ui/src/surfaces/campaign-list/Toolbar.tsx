import { FilterLines, SearchLg } from '@untitledui/icons';
import type { CampaignStatusFilter } from './types';

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: CampaignStatusFilter;
  onStatusChange: (value: CampaignStatusFilter) => void;
  view: 'grid' | 'list';
  onViewChange: (v: 'grid' | 'list') => void;
  activeTab: 'all' | 'mine';
  onTabChange: (t: 'all' | 'mine') => void;
}

const STATUS_OPTIONS: Array<{ value: CampaignStatusFilter; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'live', label: 'Live' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
];

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        active
          ? 'bg-primary text-primary shadow-xs border border-secondary'
          : 'text-tertiary hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}

function ViewToggleButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
        active ? 'bg-primary text-primary shadow-xs border border-secondary' : 'text-tertiary hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}

export function Toolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  view,
  onViewChange,
  activeTab,
  onTabChange,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="inline-flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
        <TabButton active={activeTab === 'all'} onClick={() => onTabChange('all')}>
          View all
        </TabButton>
        <TabButton active={activeTab === 'mine'} onClick={() => onTabChange('mine')}>
          My Lists
        </TabButton>
      </div>

      <div className="flex flex-1 items-center gap-2 md:justify-end">
        <div className="relative flex-1 md:max-w-xs">
          <SearchLg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="w-full rounded-lg border border-secondary bg-primary py-2 pl-9 pr-3 text-sm text-primary placeholder:text-tertiary shadow-xs focus:outline-none focus:ring-2 focus:ring-utility-brand-500 focus:border-utility-brand-500"
          />
        </div>

        <div className="relative">
          <FilterLines className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary" />
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as CampaignStatusFilter)}
            className="appearance-none rounded-lg border border-secondary bg-primary py-2 pl-9 pr-8 text-sm text-secondary shadow-xs focus:outline-none focus:ring-2 focus:ring-utility-brand-500 focus:border-utility-brand-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label === 'All statuses' ? 'Filters' : opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="inline-flex items-center gap-1 rounded-lg border border-secondary bg-primary p-1 shadow-xs">
          <ViewToggleButton
            active={view === 'list'}
            onClick={() => onViewChange('list')}
            label="List view"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M2 4h12M2 8h12M2 12h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </ViewToggleButton>
          <ViewToggleButton
            active={view === 'grid'}
            onClick={() => onViewChange('grid')}
            label="Grid view"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </ViewToggleButton>
        </div>
      </div>
    </div>
  );
}
