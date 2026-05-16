import type { ReactNode } from 'react';
import {
  FilterLines,
  Plus,
  SearchMd,
  Tag01,
} from '@untitledui/icons';

interface ToolbarButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

function ToolbarButton({ icon, label, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-secondary bg-primary px-3 py-1.5 text-sm font-medium text-secondary hover:bg-secondary/40 transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}

interface TableToolbarProps {
  onSearch?: () => void;
  onFilter?: () => void;
  onTags?: () => void;
  onMore?: () => void;
}

export function TableToolbar({ onSearch, onFilter, onTags, onMore }: TableToolbarProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <ToolbarButton icon={<SearchMd className="size-4" />} label="Search" onClick={onSearch} />
      <ToolbarButton icon={<FilterLines className="size-4" />} label="Filter" onClick={onFilter} />
      <ToolbarButton icon={<Tag01 className="size-4" />} label="Tags" onClick={onTags} />
      <ToolbarButton icon={<Plus className="size-4" />} label="More" onClick={onMore} />
    </div>
  );
}
