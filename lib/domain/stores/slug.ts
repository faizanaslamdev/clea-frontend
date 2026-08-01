import type { Store } from '@/lib/types';

export function slugifyBrandName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getBrandSlug(store: Store): string {
  return store.slug ?? slugifyBrandName(store.name);
}

export function getBrandHref(store: Store): string {
  const slug = getBrandSlug(store);
  // Include merchant id so brand-page SSR can skip the expensive merchants list.
  return `/brands/${slug}?m=${encodeURIComponent(store.id)}`;
}
