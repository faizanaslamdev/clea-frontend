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
      <span className={cn('badge-deal-mini', className)}>
        <ArrowDown className="h-2.5 w-2.5 shrink-0" strokeWidth={2.5} aria-hidden />
        Best deal
      </span>
    );
  }

  if (variant === 'label') {
    return (
      <span className={cn('badge-deal-soft mb-1.5 gap-1 px-2', className)}>
        <ArrowDown className="h-2.5 w-2.5 shrink-0" strokeWidth={2.5} aria-hidden />
        Lowest price
      </span>
    );
  }

  return (
    <span className={cn('badge-deal-soft', className)}>
      <ArrowDown className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
      Best deal
    </span>
  );
}
