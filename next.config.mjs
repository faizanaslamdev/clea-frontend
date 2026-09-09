import { withSentryConfig } from '@sentry/nextjs';
import { validateProductionApiUrl } from './lib/api/api-base-url.mjs';
import { IMAGE_HOSTS } from './lib/image-hosts.mjs';

if (process.env.NODE_ENV === 'production') {
  validateProductionApiUrl(process.env.NEXT_PUBLIC_API_URL);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Real product images come from merchant/CDN hosts (lib/image-hosts.mjs,
    // compiled from a live catalog query, not the stale feed.csv snapshot
    // that caused the earlier incident -- see that file's header comment).
    //
    // NOTE: a custom `images.loader` was tried here first (routing known
    // hosts through /_next/image, falling back to the raw URL otherwise),
    // but Next's own server explicitly disables the /_next/image endpoint
    // whenever loader !== 'default' (next-server.js: `if (imagesConfig.loader
    // !== 'default' || imagesConfig.unoptimized) { render404 }`) -- a
    // custom loader is meant to point at an *external* resizing service
    // (Cloudinary/Imgix/etc), not back at Next's own optimizer, so every
    // image 404'd. We don't have an external image CDN, so we use the
    // default loader with remotePatterns instead, which is what actually
    // talks to Next's built-in optimizer.
    //
    // Residual risk this leaves: a brand-new merchant host not yet added
    // to IMAGE_HOSTS will fail to optimize -- in dev that throws a visible
    // error for whoever's looking at that page (loud, easy to notice and
    // fix by adding the host below); in production the safety check that
    // throws is skipped entirely (see the `NODE_ENV !== 'production'` guard
    // in next/dist/shared/lib/image-loader.js) and /_next/image just 400s
    // for that one image, i.e. a single broken photo, not a page crash.
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({
      protocol: 'https',
      hostname,
    })),
  },
  async redirects() {
    return [
      { source: '/cart', destination: '/brands', permanent: false },
      { source: '/trending', destination: '/brands', permanent: false },
      { source: '/products', destination: '/brands', permanent: false },
      {
        source: '/product/:id',
        destination: '/brands',
        permanent: false,
      },
      {
        source: '/brands/:slug/products/:productId',
        destination: '/brands/:slug',
        permanent: false,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: false,
});
