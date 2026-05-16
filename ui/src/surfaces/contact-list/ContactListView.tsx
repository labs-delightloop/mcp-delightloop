import { useCallback, useEffect, useRef, useState } from 'react';
import { Slideout } from '../../lib/Slideout';
import { callTool, parseToolResult, ready } from '../../lib/mcp-app';
import { ContactCardContent } from '../contact-card/ContactCardContent';
import { type Contact, normalizeContact } from '../contact-card/types';
import { ContactsTable } from './ContactsTable';
import { Pagination } from './Pagination';
import { Toolbar } from './Toolbar';
import type { ContactListResult, ContactRow } from './types';

const PAGE_SIZE = 50;

function extractContacts(result: ContactListResult | null): ContactRow[] {
  if (!result) return [];
  return result.contacts ?? result.items ?? [];
}

export function ContactListView() {
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialConsumed = useRef(false);

  const [slideoutOpen, setSlideoutOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ContactRow | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [slideoutLoading, setSlideoutLoading] = useState(false);
  const [slideoutError, setSlideoutError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const applyResult = useCallback((data: ContactListResult) => {
    const items = extractContacts(data);
    setContacts(items);
    setTotal(data.total ?? items.length);
    setPage(data.page ?? 1);
    setTotalPages(data.totalPages ?? 1);
  }, []);

  const fetchPage = useCallback(
    async (pageNum: number, searchTerm: string) => {
      setLoading(true);
      try {
        const res = await callTool<ContactListResult>('contact_list', {
          page: pageNum,
          limit: PAGE_SIZE,
          search: searchTerm || undefined,
        });
        applyResult(res);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [applyResult]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const app = await ready();
        app.ontoolresult = (result) => {
          if (cancelled) return;
          try {
            const data = parseToolResult<ContactListResult>(result);
            applyResult(data);
            setLoading(false);
          } catch {
            // ignore — non-JSON result
          }
        };

        if (!initialConsumed.current) {
          initialConsumed.current = true;
          try {
            const initial = parseToolResult<ContactListResult>(
              (app as unknown as { initialToolResult?: Parameters<typeof parseToolResult>[0] })
                .initialToolResult ?? { content: [] }
            );
            applyResult(initial);
            setLoading(false);
            return;
          } catch {
            // no initial — fetch
          }
        }

        await fetchPage(1, '');
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
    if (!initialConsumed.current) return;
    fetchPage(page, debouncedSearch);
  }, [page, debouncedSearch, fetchPage]);

  const handleOpenRow = useCallback(async (row: ContactRow) => {
    setSelectedRow(row);
    setSelectedContact(null);
    setSlideoutError(null);
    setSlideoutLoading(true);
    setSlideoutOpen(true);

    try {
      const raw = await callTool<Record<string, unknown>>('contact_get', {
        contactId: row.contactId,
      });
      setSelectedContact(normalizeContact(raw));
    } catch (e) {
      setSlideoutError(e instanceof Error ? e.message : String(e));
    } finally {
      setSlideoutLoading(false);
    }
  }, []);

  const handleCloseSlideout = useCallback(() => {
    setSlideoutOpen(false);
    setSelectedRow(null);
    setSelectedContact(null);
    setSlideoutError(null);
    setSlideoutLoading(false);
  }, []);

  const handleContactUpdated = useCallback(
    (updated: Contact) => {
      setContacts((prev) =>
        prev.map((c) =>
          c.contactId === updated.id
            ? {
                ...c,
                firstName: updated.firstName,
                lastName: updated.lastName,
                fullName: updated.fullName,
                email: updated.email,
                companyName: updated.company,
                jobTitle: updated.jobTitle,
                linkedinUrl: updated.linkedinUrl,
              }
            : c
        )
      );
      setSelectedContact(updated);
    },
    []
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-utility-error-200 bg-utility-error-50 p-4 text-sm text-utility-error-700">
          {error}
        </div>
      </div>
    );
  }

  const slideoutTitle =
    selectedContact?.fullName || selectedRow?.fullName || 'Loading…';
  const slideoutSubtitle = selectedContact?.email ?? selectedRow?.email;

  return (
    <>
      <div className="p-6 max-w-[1280px] mx-auto space-y-6">
        <div>
          <h1 className="text-display-xs font-semibold text-primary">Contacts</h1>
          <p className="text-sm text-tertiary mt-1">
            {total} {total === 1 ? 'contact' : 'contacts'} in your organization
          </p>
        </div>

        <Toolbar search={search} onSearchChange={setSearch} total={total} />

        <ContactsTable
          contacts={contacts}
          loading={loading}
          onOpenRow={handleOpenRow}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <Slideout
        open={slideoutOpen}
        onClose={handleCloseSlideout}
        title={slideoutTitle}
        subtitle={slideoutSubtitle}
      >
        {slideoutLoading && (
          <div className="text-sm text-tertiary">Loading contact…</div>
        )}
        {!slideoutLoading && slideoutError && (
          <div className="rounded-lg border border-utility-error-200 bg-utility-error-50 p-4 text-sm text-utility-error-700">
            {slideoutError}
          </div>
        )}
        {!slideoutLoading && !slideoutError && selectedContact && (
          <ContactCardContent
            contact={selectedContact}
            onContactUpdated={handleContactUpdated}
          />
        )}
      </Slideout>
    </>
  );
}
