import { Card } from '@/components/application/cards/card';
import type { ContactTag } from './types';

interface ContactTagsProps {
  tags: ContactTag[];
}

function isLight(hex: string): boolean {
  const m = hex.replace('#', '');
  if (m.length !== 3 && m.length !== 6) return false;
  const full =
    m.length === 3
      ? m
          .split('')
          .map((c) => c + c)
          .join('')
      : m;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return false;
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
}

export function ContactTags({ tags }: ContactTagsProps) {
  return (
    <Card.Root>
      <div className="px-6 py-5">
        <h3 className="text-md font-semibold text-primary">Tags</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag, i) => {
            const customStyle = tag.color
              ? {
                  backgroundColor: tag.color,
                  color: isLight(tag.color) ? '#1d2939' : '#ffffff',
                }
              : undefined;
            return (
              <span
                key={`${tag.name}-${i}`}
                className={
                  customStyle
                    ? 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
                    : 'inline-flex items-center rounded-full bg-utility-gray-50 text-utility-gray-700 px-2.5 py-0.5 text-xs font-medium'
                }
                style={customStyle}
              >
                {tag.name}
              </span>
            );
          })}
        </div>
      </div>
    </Card.Root>
  );
}
