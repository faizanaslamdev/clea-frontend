'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  locationKey,
  readScrollPosition,
} from '@/lib/navigation/scroll-restoration';

const useBrowserLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const PENDING_RESTORE_KEY = 'clea:pending-scroll-restore';

/**
 * Forward navigations scroll to top. Browser Back/Forward (popstate) restores
 * a previously saved listing scroll position when available, so product → Back
 * returns to the same place in the brand/shop/chat grid.
 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
  const isPopRef = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      isPopRef.current = true;
      try {
        sessionStorage.setItem(PENDING_RESTORE_KEY, '1');
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useBrowserLayoutEffect(() => {
    let pending = isPopRef.current;
    if (!pending) {
      try {
        pending = sessionStorage.getItem(PENDING_RESTORE_KEY) === '1';
      } catch {
        pending = false;
      }
    }

    if (pending) {
      isPopRef.current = false;
      try {
        sessionStorage.removeItem(PENDING_RESTORE_KEY);
      } catch {
        /* ignore */
      }

      // Prefer the real browser location — useSearchParams can lag one frame
      // behind popstate, which would miss the saved key (e.g. ?m=…).
      const key = locationKey(
        window.location.pathname,
        window.location.search,
      );
      const saved = readScrollPosition(key);
      if (saved == null) return;

      const restore = () => {
        window.scrollTo({ top: saved, left: 0, behavior: 'auto' });
        document.documentElement.scrollTop = saved;
        document.body.scrollTop = saved;
      };
      restore();
      requestAnimationFrame(restore);
      window.setTimeout(restore, 50);
      window.setTimeout(restore, 120);
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search]);

  return null;
}
