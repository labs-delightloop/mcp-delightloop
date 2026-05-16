import { ChevronLeft, ChevronRight } from '@untitledui/icons';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const safeTotal = Math.max(1, totalPages);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= safeTotal;

  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={prevDisabled}
        className="inline-flex items-center gap-1 rounded-lg border border-secondary px-3 py-2 text-sm font-medium text-primary hover:bg-secondary/40 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </button>
      <span className="text-sm text-tertiary">
        Page {page} of {safeTotal}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={nextDisabled}
        className="inline-flex items-center gap-1 rounded-lg border border-secondary px-3 py-2 text-sm font-medium text-primary hover:bg-secondary/40 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
