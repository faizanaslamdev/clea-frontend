import { apiFetch } from '@/lib/api/backend-client';
import { mapApiMerchantToStore } from '@/lib/api/mappers';
import type { ApiMerchant } from '@/lib/api/types';
import type { Store } from '@/lib/types';

const FEATURED_MERCHANT_LIMIT = 9;

function merchantsUrl(limit: number): string {
  return `/merchants?limit=${limit}&segment=fashion`;
}

export async function fetchAllStoresFromApi(): Promise<Store[]> {
  const merchants = await apiFetch<ApiMerchant[]>(merchantsUrl(100), {
    cache: 'no-store',
  });
  return merchants.map(mapApiMerchantToStore);
}

export async function fetchFeaturedStores(): Promise<Store[]> {
  const merchants = await apiFetch<ApiMerchant[]>(
    merchantsUrl(FEATURED_MERCHANT_LIMIT),
    { cache: 'no-store' },
  );
  return merchants.map(mapApiMerchantToStore);
}

export async function fetchAllStores(): Promise<Store[]> {
  return fetchAllStoresFromApi();
}
