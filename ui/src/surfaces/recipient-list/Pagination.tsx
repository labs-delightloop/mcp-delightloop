import { ChevronLeft, ChevronRight } from '@untitledui/icons';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const safeTotal = Math.max(1, totalPages);
  const canPrev = page > 1;
  const canNext = page < safeTotal;

  const btn = (enabled: boolean) =>
    `inline-flex items-center gap-1 rounded-md border border-secondary px-3 py-1.5 text-sm font-medium transition-colors ${
      enabled
        ? 'bg-primary text-secondary hover:bg-secondary/40'
        : 'bg-secondary/30 text-tertiary cursor-not-allowed'
    }`;

  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        disabled={!canPrev}
        onClick={() => canPrev && onChange(page - 1)}
        className={btn(canPrev)}
      >
        <ChevronLeft className="size-4" />
        Prev
      </button>
      <span className="text-sm text-tertiary">
        Page {page} of {safeTotal}
      </span>
      <button
        type="button"
        disabled={!canNext}
        onClick={() => canNext && onChange(page + 1)}
        className={btn(canNext)}
      >
        Next
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
