import { Card } from '@/components/application/cards/card';
import { StatusPill } from '../campaign-details/StatusPill';
import type { CampaignListItem } from './types';

// TODO: needs campaign_metrics_get tool for recipient counts + progress bar + status breakdown.

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
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 30) return `${day}d ago`;
  if (mo < 12) return `${mo}mo ago`;
  return `${yr}y ago`;
}

function TagChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-secondary/60 px-2 py-0.5 text-xs font-medium text-secondary">
      {children}
    </span>
  );
}

function MetricCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-xs text-tertiary truncate">{label}</span>
      <span className="text-sm font-medium text-primary truncate">{value}</span>
    </div>
  );
}

export function CampaignCard({ campaign, onOpen }: CampaignCardProps) {
  const goal = campaign.goal?.trim();
  const motion = campaign.motion?.trim();

  return (
    <Card.Root
      className="p-5 transition-colors hover:bg-secondary/30 cursor-pointer flex flex-col gap-4"
      onClick={onOpen ? () => onOpen(campaign) : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className="text-md font-semibold text-primary truncate flex-1 min-w-0"
          title={campaign.name || 'Untitled campaign'}
        >
          {campaign.name || 'Untitled campaign'}
        </h3>
        {campaign.status && <StatusPill status={campaign.status} />}
      </div>

      {(goal || motion) && (
        <div className="flex flex-wrap gap-1.5">
          {goal && <TagChip>{goal}</TagChip>}
          {motion && <TagChip>{motion}</TagChip>}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <MetricCell label="Recipients" value="—" />
        <MetricCell label="Highlight" value="—" />
        <MetricCell label="Created" value={relativeTime(campaign.createdAt)} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-tertiary">Status</span>
        <div className="h-2 w-full rounded-full bg-secondary/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-utility-purple-400 to-utility-purple-600"
            style={{ width: '0%' }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-tertiary">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-utility-gray-400" />
            Pending (—)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-utility-purple-500" />
            Transit (—)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-utility-success-500" />
            Delivered (—)
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-tertiary">
        <span>Updated {relativeTime(campaign.updatedAt)}</span>
        <span>—</span>
      </div>
      <div className="h-1 w-full rounded-full bg-secondary/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-utility-purple-400 to-utility-purple-600"
          style={{ width: '0%' }}
        />
      </div>
    </Card.Root>
  );
}
