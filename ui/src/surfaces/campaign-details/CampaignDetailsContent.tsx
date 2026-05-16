import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from '@untitledui/icons';
import { callTool } from '../../lib/mcp-app';
import { FullPageLoader } from '../../lib/Loader';
import { CampaignHeader } from './CampaignHeader';
import { RecipientsTable } from './RecipientsTable';
import { StatusCards } from './StatusCards';
import { Tabs, type TabItem } from './Tabs';
import { TableToolbar } from './TableToolbar';
import type { CampaignResult, RecipientListResult, RecipientRow } from './types';

interface CampaignDetailsContentProps {
  campaign: CampaignResult;
}

const TAB_ITEMS: TabItem[] = [
  { id: 'recipients', label: 'Recipients' },
  { id: 'my-recipients', label: 'My Recipients', disabled: true },
  { id: 'lookup', label: 'Lookup', disabled: true },
  { id: 'audience', label: 'Audience', disabled: true },
  { id: 'analytics', label: 'Analytics', disabled: true },
  { id: 'insights', label: 'Insights', disabled: true },
];

export function CampaignDetailsContent({ campaign }: CampaignDetailsContentProps) {
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);
  const [totalRecipients, setTotalRecipients] = useState<number | undefined>();
  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('recipients');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!campaign.campaignId) return;
    let cancelled = false;

    (async () => {
      setRecipientsLoading(true);
      setError(null);
      try {
        const res = await callTool<RecipientListResult>('recipient_list', {
          campaignId: campaign.campaignId,
          returnAll: true,
        });
        if (cancelled) return;
        setRecipients(res.recipients ?? []);
        setTotalRecipients(res.total);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setRecipientsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [campaign.campaignId]);

  const handleToggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback((ids: string[], checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) ids.forEach((id) => next.add(id));
      else ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const tabContent = useMemo(() => {
    if (activeTab !== 'recipients') {
      return (
        <div className="rounded-lg border border-secondary bg-primary p-12 text-center text-sm text-tertiary">
          Coming soon
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <TableToolbar />
        <RecipientsTable
          recipients={recipients}
          loading={recipientsLoading}
          selectedIds={selected}
          onToggle={handleToggle}
          onToggleAll={handleToggleAll}
        />
      </div>
    );
  }, [activeTab, recipients, recipientsLoading, selected, handleToggle, handleToggleAll]);

  return (
    <div className="space-y-6">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-sm text-tertiary hover:text-secondary"
      >
        <ArrowLeft className="size-4" />
        Back to Campaigns
      </button>

      <CampaignHeader campaign={campaign} />

      {error ? (
        <div className="rounded-lg border border-utility-error-200 bg-utility-error-50 p-4 text-sm text-utility-error-700">
          {error}
        </div>
      ) : null}

      <StatusCards recipients={recipients} totalRecipients={totalRecipients} />

      <Tabs items={TAB_ITEMS} activeId={activeTab} onChange={setActiveTab} />

      {tabContent}
    </div>
  );
}

export { FullPageLoader };
