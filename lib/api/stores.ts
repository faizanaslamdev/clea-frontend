import { ApiError, apiFetch } from '@/lib/api/backend-client';
import { mapApiMerchantToStore } from '@/lib/api/mappers';
import type { ApiMerchant } from '@/lib/api/types';
import { FEATURED_MERCHANT_LIMIT } from '@/lib/constants/featured';
import type { Store } from '@/lib/types';

function merchantsUrl(limit: number): string {
  return `/merchants?limit=${limit}&segment=fashion`;
}

export async function fetchAllStoresFromApi(): Promise<Store[]> {
  const merchants = await apiFetch<ApiMerchant[]>(merchantsUrl(100), {
    next: { revalidate: 300 },
  });
  return merchants.map(mapApiMerchantToStore);
}

export async function fetchFeaturedStores(): Promise<Store[]> {
  const merchants = await apiFetch<ApiMerchant[]>(
    merchantsUrl(FEATURED_MERCHANT_LIMIT),
    { next: { revalidate: 300 } },
  );
  return merchants.map(mapApiMerchantToStore);
}

/** Fast single-merchant lookup used by brand detail SSR. */
export async function fetchStoreByIdOrSlug(
  idOrSlug: string,
): Promise<Store | undefined> {
  const key = idOrSlug.trim();
  if (!key) return undefined;

  try {
    const merchant = await apiFetch<ApiMerchant>(
      `/merchants/${encodeURIComponent(key)}`,
      { next: { revalidate: 300 } },
    );
    return mapApiMerchantToStore(merchant);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

export async function fetchAllStores(): Promise<Store[]> {
  return fetchAllStoresFromApi();
}
