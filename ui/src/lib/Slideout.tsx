import { useEffect, type ReactNode } from 'react';
import { XClose } from '@untitledui/icons';

interface SlideoutProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  widthClass?: string;
}

export function Slideout({
  open,
  onClose,
  title,
  subtitle,
  children,
  widthClass = 'w-full sm:w-[640px] lg:w-[720px]',
}: SlideoutProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`relative ${widthClass} bg-primary shadow-2xl flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-secondary">
          <div className="min-w-0">
            {title && (
              <h2 className="text-lg font-semibold text-primary truncate">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-tertiary truncate">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-tertiary hover:text-primary hover:bg-secondary/60"
            aria-label="Close"
          >
            <XClose className="size-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}
