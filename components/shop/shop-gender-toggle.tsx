'use client';

import { cn } from '@/lib/utils';
import type { SuitableFor } from '@/lib/api/chat-types';

interface ShopGenderToggleProps {
  active: SuitableFor;
  onSelect: (value: SuitableFor) => void;
  className?: string;
}

const OPTIONS: ReadonlyArray<{ value: SuitableFor; label: string }> = [
  { value: 'female', label: 'Dame' },
  { value: 'male', label: 'Herre' },
];

/** Dame/Herre audience toggle for /shop -- same binary toggle as
 * daydream.ing's own Womens/Mens (no "all" option), reusing the pill
 * track already styled to match it (see .hero-category-toggle in
 * utilities.css) so it reads as one consistent toggle system across the
 * homepage hero and the shop page. */
export function ShopGenderToggle({ active, onSelect, className }: ShopGenderToggleProps) {
  return (
    <div className={cn('hero-category-toggle', className)} role="tablist" aria-label="Kjønn">
      {OPTIONS.map((option) => {
        const isActive = active === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(option.value)}
            className={cn(
              'hero-category-toggle__btn',
              isActive && 'hero-category-toggle__btn--active',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
