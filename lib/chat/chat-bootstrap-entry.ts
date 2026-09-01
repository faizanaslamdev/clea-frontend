import type { ShopCategory } from '@/lib/api/chat-types';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import { threadContainsUserQuery } from '@/lib/chat/chat-thread-persistence';
import type { SearchChatMessageData } from '@/lib/chat/chat-messages';

export const CHAT_BOOTSTRAP_PENDING_KEY = 'clea-chat-bootstrap-pending-v1';
export const CHAT_BOOTSTRAP_CLAIMED_KEY = 'clea-chat-bootstrap-claimed-v1';

/** @deprecated Legacy query-text dedupe — cleared on reset; no longer written. */
export const CHAT_URL_HYDRATED_STORAGE_KEY = 'clea-chat-url-hydrated-v1';

const MAX_PENDING_ENTRIES = 6;
const MAX_CLAIMED_ENTRIES = 8;
const PENDING_TTL_MS = 30 * 60 * 1000;
const CLAIM_TTL_MS = 30 * 60 * 1000;
const STALE_CLAIM_MS = 2 * 60 * 1000;

export interface BootstrapPendingEntry {
  version: 1;
  entryId: string;
  query: string;
  productId?: string;
  anchorPreview?: Omit<AnchorPreview, 'productId'>;
  /** Homepage gender tab at navigation time (Dame/Herre). */
  shopCategory?: ShopCategory;
  /** Legacy shareable URL `?category=` — kept for backward compatibility. */
  legacyShopCategory?: ShopCategory;
  clientTurnId: string;
  createdAt: number;
}

/** Resolve shop context from bootstrap entry; URL legacy category wins when present. */
export function resolveBootstrapShopCategory(
  entry: Pick<BootstrapPendingEntry, 'shopCategory' | 'legacyShopCategory'>,
  urlLegacyShopCategory?: ShopCategory,
): ShopCategory | undefined {
  return (
    urlLegacyShopCategory ?? entry.shopCategory ?? entry.legacyShopCategory
  );
}

interface BootstrapClaimedEntry {
  entryId: string;
  status: 'claimed' | 'completed';
  at: number;
}

interface BootstrapPendingStore {
  version: 1;
  entries: BootstrapPendingEntry[];
}

interface BootstrapClaimedStore {
  version: 1;
  entries: BootstrapClaimedEntry[];
}

function readStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota or private-mode failures.
  }
}

function now(): number {
  return Date.now();
}

function prunePendingEntries(entries: BootstrapPendingEntry[]): BootstrapPendingEntry[] {
  const cutoff = now() - PENDING_TTL_MS;
  return entries
    .filter((entry) => entry.createdAt >= cutoff)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_PENDING_ENTRIES);
}

function pruneClaimedEntries(entries: BootstrapClaimedEntry[]): BootstrapClaimedEntry[] {
  const cutoff = now() - CLAIM_TTL_MS;
  return entries
    .filter((entry) => entry.at >= cutoff)
    .sort((a, b) => b.at - a.at)
    .slice(0, MAX_CLAIMED_ENTRIES);
}

export function pruneBootstrapEntryState(): void {
  const pendingStore = readStorage<BootstrapPendingStore>(CHAT_BOOTSTRAP_PENDING_KEY);
  if (pendingStore?.version === 1 && Array.isArray(pendingStore.entries)) {
    writeStorage(CHAT_BOOTSTRAP_PENDING_KEY, {
      version: 1,
      entries: prunePendingEntries(pendingStore.entries),
    } satisfies BootstrapPendingStore);
  }

  const claimedStore = readStorage<BootstrapClaimedStore>(CHAT_BOOTSTRAP_CLAIMED_KEY);
  if (claimedStore?.version === 1 && Array.isArray(claimedStore.entries)) {
    writeStorage(CHAT_BOOTSTRAP_CLAIMED_KEY, {
      version: 1,
      entries: pruneClaimedEntries(claimedStore.entries),
    } satisfies BootstrapClaimedStore);
  }
}

function readPendingStore(): BootstrapPendingStore {
  const persisted = readStorage<BootstrapPendingStore>(CHAT_BOOTSTRAP_PENDING_KEY);
  if (!persisted || persisted.version !== 1 || !Array.isArray(persisted.entries)) {
    return { version: 1, entries: [] };
  }
  return { version: 1, entries: prunePendingEntries(persisted.entries) };
}

function writePendingStore(entries: BootstrapPendingEntry[]): void {
  writeStorage(CHAT_BOOTSTRAP_PENDING_KEY, {
    version: 1,
    entries: prunePendingEntries(entries),
  } satisfies BootstrapPendingStore);
}

function readClaimedStore(): BootstrapClaimedStore {
  const persisted = readStorage<BootstrapClaimedStore>(CHAT_BOOTSTRAP_CLAIMED_KEY);
  if (!persisted || persisted.version !== 1 || !Array.isArray(persisted.entries)) {
    return { version: 1, entries: [] };
  }
  return { version: 1, entries: pruneClaimedEntries(persisted.entries) };
}

function writeClaimedStore(entries: BootstrapClaimedEntry[]): void {
  writeStorage(CHAT_BOOTSTRAP_CLAIMED_KEY, {
    version: 1,
    entries: pruneClaimedEntries(entries),
  } satisfies BootstrapClaimedStore);
}

function findClaimedEntry(entryId: string): BootstrapClaimedEntry | undefined {
  return readClaimedStore().entries.find((entry) => entry.entryId === entryId);
}

function upsertClaimedEntry(
  entryId: string,
  status: BootstrapClaimedEntry['status'],
): void {
  const store = readClaimedStore();
  const without = store.entries.filter((entry) => entry.entryId !== entryId);
  writeClaimedStore([
    { entryId, status, at: now() },
    ...without,
  ]);
}

export function savePendingBootstrapEntry(
  entry: Omit<BootstrapPendingEntry, 'version' | 'createdAt'> & {
    createdAt?: number;
  },
): BootstrapPendingEntry {
  const payload: BootstrapPendingEntry = {
    version: 1,
    ...entry,
    query: entry.query.trim(),
    createdAt: entry.createdAt ?? now(),
  };

  const store = readPendingStore();
  const without = store.entries.filter((item) => item.entryId !== payload.entryId);
  writePendingStore([payload, ...without]);
  return payload;
}

export function getPendingBootstrapEntry(
  entryId: string,
): BootstrapPendingEntry | null {
  pruneBootstrapEntryState();
  const match = readPendingStore().entries.find((entry) => entry.entryId === entryId);
  return match ?? null;
}

export function removePendingBootstrapEntry(entryId: string): void {
  const store = readPendingStore();
  writePendingStore(store.entries.filter((entry) => entry.entryId !== entryId));
}

export function createLegacyBootstrapEntry(input: {
  query: string;
  legacyShopCategory?: ShopCategory;
  entryId?: string;
  clientTurnId?: string;
}): BootstrapPendingEntry {
  const entryId = input.entryId ?? crypto.randomUUID();
  const clientTurnId = input.clientTurnId ?? crypto.randomUUID();

  return savePendingBootstrapEntry({
    entryId,
    query: input.query.trim(),
    shopCategory: input.legacyShopCategory,
    legacyShopCategory: input.legacyShopCategory,
    clientTurnId,
  });
}

function isStaleClaim(claimed: BootstrapClaimedEntry): boolean {
  return claimed.status === 'claimed' && now() - claimed.at >= STALE_CLAIM_MS;
}

/**
 * Synchronously claim a pending bootstrap entry for hydration.
 * Returns null when the entry is missing, completed, or already claimed in-flight.
 */
export function tryClaimBootstrapEntry(
  entryId: string,
): BootstrapPendingEntry | null {
  pruneBootstrapEntryState();

  const pending = getPendingBootstrapEntry(entryId);
  if (!pending) {
    return null;
  }

  const claimed = findClaimedEntry(entryId);
  if (claimed?.status === 'completed') {
    return null;
  }

  if (claimed?.status === 'claimed' && !isStaleClaim(claimed)) {
    return null;
  }

  upsertClaimedEntry(entryId, 'claimed');
  return pending;
}

export function completeBootstrapEntry(entryId: string): void {
  upsertClaimedEntry(entryId, 'completed');
  removePendingBootstrapEntry(entryId);
}

export function releaseBootstrapEntryClaim(entryId: string): void {
  const store = readClaimedStore();
  writeClaimedStore(
    store.entries.filter(
      (entry) => entry.entryId !== entryId || entry.status === 'completed',
    ),
  );
}

export function anchorPreviewFromPendingEntry(
  entry: BootstrapPendingEntry,
): AnchorPreview | undefined {
  if (!entry.productId) {
    return undefined;
  }

  return {
    productId: entry.productId,
    name: entry.anchorPreview?.name ?? 'Produkt',
    image: entry.anchorPreview?.image ?? '',
    brand: entry.anchorPreview?.brand,
  };
}

export function shouldHydrateBootstrapEntry(input: {
  entryId?: string;
  query: string;
  messages: SearchChatMessageData[];
}): 'hydrate' | 'skip' | 'unavailable' {
  const trimmed = input.query.trim();
  if (!trimmed) {
    return 'skip';
  }

  if (threadContainsUserQuery(input.messages, trimmed)) {
    return 'skip';
  }

  if (!input.entryId) {
    return 'hydrate';
  }

  const claimed = findClaimedEntry(input.entryId);
  if (claimed?.status === 'completed') {
    return 'skip';
  }

  const pending = getPendingBootstrapEntry(input.entryId);
  if (!pending || pending.query.trim() !== trimmed) {
    return 'unavailable';
  }

  if (claimed?.status === 'claimed' && !isStaleClaim(claimed)) {
    return 'skip';
  }

  return 'hydrate';
}

export function clearBootstrapEntryState(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(CHAT_BOOTSTRAP_PENDING_KEY);
  window.sessionStorage.removeItem(CHAT_BOOTSTRAP_CLAIMED_KEY);
  window.sessionStorage.removeItem(CHAT_URL_HYDRATED_STORAGE_KEY);
}
