'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';

const useBrowserLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Next App Router can preserve scroll across soft navigations (especially with
 * shared layouts / loading UI). Reset to the top on every pathname change.
 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useBrowserLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}
