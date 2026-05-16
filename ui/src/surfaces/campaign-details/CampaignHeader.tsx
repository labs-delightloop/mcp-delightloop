import type { ComponentType, ReactNode } from 'react';
import {
  Heart,
  Plus,
  Settings01,
  Share01,
  Target01,
  Zap,
} from '@untitledui/icons';
import { StatusPill } from './StatusPill';
import type { CampaignResult } from './types';

interface CampaignHeaderProps {
  campaign: CampaignResult;
  onAddContacts?: () => void;
  onSettings?: () => void;
  onShare?: () => void;
}

interface TagChip {
  label: string;
  icon: ComponentType<{ className?: string }>;
  cls: string;
}

function deriveTagChips(campaign: CampaignResult): TagChip[] {
  const chips: TagChip[] = [];
  const goal = campaign.goal || campaign.campaignData?.goal?.name;
  if (goal) {
    chips.push({
      label: goal,
      icon: Target01,
      cls: 'bg-utility-brand-50 text-utility-brand-700 border-utility-brand-200',
    });
  }
  const motion = campaign.motion || campaign.campaignData?.motion?.name;
  if (motion) {
    chips.push({
      label: motion,
      icon: Zap,
      cls: 'bg-utility-orange-50 text-utility-orange-700 border-utility-orange-200',
    });
  }
  // TODO: requires expanded campaign output — donation rule, additional tags
  chips.push({
    label: 'Donation Not Allowed',
    icon: Heart,
    cls: 'bg-utility-pink-50 text-utility-pink-700 border-utility-pink-200',
  });
  return chips;
}

function TagChipPill({ chip }: { chip: TagChip }): ReactNode {
  const Icon = chip.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${chip.cls}`}
    >
      <Icon className="size-3.5" />
      {chip.label}
    </span>
  );
}

export function CampaignHeader({
  campaign,
  onAddContacts,
  onSettings,
  onShare,
}: CampaignHeaderProps) {
  const chips = deriveTagChips(campaign);
  const status = (campaign.status ?? 'live').toLowerCase();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold text-primary truncate">
            {campaign.name || 'Untitled campaign'}
          </h1>
          <StatusPill status={status} size="md" />
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {chips.map((c) => (
            <TagChipPill key={c.label} chip={c} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAddContacts}
          className="inline-flex items-center gap-2 rounded-md bg-utility-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-utility-brand-700 transition-colors"
        >
          <Plus className="size-4" />
          Add Contacts
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="rounded-md border border-secondary bg-primary p-2 text-secondary hover:bg-secondary/40 transition-colors"
          aria-label="Settings"
        >
          <Settings01 className="size-5" />
        </button>
        <button
          type="button"
          onClick={onShare}
          className="rounded-md border border-secondary bg-primary p-2 text-secondary hover:bg-secondary/40 transition-colors"
          aria-label="Share"
        >
          <Share01 className="size-5" />
        </button>
      </div>
    </div>
  );
}
