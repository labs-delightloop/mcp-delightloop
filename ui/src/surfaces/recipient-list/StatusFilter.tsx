import { RECIPIENT_STATUSES, type RecipientStatus } from './types';

interface StatusFilterProps {
  active: RecipientStatus | null;
  counts: Record<string, number>;
  total: number;
  onChange: (status: RecipientStatus | null) => void;
}

function label(status: string): string {
  return status.replace(/_/g, ' ');
}

export function StatusFilter({ active, counts, total, onChange }: StatusFilterProps) {
  const pill = (isActive: boolean) =>
    `inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
      isActive
        ? 'bg-utility-brand-50 text-utility-brand-700 border-utility-brand-200'
        : 'bg-primary text-secondary border-secondary hover:bg-secondary/40'
    }`;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={pill(active === null)}
      >
        All
        <span className="rounded-full bg-secondary/60 px-1.5 py-0.5 text-[10px] text-tertiary">
          {total}
        </span>
      </button>
      {RECIPIENT_STATUSES.map((s) => {
        const count = counts[s] ?? 0;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={pill(active === s)}
          >
            <span className="capitalize">{label(s)}</span>
            <span className="rounded-full bg-secondary/60 px-1.5 py-0.5 text-[10px] text-tertiary">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
