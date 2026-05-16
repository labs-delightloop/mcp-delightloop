import type { ComponentType } from 'react';
import {
  CheckCircle,
  Clock,
  Mail01,
  PauseCircle,
  Pencil01,
  RefreshCw01,
  Rocket02,
  Truck01,
  XCircle,
} from '@untitledui/icons';
import { BadgeWithDot, BadgeWithIcon } from '@/components/base/badges/badges';

type StatusSize = 'sm' | 'md';

interface StatusPillProps {
  status: string;
  size?: StatusSize;
}

type IconCmp = ComponentType<{ className?: string }>;

type BadgeColor =
  | 'gray'
  | 'brand'
  | 'error'
  | 'warning'
  | 'success'
  | 'blue'
  | 'orange'
  | 'purple';

const STATUS_MAP: Record<string, { color: BadgeColor; icon: IconCmp }> = {
  ready: { color: 'orange', icon: Rocket02 },
  invited: { color: 'blue', icon: Mail01 },
  invite_sent: { color: 'blue', icon: Mail01 },
  delivered: { color: 'success', icon: CheckCircle },
  acknowledged: { color: 'success', icon: CheckCircle },
  address_confirmed: { color: 'blue', icon: CheckCircle },
  processing: { color: 'blue', icon: RefreshCw01 },
  shipped: { color: 'purple', icon: Truck01 },
  in_transit: { color: 'purple', icon: Truck01 },
  cancelled: { color: 'error', icon: XCircle },
  draft: { color: 'gray', icon: Pencil01 },
  preparing: { color: 'blue', icon: Clock },
  paused: { color: 'warning', icon: PauseCircle },
  completed: { color: 'gray', icon: CheckCircle },
};

const STATUS_LABEL: Record<string, string> = {
  ready: 'Ready to Launch',
  invited: 'Invited',
  invite_sent: 'Invite Sent',
  address_confirmed: 'Address Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  acknowledged: 'Acknowledged',
  cancelled: 'Cancelled',
  draft: 'Draft',
  live: 'LIVE',
  paused: 'Paused',
  preparing: 'Preparing',
  completed: 'Completed',
};

export function StatusPill({ status, size = 'sm' }: StatusPillProps) {
  const label = STATUS_LABEL[status] ?? status.replace(/_/g, ' ');

  if (status === 'live') {
    return (
      <BadgeWithDot type='pill-color' color='success' size={size}>
        {label}
      </BadgeWithDot>
    );
  }

  const entry = STATUS_MAP[status];
  if (entry) {
    return (
      <BadgeWithIcon
        type='pill-color'
        color={entry.color}
        size={size}
        iconLeading={entry.icon}
      >
        {label}
      </BadgeWithIcon>
    );
  }

  return (
    <BadgeWithDot type='pill-color' color='gray' size={size}>
      {label}
    </BadgeWithDot>
  );
}
