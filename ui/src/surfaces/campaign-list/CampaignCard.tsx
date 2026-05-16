import { Card } from '@/components/application/cards/card';
import { Calendar, Send01, Target01 } from '@untitledui/icons';
import { StatusPill } from '../campaign-details/StatusPill';
import type { CampaignListItem } from './types';

interface CampaignCardProps {
  campaign: CampaignListItem;
  onOpen?: (campaign: CampaignListItem) => void;
}

function relativeTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const diffMs = Date.now() - d.getTime();
  const sec = Math.round(diffMs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  const mo = Math.round(day / 30);
  const yr = Math.round(day / 365);

  if (sec < 60) return 'just now';
  if (min < 60) return `${min} ${min === 1 ? 'minute' : 'minutes'} ago`;
  if (hr < 24) return `${hr} ${hr === 1 ? 'hour' : 'hours'} ago`;
  if (day < 30) return `${day} ${day === 1 ? 'day' : 'days'} ago`;
  if (mo < 12) return `${mo} ${mo === 1 ? 'month' : 'months'} ago`;
  return `${yr} ${yr === 1 ? 'year' : 'years'} ago`;
}

export function CampaignCard({ campaign, onOpen }: CampaignCardProps) {
  return (
    <Card.Root
      className="p-5 transition-colors hover:bg-secondary/30 cursor-pointer"
      onClick={onOpen ? () => onOpen(campaign) : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className="text-md font-semibold text-primary truncate"
          title={campaign.name || 'Untitled campaign'}
        >
          {campaign.name || 'Untitled campaign'}
        </h3>
        {campaign.status && <StatusPill status={campaign.status} />}
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-secondary">
          <Target01 className="h-4 w-4 text-tertiary" />
          <span className="text-tertiary">Goal:</span>
          <span className="text-primary truncate">{campaign.goal || '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-secondary">
          <Send01 className="h-4 w-4 text-tertiary" />
          <span className="text-tertiary">Motion:</span>
          <span className="text-primary truncate">{campaign.motion || '—'}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-secondary flex items-center justify-between text-xs text-tertiary">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>Created {relativeTime(campaign.createdAt)}</span>
        </div>
        <div>Updated {relativeTime(campaign.updatedAt)}</div>
      </div>
    </Card.Root>
  );
}
