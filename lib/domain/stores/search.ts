import { getBrandSlug } from '@/lib/domain/stores/slug';
import type { Store } from '@/lib/types';

export function searchStores(query: string, stores: Store[]): Store[] {
  const lowerQuery = query.trim().toLowerCase();
  if (!lowerQuery) return stores;

  return stores.filter((store) => {
    const slug = getBrandSlug(store);
    return (
      store.name.toLowerCase().includes(lowerQuery) ||
      store.country.toLowerCase().includes(lowerQuery) ||
      slug.includes(lowerQuery)
    );
  });
}
