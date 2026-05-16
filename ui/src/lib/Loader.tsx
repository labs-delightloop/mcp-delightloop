interface LoaderProps {
  size?: number;
  className?: string;
  label?: string;
}

export function Loader({ size = 48, className = '', label }: LoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <svg
        width={size}
        height={size / 2}
        viewBox="0 0 64 32"
        xmlns="http://www.w3.org/2000/svg"
        className="dl-infinity-loader"
        aria-hidden="true"
      >
        <path
          d="M16 16 C16 6, 30 6, 32 16 C34 26, 48 26, 48 16 C48 6, 34 6, 32 16 C30 26, 16 26, 16 16 Z"
          fill="none"
          stroke="#7F56D9"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="40 100"
          strokeDashoffset="0"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-140"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      {label && <p className="text-sm text-tertiary">{label}</p>}
    </div>
  );
}

export function FullPageLoader({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center py-12">
      <Loader size={64} label={label} />
    </div>
  );
}
