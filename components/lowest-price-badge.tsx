import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LowestPriceBadgeProps {
  className?: string;
  /** pill = next to store info, mini = compact above price, label = product stat card */
  variant?: 'pill' | 'mini' | 'label';
}

export function LowestPriceBadge({
  className,
  variant = 'pill',
}: LowestPriceBadgeProps) {
  if (variant === 'mini') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded-full bg-emerald-600 px-2 py-0.5',
          'text-[10px] font-semibold leading-none text-white shadow-sm shadow-emerald-600/25',
          className
        )}
      >
        <ArrowDown className="h-2.5 w-2.5 shrink-0" strokeWidth={2.5} aria-hidden />
        Best deal
      </span>
    );
  }

  if (variant === 'label') {
    return (
      <span
        className={cn(
          'mb-1.5 inline-flex items-center gap-1 rounded-full border border-emerald-500/20',
          'bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700',
          'dark:border-emerald-500/25 dark:bg-emerald-950/40 dark:text-emerald-400',
          className
        )}
      >
        <ArrowDown className="h-2.5 w-2.5 shrink-0" strokeWidth={2.5} aria-hidden />
        Lowest price
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-emerald-500/20',
        'bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700',
        'dark:border-emerald-500/25 dark:bg-emerald-950/40 dark:text-emerald-400',
        className
      )}
    >
      <ArrowDown className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
      Best deal
    </span>
  );
}
