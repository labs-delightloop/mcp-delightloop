import { Plus } from '@untitledui/icons';
import { useEffect, useMemo, useState } from 'react';
import { FullPageLoader } from '../../lib/Loader';
import { callTool, parseToolResult, ready } from '../../lib/mcp-app';
import { Slideout } from '../../lib/Slideout';
import { CampaignDetailsContent } from '../campaign-details/CampaignDetailsContent';
import type { CampaignResult } from '../campaign-details/types';
import { CampaignCard } from './CampaignCard';
import { Toolbar } from './Toolbar';
import type {
  CampaignListItem,
  CampaignListResult,
  CampaignStatusFilter,
} from './types';

export function CampaignListView() {
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [total, setTotal] = useState<number | undefined>();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CampaignStatusFilter>('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialApplied, setInitialApplied] = useState(false);

  const [selectedCampaign, setSelectedCampaign] = useState<CampaignResult | null>(null);
  const [slideoutLoading, setSlideoutLoading] = useState(false);
  const [slideoutError, setSlideoutError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const app = await ready();
        app.ontoolresult = (result) => {
          if (cancelled) return;
          try {
            const data = parseToolResult<CampaignListResult>(result);
            if (data && Array.isArray(data.campaigns)) {
              setCampaigns(data.campaigns);
              setTotal(data.total);
              setLoading(false);
            }
          } catch {
            // ignore — non-JSON result
          }
        };

        try {
          const initial = parseToolResult<CampaignListResult>(
            (app as unknown as { initialToolResult?: Parameters<typeof parseToolResult>[0] })
              .initialToolResult ?? { content: [] }
          );
          if (initial && Array.isArray(initial.campaigns) && initial.campaigns.length > 0) {
            if (!cancelled) {
              setCampaigns(initial.campaigns);
              setTotal(initial.total);
              setLoading(false);
              setInitialApplied(true);
              return;
            }
          }
        } catch {
          // initial not available — fall through to fetch
        }

        if (!cancelled) {
          setInitialApplied(true);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!initialApplied) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, unknown> = {
          returnAll: false,
          limit: 50,
        };
        if (status) params.status = status;
        if (search.trim()) params.search = search.trim();

        const res = await callTool<CampaignListResult>('campaign_list', params);
        if (cancelled) return;
        setCampaigns(res.campaigns ?? []);
        setTotal(res.total);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, search, initialApplied]);

  const displayedTotal = useMemo(
    () => total ?? campaigns.length,
    [total, campaigns.length]
  );

  const handleOpen = async (c: CampaignListItem) => {
    setSlideoutError(null);
    setSelectedCampaign(null);
    setSlideoutLoading(true);
    try {
      const res = await callTool<CampaignResult>('campaign_get', {
        campaignId: c.campaignId,
      });
      setSelectedCampaign(res);
    } catch (e) {
      setSlideoutError(e instanceof Error ? e.message : String(e));
    } finally {
      setSlideoutLoading(false);
    }
  };

  const handleSlideoutClose = () => {
    setSelectedCampaign(null);
    setSlideoutError(null);
    setSlideoutLoading(false);
  };

  const slideoutOpen = !!selectedCampaign || slideoutLoading || !!slideoutError;

  return (
    <div className="p-6 space-y-6 max-w-[1280px] mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-display-xs font-semibold text-primary">Campaign Overview</h1>
          <p className="text-sm text-tertiary">
            Track delivery rates, engagement, and ROI in real-time.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-utility-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-utility-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
      </div>

      <Toolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        view={view}
        onViewChange={setView}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {error && (
        <div className="rounded-lg border border-utility-error-200 bg-utility-error-50 p-4 text-sm text-utility-error-700">
          {error}
        </div>
      )}

      {loading && campaigns.length === 0 && <FullPageLoader />}

      {!loading && !error && campaigns.length === 0 && (
        <div className="rounded-lg border border-secondary bg-secondary/30 p-8 text-center text-tertiary text-sm">
          No campaigns match your filters.
        </div>
      )}

      {campaigns.length > 0 && (
        <div
          className={
            view === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5'
              : 'flex flex-col gap-3'
          }
        >
          {campaigns.map((c) => (
            <CampaignCard key={c.campaignId} campaign={c} onOpen={handleOpen} />
          ))}
        </div>
      )}

      <p className="text-xs text-tertiary text-right">
        {displayedTotal} {displayedTotal === 1 ? 'campaign' : 'campaigns'}
      </p>

      <Slideout
        open={slideoutOpen}
        onClose={handleSlideoutClose}
        title={selectedCampaign?.name || (slideoutLoading ? 'Loading…' : 'Campaign')}
        subtitle={selectedCampaign?.campaignId}
      >
        {slideoutLoading && !selectedCampaign && <FullPageLoader />}
        {slideoutError && (
          <div className="rounded-lg border border-utility-error-200 bg-utility-error-50 p-4 text-sm text-utility-error-700">
            {slideoutError}
          </div>
        )}
        {selectedCampaign && <CampaignDetailsContent campaign={selectedCampaign} />}
      </Slideout>
    </div>
  );
}
