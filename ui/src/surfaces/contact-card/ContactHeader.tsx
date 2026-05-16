import { Card } from '@/components/application/cards/card';
import {
  Copy01,
  LinkExternal01,
  Mail01,
  PhoneCall01,
} from '@untitledui/icons';
import { useState } from 'react';
import { Avatar } from '../../lib/Avatar';
import type { Contact } from './types';

interface ContactHeaderProps {
  contact: Contact;
}

interface CopyButtonProps {
  value: string;
  label: string;
}

function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      title={copied ? 'Copied' : `Copy ${label}`}
      aria-label={`Copy ${label}`}
      className="inline-flex items-center justify-center rounded-md p-1 text-tertiary hover:bg-secondary hover:text-primary transition-colors"
    >
      <Copy01 className="size-3.5" />
    </button>
  );
}

function sourcePillClass(source?: string): string {
  const s = (source ?? '').toLowerCase();
  if (s === 'manual') return 'bg-utility-blue-50 text-utility-blue-700';
  if (s === 'api') return 'bg-utility-gray-50 text-utility-gray-700';
  if (s === 'import' || s === 'csv')
    return 'bg-utility-success-50 text-utility-success-700';
  return 'bg-utility-gray-50 text-utility-gray-700';
}

export function ContactHeader({ contact }: ContactHeaderProps) {
  const displayName =
    contact.fullName ||
    [contact.firstName, contact.lastName].filter(Boolean).join(' ') ||
    contact.email ||
    'Unnamed contact';

  const subtitle = [contact.jobTitle, contact.company]
    .filter(Boolean)
    .join(contact.jobTitle && contact.company ? ' @ ' : '');

  return (
    <Card.Root>
      <div className="px-6 py-5 flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar
          src={contact.profileImage}
          name={displayName}
          size="lg"
          className="size-16 text-base shrink-0"
        />

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-semibold text-primary truncate">
                {displayName}
              </h2>
              {contact.linkedinUrl && (
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="inline-flex items-center justify-center rounded p-1 text-utility-brand-600 hover:bg-utility-brand-50"
                >
                  <LinkExternal01 className="size-4" />
                </a>
              )}
              {contact.source && (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sourcePillClass(
                    contact.source
                  )}`}
                >
                  {contact.source}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-sm text-secondary truncate">{subtitle}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {contact.email && (
              <div className="flex items-center gap-2 text-secondary">
                <Mail01 className="size-4 text-tertiary" />
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-primary truncate"
                >
                  {contact.email}
                </a>
                <CopyButton value={contact.email} label="email" />
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2 text-secondary">
                <PhoneCall01 className="size-4 text-tertiary" />
                <a
                  href={`tel:${contact.phone}`}
                  className="hover:text-primary"
                >
                  {contact.phone}
                </a>
                <CopyButton value={contact.phone} label="phone" />
              </div>
            )}
            {contact.linkedinUrl && (
              <a
                href={contact.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-secondary hover:text-primary"
              >
                <LinkExternal01 className="size-4 text-tertiary" />
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </Card.Root>
  );
}
