import { useEffect, useState } from 'react';
import { parseToolResult, ready } from '../../lib/mcp-app';
import { FullPageLoader } from '../../lib/Loader';
import { CampaignDetailsContent } from './CampaignDetailsContent';
import type { CampaignResult } from './types';

export function CampaignDetailsView() {
  const [campaign, setCampaign] = useState<CampaignResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const app = await ready();
        app.ontoolresult = (result) => {
          if (cancelled) return;
          try {
            const data = parseToolResult<CampaignResult>(result);
            setCampaign(data);
          } catch {
            // ignore — non-JSON result
          }
        };

        try {
          const initial = parseToolResult<CampaignResult>(
            (app as unknown as { initialToolResult?: Parameters<typeof parseToolResult>[0] })
              .initialToolResult ?? { content: [] }
          );
          if (!cancelled) setCampaign(initial);
        } catch {
          // initial not available — wait for ontoolresult
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-utility-error-200 bg-utility-error-50 p-4 text-sm text-utility-error-700">
          {error}
        </div>
      </div>
    );
  }

  if (!campaign) {
    return <FullPageLoader />;
  }

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <CampaignDetailsContent campaign={campaign} />
    </div>
  );
}
