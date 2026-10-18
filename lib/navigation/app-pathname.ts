'use client';

import { usePathname } from 'next/navigation';

/**
 * Map the internal path an ISR route was (re)generated under back to its
 * public URL path.
 *
 * On Vercel, background revalidation of the root ISR page (`/`,
 * `revalidate` in app/page.tsx) renders it as `/index` (its output file name):
 * the cached HTML's RSC payload carries `"c":["","index"]` and
 * `usePathname()` returns `/index` during that server render, while the
 * browser hydrates at `/`. Any pathname-driven markup (header active link,
 * sticky search, spacer) then differs and React throws hydration error #418
 * and client-renders the whole root.
 */
export function normalizeAppPathname(pathname: string): string {
  // Only the root route is emitted as `index`; nested `/x/index` can be a
  // real dynamic segment (e.g. a brand slug), so leave those alone.
  return pathname === '/index' ? '/' : pathname;
}

/** `usePathname()` that is stable between ISR server renders and the client. */
export function useAppPathname(): string {
  return normalizeAppPathname(usePathname() ?? '/');
}
