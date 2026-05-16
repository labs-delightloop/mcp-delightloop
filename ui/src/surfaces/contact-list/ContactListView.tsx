import { Plus, UserPlus01 } from '@untitledui/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FullPageLoader, Loader } from '../../lib/Loader';
import { Slideout } from '../../lib/Slideout';
import { callTool, parseToolResult, ready } from '../../lib/mcp-app';
import { ContactCardContent } from '../contact-card/ContactCardContent';
import { type Contact, normalizeContact } from '../contact-card/types';
import { ContactsTable } from './ContactsTable';
import { Pagination } from './Pagination';
import { Toolbar, type ContactsTab } from './Toolbar';
import type {
  ContactListResult,
  ContactRow,
  SortDir,
  SortField,
  ViewMode,
} from './types';

const PAGE_SIZE = 50;

function extractContacts(result: ContactListResult | null): ContactRow[] {
  if (!result) return [];
  return result.contacts ?? result.items ?? [];
}

function compareContacts(
  a: ContactRow,
  b: ContactRow,
  field: SortField,
  dir: SortDir
): number {
  let cmp = 0;
  if (field === 'name') {
    const an = (a.fullName || `${a.firstName ?? ''} ${a.lastName ?? ''}`).trim().toLowerCase();
    const bn = (b.fullName || `${b.firstName ?? ''} ${b.lastName ?? ''}`).trim().toLowerCase();
    cmp = an.localeCompare(bn);
  } else {
    const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    cmp = at - bt;
  }
  return dir === 'asc' ? cmp : -cmp;
}

export function ContactListView() {
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialConsumed = useRef(false);

  const [activeTab, setActiveTab] = useState<ContactsTab>('all-contacts');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

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
        setInitialLoad(false);
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
            setInitialLoad(false);
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
            setInitialLoad(false);
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
          setInitialLoad(false);
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

  const handleContactUpdated = useCallback((updated: Contact) => {
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
  }, []);

  const handleSortChange = useCallback(
    (field: SortField) => {
      if (field === sortField) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir(field === 'createdAt' ? 'desc' : 'asc');
      }
    },
    [sortField]
  );

  const sortedContacts = useMemo(() => {
    const arr = [...contacts];
    arr.sort((a, b) => compareContacts(a, b, sortField, sortDir));
    return arr;
  }, [contacts, sortField, sortDir]);

  if (initialLoad) {
    return <FullPageLoader />;
  }

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
    selectedContact?.fullName || selectedRow?.fullName || 'Contact';
  const slideoutSubtitle = selectedContact?.email ?? selectedRow?.email;

  return (
    <>
      <div className="p-6 max-w-[1440px] mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-display-xs font-semibold text-primary">
              Contact Lists
            </h1>
            <p className="text-sm text-tertiary mt-1">
              Manage your contact lists and audience segments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-secondary bg-primary px-3.5 py-2 text-sm font-semibold text-secondary hover:bg-secondary/40"
            >
              <UserPlus01 className="size-4" />
              Add Contact
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-solid px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-solid_hover"
            >
              <Plus className="size-4" />
              New Contact List
            </button>
          </div>
        </div>

        <Toolbar
          search={search}
          onSearchChange={setSearch}
          total={total}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={56} />
          </div>
        ) : activeTab === 'lists' ? (
          <div className="rounded-lg border border-secondary bg-primary p-12 text-center text-sm text-tertiary">
            Contact lists view coming soon.
          </div>
        ) : (
          <ContactsTable
            contacts={sortedContacts}
            onOpenRow={handleOpenRow}
            sortField={sortField}
            sortDir={sortDir}
            onSortChange={handleSortChange}
          />
        )}

        {!loading && activeTab === 'all-contacts' && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      <Slideout
        open={slideoutOpen}
        onClose={handleCloseSlideout}
        title={slideoutTitle}
        subtitle={slideoutSubtitle}
      >
        {slideoutLoading && <FullPageLoader />}
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
