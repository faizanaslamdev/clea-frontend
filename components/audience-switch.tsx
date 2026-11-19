'use client';

import { useRouter } from 'next/navigation';
import { setAudience, useAudience } from '@/lib/audience/audience';
import type { ShopCategory } from '@/lib/api/chat-types';
import { useAppPathname } from '@/lib/navigation/app-pathname';
import { cn } from '@/lib/utils';

/**
 * Dame/Herre in the header: the remembered choice, changeable from any
 * page. On a shop page the URL's gender follows at once, so the listing
 * switches without a detour via the homepage.
 */
export function AudienceSwitch({
  overHero,
  className,
  hidden = false,
}: {
  overHero?: boolean;
  className?: string;
  /** Kept in the DOM (no layout jump) but faded out and inert. */
  hidden?: boolean;
}) {
  const audience = useAudience();
  const router = useRouter();
  const pathname = useAppPathname();

  const choose = (next: ShopCategory) => {
    setAudience(next);
    if (pathname.startsWith('/shop')) {
      const params = new URLSearchParams(window.location.search);
      params.set('gender', next === 'mens' ? 'herre' : 'dame');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <div
      className={cn('audience-switch', overHero && 'audience-switch--over-hero', className)}
      role="group"
      aria-label="Handler for"
      aria-hidden={hidden}
      inert={hidden}
    >
      {(['womens', 'mens'] as const).map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={audience === value}
          onClick={() => choose(value)}
          className={cn('audience-switch__btn', audience === value && 'audience-switch__btn--active')}
        >
          {value === 'womens' ? 'Dame' : 'Herre'}
        </button>
      ))}
    </div>
  );
}
