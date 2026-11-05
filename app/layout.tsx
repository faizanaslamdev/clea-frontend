import type { Metadata, Viewport } from 'next';
import { Roboto_Mono, Playfair_Display, DM_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { BRAND, BRAND_ICONS } from '@/lib/constants/brand';
import './globals.css';
import { preconnect } from 'react-dom';
import { getApiBaseUrl } from '@/lib/api/backend-client';
import { Providers } from './providers';
import { JsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo/json-ld';

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: {
    default: BRAND.title,
    template: BRAND.titleTemplate,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  openGraph: {
    type: 'website',
    siteName: BRAND.name,
    locale: 'nb_NO',
    title: BRAND.title,
    description: BRAND.description,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: BRAND.title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND.title,
    description: BRAND.description,
    images: ['/og-image.png'],
  },
  // Google Search Console HTML-tag verification (set in Vercel when needed).
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  icons: {
    icon: [
      { url: BRAND_ICONS.ico, sizes: '48x48' },
      { url: BRAND_ICONS.svg, type: 'image/svg+xml' },
      { url: BRAND_ICONS.png512, type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: BRAND_ICONS.apple, sizes: '180x180', type: 'image/png' }],
    shortcut: BRAND_ICONS.ico,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The first client API call shouldn't pay DNS + TLS setup. API requests send
  // credentials, so the warm connection must be the credentialed one.
  preconnect(getApiBaseUrl(), { crossOrigin: 'use-credentials' });

  return (
    <html
      lang="nb"
      className={`${dmSans.variable} ${playfair.variable} ${robotoMono.variable} bg-background`}
      suppressHydrationWarning
    >
      <body
        className="font-sans antialiased bg-background text-foreground"
        suppressHydrationWarning
      >
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
