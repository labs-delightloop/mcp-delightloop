interface StatusPillProps {
  status: string;
}

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-utility-gray-50 text-utility-gray-700',
  ready: 'bg-utility-blue-light-50 text-utility-blue-light-700',
  invited: 'bg-utility-orange-50 text-utility-orange-700',
  invite_sent: 'bg-utility-orange-50 text-utility-orange-700',
  address_confirmed: 'bg-utility-blue-50 text-utility-blue-700',
  processing: 'bg-utility-blue-50 text-utility-blue-700',
  shipped: 'bg-utility-purple-50 text-utility-purple-700',
  in_transit: 'bg-utility-purple-50 text-utility-purple-700',
  delivered: 'bg-utility-success-50 text-utility-success-700',
  acknowledged: 'bg-utility-success-100 text-utility-success-700',
  cancelled: 'bg-utility-error-50 text-utility-error-700',
  live: 'bg-utility-success-50 text-utility-success-700',
  paused: 'bg-utility-warning-50 text-utility-warning-700',
  preparing: 'bg-utility-blue-50 text-utility-blue-700',
  completed: 'bg-utility-gray-50 text-utility-gray-700',
};

export function StatusPill({ status }: StatusPillProps) {
  const cls = STATUS_COLOR[status] ?? 'bg-utility-gray-50 text-utility-gray-700';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
