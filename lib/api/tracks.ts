import { apiFetch } from './backend-client';

export interface TrackProductSummary {
  id: string | null;
  identityKey: string;
  name: string | null;
  brand: string | null;
  imageUrl: string | null;
  merchantName: string | null;
  merchantId: string | null;
  deepLink: string | null;
  currentPrice: number | null;
  currency: string;
}

export interface TrackRecord {
  id: string;
  productId: string | null;
  identityKey: string;
  merchantId: string | null;
  currency: string;
  priceAtTrack: number;
  lastNotifiedPrice: number | null;
  lastNotifiedAt: string | null;
  status: 'active' | 'paused' | 'stopped';
  createdAt: string;
  stoppedAt: string | null;
  alreadyTracking?: boolean;
  product: TrackProductSummary | null;
}

export async function createTrack(productId: string): Promise<TrackRecord> {
  return apiFetch<TrackRecord>('/tracks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  });
}

export async function listTracks(): Promise<TrackRecord[]> {
  return apiFetch<TrackRecord[]>('/tracks');
}

export async function getTrackByProduct(
  productId: string,
): Promise<{ tracking: boolean; track: TrackRecord | null }> {
  return apiFetch(`/tracks/by-product/${productId}`);
}

export async function stopTrack(trackId: string): Promise<TrackRecord> {
  return apiFetch<TrackRecord>(`/tracks/${trackId}`, {
    method: 'DELETE',
  });
}
