import { cache } from 'react';
import {
  fetchAllStoresFromApi,
  fetchFeaturedStores,
  fetchStoreByIdOrSlug,
} from '@/lib/api/stores';
import type { Store } from '@/lib/types';
import { getBrandSlug } from '@/lib/domain/stores/slug';

const loadStores = cache(async (): Promise<Store[]> => {
  return fetchAllStoresFromApi();
});

const loadStoreByIdOrSlug = cache(
  async (idOrSlug: string): Promise<Store | undefined> => {
    return fetchStoreByIdOrSlug(idOrSlug);
  },
);

export async function getStoreById(id: string): Promise<Store | undefined> {
  return loadStoreByIdOrSlug(id);
}

export async function getStoreBySlug(slug: string): Promise<Store | undefined> {
  return loadStoreByIdOrSlug(slug);
}

export async function resolveStoreFromRouteParam(
  param: string,
  merchantId?: string | null,
): Promise<Store | undefined> {
  const idHint = merchantId?.trim();
  if (idHint) {
    const byId = await loadStoreByIdOrSlug(idHint);
    if (byId) return byId;
  }

  const byParam = await loadStoreByIdOrSlug(param);
  if (byParam) return byParam;

  // Legacy fallback if single-merchant endpoint is unavailable.
  const stores = await loadStores();
  return (
    stores.find((s) => getBrandSlug(s) === param) ??
    stores.find((s) => s.id === param)
  );
}

export async function getAllStores(): Promise<Store[]> {
  return loadStores();
}

export async function getFeaturedStores(): Promise<Store[]> {
  return fetchFeaturedStores();
}
