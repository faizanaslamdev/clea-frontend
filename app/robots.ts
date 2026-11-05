import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/constants/brand';

/**
 * Search engines and AI search assistants may crawl the public pages.
 * Private, per-visitor and duplicate URLs are kept out of the index.
 * Backlink/SEO-tool crawlers are turned away: they generated most of the
 * product-page renders (≈21k a day from SemrushBot alone) and give the shop
 * nothing back.
 */
const PRIVATE_PATHS = [
  '/api/',
  '/account',
  '/chat/',
  '/sok',
  '/reset-password',
  '/unsubscribe',
];

const SEO_TOOL_CRAWLERS = [
  'SemrushBot',
  'AhrefsBot',
  'MJ12bot',
  'DotBot',
  'BLEXBot',
  'DataForSeoBot',
  'PetalBot',
  'serpstatbot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
      { userAgent: SEO_TOOL_CRAWLERS, disallow: '/' },
    ],
    sitemap: [`${BRAND.siteUrl}/sitemap-index.xml`, `${BRAND.siteUrl}/sitemap.xml`],
    host: BRAND.siteUrl,
  };
}
