import { useEffect, useState } from 'react';
import { callTool } from '../../lib/mcp-app';
import { CampaignHeader } from './CampaignHeader';
import { RecipientsTable } from './RecipientsTable';
import { StatusCards } from './StatusCards';
import type { CampaignResult, RecipientListResult, RecipientRow } from './types';

interface CampaignDetailsContentProps {
  campaign: CampaignResult;
}

export function CampaignDetailsContent({ campaign }: CampaignDetailsContentProps) {
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);
  const [totalRecipients, setTotalRecipients] = useState<number | undefined>();
  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (error) {
    return (
      <div className="space-y-6">
        <CampaignHeader campaign={campaign} />
        <div className="rounded-lg border border-utility-error-200 bg-utility-error-50 p-4 text-sm text-utility-error-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CampaignHeader campaign={campaign} />
      <StatusCards recipients={recipients} totalRecipients={totalRecipients} />
      <RecipientsTable recipients={recipients} loading={recipientsLoading} />
    </div>
  );
}
