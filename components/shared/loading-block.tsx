import { cn } from '@/lib/utils';

interface LoadingBlockProps {
  className?: string;
}

/** Standard skeleton placeholder — matches existing pulse patterns. */
export function LoadingBlock({ className }: LoadingBlockProps) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-muted', className)}
      role="status"
      aria-label="Loading"
    />
  );
}
