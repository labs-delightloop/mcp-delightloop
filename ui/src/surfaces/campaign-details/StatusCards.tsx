import {
  Gift01,
  MessageChatSquare,
  Truck01,
  UserCheck01,
  Users01,
} from '@untitledui/icons';
import { useMemo, type ComponentType } from 'react';
import type { RecipientRow } from './types';

interface StatusCardItem {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

const PENDING_STATUSES = new Set(['ready', 'draft']);
const SENT_STATUSES = new Set([
  'invited',
  'invite_sent',
  'address_confirmed',
  'processing',
  'shipped',
  'in_transit',
  'delivered',
  'acknowledged',
]);
const DELIVERED_STATUSES = new Set(['delivered', 'acknowledged']);

interface StatusCardsProps {
  recipients: RecipientRow[];
  totalRecipients?: number;
}

export function StatusCards({ recipients, totalRecipients }: StatusCardsProps) {
  const items = useMemo<StatusCardItem[]>(() => {
    const total = totalRecipients ?? recipients.length;
    let pending = 0;
    let sent = 0;
    let delivered = 0;
    for (const r of recipients) {
      if (PENDING_STATUSES.has(r.status)) pending++;
      if (SENT_STATUSES.has(r.status)) sent++;
      if (DELIVERED_STATUSES.has(r.status)) delivered++;
    }
    return [
      {
        label: 'Recipients',
        value: total,
        icon: Users01,
        iconBg: 'bg-utility-blue-light-50',
        iconColor: 'text-utility-blue-light-700',
      },
      {
        label: 'Pending Confirmation',
        value: pending,
        icon: UserCheck01,
        iconBg: 'bg-utility-orange-50',
        iconColor: 'text-utility-orange-700',
      },
      {
        label: 'Gifts Sent',
        value: sent,
        icon: Gift01,
        iconBg: 'bg-utility-brand-50',
        iconColor: 'text-utility-brand-700',
      },
      {
        label: 'Delivered',
        value: delivered,
        icon: Truck01,
        iconBg: 'bg-utility-purple-50',
        iconColor: 'text-utility-purple-700',
      },
      {
        label: 'Feedback',
        value: 0,
        icon: MessageChatSquare,
        iconBg: 'bg-utility-pink-50',
        iconColor: 'text-utility-pink-700',
      },
    ];
  }, [recipients, totalRecipients]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((i) => (
        <div
          key={i.label}
          className="rounded-lg border border-secondary bg-primary p-4 flex flex-col gap-3"
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center justify-center rounded-full size-9 ${i.iconBg} ${i.iconColor}`}
            >
              <i.icon className="size-5" />
            </span>
            <p className="text-sm text-secondary font-medium leading-snug">
              {i.label}
            </p>
          </div>
          <p className="text-3xl font-semibold text-primary leading-none">
            {i.value}
          </p>
        </div>
      ))}
    </div>
  );
}
