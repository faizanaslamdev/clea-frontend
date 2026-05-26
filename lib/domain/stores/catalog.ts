import { FEATURED_STORE_IDS } from '@/lib/constants/featured';
import { stores } from '@/lib/data/dummy-data';
import type { Store } from '@/lib/types';
import { getBrandSlug } from '@/lib/domain/stores/slug';

export function getStoreById(id: string): Store | undefined {
  return stores.find((s) => s.id === id);
}

export function getStoreBySlug(slug: string): Store | undefined {
  return stores.find((s) => getBrandSlug(s) === slug);
}

/** Resolve brand from URL segment (slug or legacy internal id). */
export function resolveStoreFromRouteParam(param: string): Store | undefined {
  return getStoreBySlug(param) ?? getStoreById(param);
}

export function getAllStores(): Store[] {
  return stores;
}

export function getFeaturedStores(): Store[] {
  return FEATURED_STORE_IDS.map((id) => getStoreById(id)).filter(
    (s): s is Store => s != null
  );
}
