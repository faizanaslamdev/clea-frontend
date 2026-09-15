const SCROLL_KEY_PREFIX = 'clea:scroll:';

export function locationKey(pathname: string, search = ''): string {
  return `${pathname}${search}`;
}

export function currentLocationKey(): string {
  if (typeof window === 'undefined') return '';
  return locationKey(window.location.pathname, window.location.search);
}

export function saveScrollPosition(key: string, y: number): void {
  if (!key || typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`${SCROLL_KEY_PREFIX}${key}`, String(Math.max(0, y)));
  } catch {
    /* private mode / quota — ignore */
  }
}

export function readScrollPosition(key: string): number | null {
  if (!key || typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(`${SCROLL_KEY_PREFIX}${key}`);
    if (raw == null) return null;
    const y = Number(raw);
    return Number.isFinite(y) ? y : null;
  } catch {
    return null;
  }
}

/** Persist the current window scroll for the page we are about to leave. */
export function saveCurrentScrollPosition(): void {
  saveScrollPosition(currentLocationKey(), window.scrollY);
}
