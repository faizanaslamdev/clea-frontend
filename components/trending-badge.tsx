import { cn } from '@/lib/utils';

interface TrendingBadgeProps {
  className?: string;
  /** overlay = on product images, inline = next to title on detail page */
  variant?: 'overlay' | 'inline';
}

export function TrendingBadge({ className, variant = 'overlay' }: TrendingBadgeProps) {
  if (variant === 'inline') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-md border border-foreground/12 bg-muted/50 px-2.5 py-1',
          className
        )}
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/80">
          Trending
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1',
        'bg-neutral-950/80 shadow-sm backdrop-blur-sm',
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-400" />
      </span>
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white">
        Trending
      </span>
    </span>
  );
}
