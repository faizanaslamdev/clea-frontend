/**
 * After a deploy, a tab that was open before it can ask for page code
 * ('chunks') that no longer exists. That surfaces as a ChunkLoadError while
 * rendering, and without handling it shows the site-wide error screen.
 * Reloading once loads the current version and fixes it.
 */

const RELOAD_KEY = 'clea:chunk-reload-at';
/** Don't reload again within this window (avoids a reload loop). */
const RELOAD_GUARD_MS = 60_000;

export function isChunkLoadError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const { name, message } = error as { name?: unknown; message?: unknown };
  const text = `${typeof name === 'string' ? name : ''} ${
    typeof message === 'string' ? message : ''
  }`;
  return /ChunkLoadError|Loading chunk [\w-]+ failed|Loading CSS chunk|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(
    text,
  );
}

/**
 * Reloads the page once when `error` is a chunk load error. Returns true when
 * a reload was started (the caller should render nothing further).
 */
export function recoverFromChunkLoadError(
  error: unknown,
  deps: {
    storage?: Pick<Storage, 'getItem' | 'setItem'> | null;
    reload?: () => void;
    now?: () => number;
  } = {},
): boolean {
  if (!isChunkLoadError(error)) return false;
  const now = (deps.now ?? Date.now)();
  let storage = deps.storage;
  if (storage === undefined) {
    try {
      storage = typeof window === 'undefined' ? null : window.sessionStorage;
    } catch {
      storage = null;
    }
  }
  try {
    const last = Number(storage?.getItem(RELOAD_KEY) ?? 0);
    if (last && now - last < RELOAD_GUARD_MS) return false;
    storage?.setItem(RELOAD_KEY, String(now));
  } catch {
    // Storage unavailable: still reload once (this page load).
  }
  const reload =
    deps.reload ??
    (() => {
      if (typeof window !== 'undefined') window.location.reload();
    });
  reload();
  return true;
}
