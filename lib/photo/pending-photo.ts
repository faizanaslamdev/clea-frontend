import type { ShopCategory } from '@/lib/api/chat-types';

/**
 * A photo picked outside the chat (homepage hero) waits here while the app
 * navigates to /chat, which then sends it. In memory only: photos are never
 * written to storage, and a reload simply drops it.
 */
export interface PendingPhoto {
  dataUrl: string;
  shopCategory?: ShopCategory;
}

let pending: PendingPhoto | null = null;

export function setPendingPhoto(photo: PendingPhoto): void {
  pending = photo;
}

/** Returns the waiting photo once, then forgets it. */
export function takePendingPhoto(): PendingPhoto | null {
  const photo = pending;
  pending = null;
  return photo;
}
