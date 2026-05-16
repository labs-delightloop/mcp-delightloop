import type { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange?: (id: string) => void;
}

export function Tabs({ items, activeId, onChange }: TabsProps) {
  return (
    <div className="border-b border-secondary">
      <nav className="-mb-px flex gap-6 overflow-x-auto" aria-label="Tabs">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const base =
            'inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3 pt-2 text-sm font-medium transition-colors';
          const cls = isActive
            ? 'border-utility-brand-600 text-utility-brand-700'
            : item.disabled
              ? 'border-transparent text-tertiary cursor-not-allowed opacity-60'
              : 'border-transparent text-secondary hover:text-primary hover:border-secondary';
          return (
            <button
              key={item.id}
              type="button"
              disabled={item.disabled}
              onClick={() => !item.disabled && onChange?.(item.id)}
              className={`${base} ${cls}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
