import { SearchLg } from '@untitledui/icons';

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  total: number;
}

export function Toolbar({ search, onSearchChange, total }: ToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <SearchLg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, email, company, or job title"
          className="w-full rounded-lg border border-secondary bg-primary pl-9 pr-3 py-2 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-utility-brand-500"
        />
      </div>
      <span className="text-sm text-tertiary whitespace-nowrap">
        {total} {total === 1 ? 'contact' : 'contacts'}
      </span>
    </div>
  );
}
