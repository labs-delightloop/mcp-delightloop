import { Card } from '@/components/application/cards/card';
import { Calendar, Target01 } from '@untitledui/icons';
import { StatusPill } from './StatusPill';
import type { CampaignResult } from './types';

interface CampaignHeaderProps {
  campaign: CampaignResult;
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function CampaignHeader({ campaign }: CampaignHeaderProps) {
  return (
    <Card.Root>
      <div className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-semibold text-primary truncate">
              {campaign.name || 'Untitled campaign'}
            </h2>
            {campaign.status && <StatusPill status={campaign.status} />}
          </div>
          <p className="mt-1 text-sm text-tertiary font-mono">
            {campaign.campaignId}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-secondary">
          {campaign.goal && (
            <div className="flex items-center gap-2">
              <Target01 className="size-4 text-tertiary" />
              <span>{campaign.goal}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-tertiary" />
            <span>Created {formatDate(campaign.createdAt)}</span>
          </div>
        </div>
      </div>
    </Card.Root>
  );
}
