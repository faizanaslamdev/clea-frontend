import { withSentryConfig } from '@sentry/nextjs';
import { validateProductionApiUrl } from './lib/api/api-base-url.mjs';

if (process.env.NODE_ENV === 'production') {
  validateProductionApiUrl(process.env.NEXT_PUBLIC_API_URL);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.occtoo-media.com' },
      { protocol: 'https', hostname: 'images2.productserve.com' },
    ],
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
