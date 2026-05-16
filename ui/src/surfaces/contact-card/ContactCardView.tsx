import { useEffect, useState } from 'react';
import { FullPageLoader } from '../../lib/Loader';
import { parseToolResult, ready } from '../../lib/mcp-app';
import { ContactCardContent } from './ContactCardContent';
import { type Contact, normalizeContact } from './types';

const EMPTY_STATE_MESSAGE =
  'Open a contact from the contact list to view';

export function ContactCardView() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const app = await ready();
        app.ontoolresult = (result) => {
          if (cancelled) return;
          try {
            const raw = parseToolResult<Record<string, unknown>>(result);
            setContact(normalizeContact(raw));
            setError(null);
          } catch {
            // ignore — non-JSON result
          }
        };

        try {
          const raw = parseToolResult<Record<string, unknown>>(
            (app as unknown as { initialToolResult?: Parameters<typeof parseToolResult>[0] })
              .initialToolResult ?? { content: [] }
          );
          if (!cancelled) setContact(normalizeContact(raw));
        } catch {
          if (!cancelled) setError(EMPTY_STATE_MESSAGE);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <FullPageLoader />;
  }

  if (!contact && error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-utility-error-200 bg-utility-error-50 p-4 text-sm text-utility-error-700">
          {error}
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-6 text-sm text-tertiary">{EMPTY_STATE_MESSAGE}</div>
    );
  }

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <ContactCardContent contact={contact} />
    </div>
  );
}
