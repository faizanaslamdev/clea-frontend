import { BRAND } from '@/lib/constants/brand';
import { PRODUCT_SITEMAP_PARTS } from '@/app/sitemaps/products/sitemap';

/** One entry point for search consoles: the page sitemap plus every product sitemap. */
export const dynamic = 'force-static';

export function GET() {
  const files = [
    `${BRAND.siteUrl}/sitemap.xml`,
    ...Array.from(
      { length: PRODUCT_SITEMAP_PARTS },
      (_, part) => `${BRAND.siteUrl}/sitemaps/products/sitemap/${part}.xml`,
    ),
  ];
  const now = new Date().toISOString();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${files.map((loc) => `  <sitemap><loc>${loc}</loc><lastmod>${now}</lastmod></sitemap>`).join('\n')}
</sitemapindex>
`;
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
