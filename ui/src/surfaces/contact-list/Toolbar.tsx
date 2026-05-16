import { FilterLines, Rows03, SearchLg, Grid03 } from '@untitledui/icons';
import type { ViewMode } from './types';

export type ContactsTab = 'all-contacts' | 'lists';

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  total: number;
  activeTab: ContactsTab;
  onTabChange: (tab: ContactsTab) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenFilters?: () => void;
}

export function Toolbar({
  search,
  onSearchChange,
  total,
  activeTab,
  onTabChange,
  viewMode,
  onViewModeChange,
  onOpenFilters,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-secondary">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1">
          <TabButton
            label="All Contacts"
            active={activeTab === 'all-contacts'}
            onClick={() => onTabChange('all-contacts')}
          />
          <TabButton
            label="Lists"
            active={activeTab === 'lists'}
            onClick={() => onTabChange('lists')}
          />
        </div>
        <span className="text-sm text-tertiary whitespace-nowrap">
          {total.toLocaleString()} {total === 1 ? 'contact' : 'contacts'}
        </span>
      </div>

      <div className="flex items-center gap-2 pb-2 lg:pb-0">
        <div className="relative">
          <SearchLg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search contacts..."
            className="w-64 rounded-lg border border-secondary bg-primary pl-9 pr-3 py-2 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-utility-brand-500"
          />
        </div>
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex items-center gap-2 rounded-lg border border-secondary px-3 py-2 text-sm font-medium text-secondary hover:bg-secondary/40"
        >
          <FilterLines className="size-4" />
          Filters
        </button>
        <div className="inline-flex items-center rounded-lg border border-secondary overflow-hidden">
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
            className={
              viewMode === 'list'
                ? 'bg-secondary/60 text-primary p-2'
                : 'text-tertiary hover:bg-secondary/40 p-2'
            }
          >
            <Rows03 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
            className={
              viewMode === 'grid'
                ? 'bg-secondary/60 text-primary p-2 border-l border-secondary'
                : 'text-tertiary hover:bg-secondary/40 p-2 border-l border-secondary'
            }
          >
            <Grid03 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, active, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'relative px-1 py-3 text-sm font-semibold text-utility-brand-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-utility-brand-600'
          : 'relative px-1 py-3 text-sm font-medium text-tertiary hover:text-primary'
      }
    >
      <span className="px-2">{label}</span>
    </button>
  );
}
