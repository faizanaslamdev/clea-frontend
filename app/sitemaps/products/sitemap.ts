import type { MetadataRoute } from 'next';
import { apiFetch } from '@/lib/api/backend-client';
import { BRAND } from '@/lib/constants/brand';

/**
 * Product pages for search engines, in 32 files of ~27k products each
 * (/sitemaps/products/sitemap/0.xml … 31.xml). Rendered on request and cached
 * for a day, so builds never wait on the API and crawlers rarely reach it.
 */
export const dynamic = 'force-dynamic';

export const PRODUCT_SITEMAP_PARTS = 32;
const DAY_SECONDS = 86400;

interface SitemapProductsResponse {
  products: Array<{ id: string; lastModified: string | null }>;
}

export async function generateSitemaps() {
  return Array.from({ length: PRODUCT_SITEMAP_PARTS }, (_, id) => ({ id }));
}

export default async function sitemap(props: {
  id: Promise<string> | string | number;
}): Promise<MetadataRoute.Sitemap> {
  const part = Number(await props.id);
  const data = await apiFetch<SitemapProductsResponse>(
    `/seo/sitemap/products?part=${part}`,
    { next: { revalidate: DAY_SECONDS }, timeoutMs: 30000 },
  );
  return data.products.map((product) => ({
    url: `${BRAND.siteUrl}/product/${product.id}`,
    lastModified: product.lastModified ?? undefined,
    changeFrequency: 'daily',
    priority: 0.6,
  }));
}
