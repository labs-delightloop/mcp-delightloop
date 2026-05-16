import { useEffect, useState } from 'react';
import {
  CheckCircle,
  Clock,
  CursorClick01,
  Gift01,
  LinkExternal01,
  Mail01,
  MessageChatSquare,
} from '@untitledui/icons';
import { FullPageLoader } from '../../lib/Loader';
import { Slideout } from '../../lib/Slideout';
import { callTool } from '../../lib/mcp-app';

interface TimelineEvent {
  type?: string;
  nodeType?: string;
  eventType?: string;
  timestamp?: string;
  createdAt?: string;
  description?: string;
  label?: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface TimelineResponse {
  events?: TimelineEvent[];
  timeline?: TimelineEvent[];
  recipient?: Record<string, unknown>;
  selectedGift?: { image?: string; name?: string; title?: string };
  [key: string]: unknown;
}

interface RecipientTimelinePanelProps {
  recipientId: string;
  recipientName?: string;
  recipientEmail?: string;
  open: boolean;
  onClose: () => void;
}

function iconForType(type: string): {
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
} {
  const t = type.toLowerCase();
  if (t.includes('open') || t.includes('click') || t.includes('visit'))
    return { Icon: CursorClick01, color: 'text-utility-blue-600', bg: 'bg-utility-blue-50' };
  if (t.includes('email') || t.includes('invite') || t.includes('sent') || t.includes('mail'))
    return { Icon: Mail01, color: 'text-utility-brand-700', bg: 'bg-utility-brand-50' };
  if (t.includes('gift') || t.includes('deliver') || t.includes('transit') || t.includes('donat'))
    return { Icon: Gift01, color: 'text-utility-pink-600', bg: 'bg-utility-pink-50' };
  if (t.includes('acknowledg') || t.includes('confirm') || t.includes('success'))
    return { Icon: CheckCircle, color: 'text-utility-success-600', bg: 'bg-utility-success-50' };
  if (t.includes('feedback') || t.includes('message'))
    return { Icon: MessageChatSquare, color: 'text-utility-purple-600', bg: 'bg-utility-purple-50' };
  if (t.includes('engag') || t.includes('link'))
    return { Icon: LinkExternal01, color: 'text-utility-blue-light-600', bg: 'bg-utility-blue-light-50' };
  return { Icon: Clock, color: 'text-tertiary', bg: 'bg-secondary' };
}

function humanizeType(type: string): string {
  return type
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTimestamp(ts?: string): string {
  if (!ts) return '';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function RecipientTimelinePanel({
  recipientId,
  recipientName,
  recipientEmail,
  open,
  onClose,
}: RecipientTimelinePanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TimelineResponse | null>(null);

  useEffect(() => {
    if (!open || !recipientId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    callTool<TimelineResponse>('recipient_timeline_get', { recipientId })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Failed to load timeline');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, recipientId]);

  const events: TimelineEvent[] =
    (data?.events as TimelineEvent[]) ??
    (data?.timeline as TimelineEvent[]) ??
    [];

  return (
    <Slideout
      open={open}
      onClose={onClose}
      title={recipientName || 'Recipient timeline'}
      subtitle={recipientEmail}
    >
      {loading && <FullPageLoader />}
      {!loading && error && (
        <div className="rounded-md border border-utility-error-300 bg-utility-error-50 p-3 text-sm text-utility-error-700">
          {error}
        </div>
      )}
      {!loading && !error && events.length === 0 && (
        <div className="text-sm text-tertiary">No activity yet.</div>
      )}
      {!loading && !error && events.length > 0 && (
        <ol className="relative space-y-5">
          {events.map((ev, idx) => {
            const type =
              ev.type ?? ev.nodeType ?? ev.eventType ?? 'event';
            const { Icon, color, bg } = iconForType(type);
            const ts = ev.timestamp ?? ev.createdAt;
            const isLast = idx === events.length - 1;
            const description =
              ev.description ??
              ev.label ??
              (ev.data && typeof ev.data === 'object'
                ? ((ev.data as Record<string, unknown>).subject as string | undefined) ??
                  ((ev.data as Record<string, unknown>).notes as string | undefined)
                : undefined);
            return (
              <li key={`${type}-${ts ?? idx}`} className="relative flex gap-3">
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[15px] top-8 h-[calc(100%+8px)] w-px bg-secondary"
                  />
                )}
                <div
                  className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${bg}`}
                >
                  <Icon className={`size-4 ${color}`} />
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="text-sm font-semibold text-primary">
                    {humanizeType(type)}
                  </div>
                  {ts && (
                    <div className="text-xs text-tertiary mt-0.5">
                      {formatTimestamp(ts)}
                    </div>
                  )}
                  {description && (
                    <div className="text-sm text-secondary mt-1 break-words">
                      {description}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Slideout>
  );
}
