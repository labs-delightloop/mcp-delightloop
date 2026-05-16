import { Card } from '@/components/application/cards/card';
import { Edit03 } from '@untitledui/icons';
import { useState } from 'react';
import { callTool } from '../../lib/mcp-app';
import { ContactFields } from './ContactFields';
import { ContactHeader } from './ContactHeader';
import { ContactTags } from './ContactTags';
import type { Contact } from './types';

interface ContactCardContentProps {
  contact: Contact;
  onContactUpdated?: (updated: Contact) => void;
}

type EditableKey =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'companyName'
  | 'jobTitle'
  | 'phone'
  | 'linkedinUrl';

interface EditableFieldDef {
  key: EditableKey;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url';
  placeholder?: string;
}

const EDITABLE_FIELDS: EditableFieldDef[] = [
  { key: 'firstName', label: 'First name', type: 'text' },
  { key: 'lastName', label: 'Last name', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'companyName', label: 'Company', type: 'text' },
  { key: 'jobTitle', label: 'Job title', type: 'text' },
  { key: 'phone', label: 'Phone', type: 'tel' },
  {
    key: 'linkedinUrl',
    label: 'LinkedIn URL',
    type: 'url',
    placeholder: 'https://linkedin.com/in/...',
  },
];

type Draft = Partial<Record<EditableKey, string>>;

function readField(contact: Contact, key: EditableKey): string {
  switch (key) {
    case 'firstName':
      return contact.firstName ?? '';
    case 'lastName':
      return contact.lastName ?? '';
    case 'email':
      return contact.email ?? '';
    case 'companyName':
      return contact.company ?? '';
    case 'jobTitle':
      return contact.jobTitle ?? '';
    case 'phone':
      return contact.phone ?? '';
    case 'linkedinUrl':
      return contact.linkedinUrl ?? '';
  }
}

function buildDraft(contact: Contact): Draft {
  const d: Draft = {};
  for (const f of EDITABLE_FIELDS) d[f.key] = readField(contact, f.key);
  return d;
}

function diffDraft(contact: Contact, draft: Draft): Partial<Record<EditableKey, string>> {
  const out: Partial<Record<EditableKey, string>> = {};
  for (const f of EDITABLE_FIELDS) {
    const current = readField(contact, f.key);
    const next = (draft[f.key] ?? '').trim();
    if (next !== current.trim() && next.length > 0) {
      out[f.key] = next;
    }
  }
  return out;
}

function applyDraftToContact(contact: Contact, draft: Draft): Contact {
  const next: Contact = { ...contact };
  for (const f of EDITABLE_FIELDS) {
    const v = (draft[f.key] ?? '').trim();
    const value = v.length > 0 ? v : undefined;
    switch (f.key) {
      case 'firstName':
        next.firstName = value;
        break;
      case 'lastName':
        next.lastName = value;
        break;
      case 'email':
        next.email = value;
        break;
      case 'companyName':
        next.company = value;
        break;
      case 'jobTitle':
        next.jobTitle = value;
        break;
      case 'phone':
        next.phone = value;
        break;
      case 'linkedinUrl':
        next.linkedinUrl = value;
        break;
    }
  }
  next.fullName =
    [next.firstName, next.lastName].filter(Boolean).join(' ') || next.fullName;
  return next;
}

export function ContactCardContent({
  contact,
  onContactUpdated,
}: ContactCardContentProps) {
  const [current, setCurrent] = useState<Contact>(contact);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => buildDraft(contact));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const enterEdit = () => {
    setDraft(buildDraft(current));
    setSaveError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(buildDraft(current));
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaveError(null);
    const changed = diffDraft(current, draft);
    if (Object.keys(changed).length === 0) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      await callTool('contact_update', {
        contactId: current.id,
        ...changed,
      });
      const updated = applyDraftToContact(current, draft);
      setCurrent(updated);
      onContactUpdated?.(updated);
      setIsEditing(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const setField = (key: EditableKey, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const hasTags = Array.isArray(current.tags) && current.tags.length > 0;

  if (isEditing) {
    return (
      <div className="space-y-6">
        <Card.Root>
          <div className="px-6 py-5 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-primary">
                Edit contact
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="rounded-md border border-secondary px-3 py-1.5 text-sm text-secondary hover:bg-secondary/40 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-md bg-brand-solid px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-solid_hover disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {EDITABLE_FIELDS.map((f) => (
                <label key={f.key} className="block min-w-0">
                  <span className="block text-xs text-tertiary mb-1">
                    {f.label}
                  </span>
                  <input
                    type={f.type}
                    value={draft[f.key] ?? ''}
                    placeholder={f.placeholder}
                    disabled={saving}
                    onChange={(e) => setField(f.key, e.target.value)}
                    className="w-full rounded-md border border-secondary bg-primary px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-utility-brand-300 disabled:opacity-50"
                  />
                </label>
              ))}
            </div>

            {saveError && (
              <p className="text-sm text-utility-error-700">{saveError}</p>
            )}
          </div>
        </Card.Root>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <ContactHeader contact={current} />
        <button
          type="button"
          onClick={enterEdit}
          title="Edit contact"
          aria-label="Edit contact"
          className="absolute top-4 right-4 inline-flex items-center justify-center rounded-md p-1.5 text-tertiary hover:bg-secondary hover:text-primary transition-colors"
        >
          <Edit03 className="size-4" />
        </button>
      </div>
      <ContactFields contact={current} />
      {hasTags && <ContactTags tags={current.tags ?? []} />}
    </div>
  );
}
