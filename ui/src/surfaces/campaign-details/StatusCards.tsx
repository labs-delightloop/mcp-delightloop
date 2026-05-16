import { Card } from '@/components/application/cards/card';
import {
  Gift01,
  MessageChatSquare,
  Pencil01,
  Truck01,
  Users01,
} from '@untitledui/icons';
import { useMemo } from 'react';
import type { RecipientRow } from './types';

interface StatusCardItem {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

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
const PENDING_STATUSES = new Set(['ready', 'invited', 'invite_sent', 'draft']);

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
    let draft = 0;
    for (const r of recipients) {
      if (r.status === 'draft') draft++;
      if (PENDING_STATUSES.has(r.status)) pending++;
      if (SENT_STATUSES.has(r.status)) sent++;
      if (DELIVERED_STATUSES.has(r.status)) delivered++;
    }
    const main: StatusCardItem[] = [
      {
        label: 'Recipients',
        value: total,
        icon: Users01,
        color: 'text-utility-blue-light-700 bg-utility-blue-light-50',
      },
      {
        label: 'Pending Confirmation',
        value: pending,
        icon: Users01,
        color: 'text-utility-orange-700 bg-utility-orange-50',
      },
      {
        label: 'Gifts Sent',
        value: sent,
        icon: Gift01,
        color: 'text-utility-purple-700 bg-utility-purple-50',
      },
      {
        label: 'Delivered',
        value: delivered,
        icon: Truck01,
        color: 'text-utility-orange-700 bg-utility-orange-50',
      },
    ];
    if (draft > 0) {
      main.splice(1, 0, {
        label: 'Draft',
        value: draft,
        icon: Pencil01,
        color: 'text-utility-gray-700 bg-utility-gray-50',
      });
    } else {
      main.push({
        label: 'Feedback',
        value: 0,
        icon: MessageChatSquare,
        color: 'text-utility-purple-400 bg-utility-purple-100',
      });
    }
    return main;
  }, [recipients, totalRecipients]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {items.map((i) => (
        <Card.Root key={i.label}>
          <Card.Content className="py-4">
            <div className="flex flex-col justify-between min-h-[88px]">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span
                  className={`inline-flex items-center justify-center rounded-full p-2 ${i.color}`}
                >
                  <i.icon className="size-5" />
                </span>
                <p className="text-xs sm:text-sm leading-snug break-words text-tertiary">
                  {i.label}
                </p>
              </div>
              <p className="text-2xl font-semibold text-primary self-start">
                {i.value}
              </p>
            </div>
          </Card.Content>
        </Card.Root>
      ))}
    </div>
  );
}
