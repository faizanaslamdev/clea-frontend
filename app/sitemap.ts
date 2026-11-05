import type { MetadataRoute } from 'next';
import { fetchAllStoresFromApi } from '@/lib/api/stores';
import { BRAND } from '@/lib/constants/brand';
import { SHOP_CATEGORIES } from '@/lib/constants/shop-categories';
import { getBrandSlug } from '@/lib/domain/stores/slug';
import { getProductBrands } from '@/lib/domain/brands/product-brands';
import { GUIDES } from '@/lib/seo/guides';

/** Rebuilt once a day; stores and categories change rarely. */
export const revalidate = 86400;

const STATIC_PAGES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
}> = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/shop', priority: 0.9, changeFrequency: 'daily' },
  { path: '/brands', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/merker', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/guide', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/chat', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/partner', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const url = (path: string) => `${BRAND.siteUrl}${path === '/' ? '' : path}`;

  const pages: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: url(page.path),
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const categories: MetadataRoute.Sitemap = SHOP_CATEGORIES.map((category) => ({
    url: url(`/shop/${category.slug}`),
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // A failing API must not take the sitemap down; the fixed pages still list.
  const stores = await fetchAllStoresFromApi().catch(() => []);
  const brands: MetadataRoute.Sitemap = stores
    .filter((store) => (store.productCount ?? 1) > 0)
    .map((store) => ({
      url: url(`/brands/${getBrandSlug(store)}`),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    }));

  const productBrands = await getProductBrands().catch(() => []);
  const brandPages: MetadataRoute.Sitemap = productBrands.map((brand) => ({
    url: url(`/merker/${brand.slug}`),
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const guides: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: url(`/guide/${guide.slug}`),
    lastModified: new Date(guide.updated),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...pages, ...categories, ...brands, ...brandPages, ...guides];
}
