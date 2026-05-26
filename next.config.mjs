/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
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

export default nextConfig;
