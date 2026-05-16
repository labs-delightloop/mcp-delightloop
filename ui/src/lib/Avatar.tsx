import { Avatar as UAvatar } from '@/components/base/avatar/avatar';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 'xs', md: 'sm', lg: 'lg' } as const;

function getInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  return (
    <UAvatar
      size={sizeMap[size]}
      src={src ?? undefined}
      alt={name ?? undefined}
      initials={getInitials(name)}
      className={className}
    />
  );
}
