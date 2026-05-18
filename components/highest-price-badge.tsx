import { cn } from '@/lib/utils';

interface HighestPriceBadgeProps {
  className?: string;
}

export function HighestPriceBadge({ className }: HighestPriceBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-muted/80',
        'px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground',
        className
      )}
    >
      Highest
    </span>
  );
}
