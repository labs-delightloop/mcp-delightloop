import { useCallback, useEffect, useMemo, useState } from 'react';
import { Send01 } from '@untitledui/icons';
import { callTool, parseToolResult, ready } from '../../lib/mcp-app';
import { Pagination } from './Pagination';
import { RecipientsTableInteractive } from './RecipientsTableInteractive';
import { StatusFilter } from './StatusFilter';
import type { RecipientListResult, RecipientStatus } from './types';

const PAGE_SIZE = 50;

export function RecipientListView() {
  const [data, setData] = useState<RecipientListResult | null>(null);
  const [status, setStatus] = useState<RecipientStatus | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const app = await ready();
        app.ontoolresult = (result) => {
          if (cancelled) return;
          try {
            const parsed = parseToolResult<RecipientListResult>(result);
            setData(parsed);
            setLoading(false);
          } catch {
            // ignore — non-JSON result
          }
        };

        try {
          const initial = parseToolResult<RecipientListResult>(
            (app as unknown as { initialToolResult?: Parameters<typeof parseToolResult>[0] })
              .initialToolResult ?? { content: [] }
          );
          setData(initial);
          setLoading(false);
        } catch {
          // wait for ontoolresult
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const campaignId = data?.campaignId;

  useEffect(() => {
    if (!campaignId) return;
    if (reloadKey === 0 && data && status === null && page === 1) {
      return;
    }
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await callTool<RecipientListResult>('recipient_list', {
          campaignId,
          page,
          limit: PAGE_SIZE,
          ...(status ? { status } : {}),
        });
        if (cancelled) return;
        setData((prev) => ({
          ...res,
          statusCounts: res.statusCounts ?? prev?.statusCounts,
        }));
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
  }, [campaignId, status, page, reloadKey]);

  const recipients = data?.recipients ?? [];
  const total = data?.total ?? recipients.length;
  const totalPages = data?.totalPages ?? 1;
  const statusCounts = data?.statusCounts ?? {};
  const totalAcrossAll = useMemo(
    () => Object.values(statusCounts).reduce((a, b) => a + b, 0) || total,
    [statusCounts, total]
  );

  const selectedReadyIds = useMemo(() => {
    return recipients
      .filter((r) => selected.has(r.recipientId) && r.status === 'ready')
      .map((r) => r.recipientId);
  }, [recipients, selected]);

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

  const handleFilterChange = useCallback((s: RecipientStatus | null) => {
    setStatus(s);
    setPage(1);
    setSelected(new Set());
  }, []);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    setSelected(new Set());
  }, []);

  const launch = useCallback(
    async (ids: string[]) => {
      if (!campaignId || ids.length === 0) return;
      setLaunching(true);
      try {
        await callTool('campaign_launch_recipients', {
          campaignId,
          recipientIds: ids,
        });
        setSelected(new Set());
        setReloadKey((k) => k + 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLaunching(false);
      }
    },
    [campaignId]
  );

  const handleLaunchSelected = useCallback(
    () => launch(selectedReadyIds),
    [launch, selectedReadyIds]
  );

  const handleLaunchOne = useCallback((id: string) => launch([id]), [launch]);

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-utility-error-200 bg-utility-error-50 p-4 text-sm text-utility-error-700">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-tertiary text-sm">Loading recipients…</div>;
  }

  const showLaunch = selectedReadyIds.length > 0;

  return (
    <div className="p-6 max-w-[1280px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary">Recipients</h1>
          <p className="text-sm text-tertiary">
            {totalAcrossAll} total{status ? ` · filtered by ${status.replace(/_/g, ' ')}` : ''}
          </p>
        </div>
        {showLaunch && (
          <button
            type="button"
            disabled={launching}
            onClick={handleLaunchSelected}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              launching
                ? 'bg-utility-brand-100 text-utility-brand-400 cursor-not-allowed'
                : 'bg-utility-brand-600 text-white hover:bg-utility-brand-700'
            }`}
          >
            <Send01 className="size-4" />
            {launching
              ? 'Launching…'
              : `Launch ${selectedReadyIds.length} ready ${
                  selectedReadyIds.length === 1 ? 'recipient' : 'recipients'
                }`}
          </button>
        )}
      </div>

      <StatusFilter
        active={status}
        counts={statusCounts}
        total={totalAcrossAll}
        onChange={handleFilterChange}
      />

      <RecipientsTableInteractive
        recipients={recipients}
        loading={loading}
        selectedIds={selected}
        onToggle={handleToggle}
        onToggleAll={handleToggleAll}
        onLaunchOne={handleLaunchOne}
        launching={launching}
      />

      <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
    </div>
  );
}
