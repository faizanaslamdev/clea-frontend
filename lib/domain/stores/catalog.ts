import { cache } from 'react';
import { fetchAllStoresFromApi, fetchFeaturedStores } from '@/lib/api/stores';
import type { Store } from '@/lib/types';
import { getBrandSlug } from '@/lib/domain/stores/slug';

const loadStores = cache(async (): Promise<Store[]> => {
  return fetchAllStoresFromApi();
});

export async function getStoreById(id: string): Promise<Store | undefined> {
  const stores = await loadStores();
  return stores.find((s) => s.id === id);
}

export async function getStoreBySlug(slug: string): Promise<Store | undefined> {
  const stores = await loadStores();
  return stores.find((s) => getBrandSlug(s) === slug);
}

export async function resolveStoreFromRouteParam(
  param: string,
): Promise<Store | undefined> {
  return (await getStoreBySlug(param)) ?? (await getStoreById(param));
}

export async function getAllStores(): Promise<Store[]> {
  return loadStores();
}

export async function getFeaturedStores(): Promise<Store[]> {
  return fetchFeaturedStores();
}
