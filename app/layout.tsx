import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Roboto_Mono, Playfair_Display, DM_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { FloatingShoppingAssistant } from '@/components/floating-shopping-assistant';
import { Providers } from "./providers";

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
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
  title: {
    default: 'Nordic Price — Smart Shopping Assistant',
    template: '%s | Nordic Price',
  },
  description:
    'Compare fashion and beauty prices across Nordic stores. Find the best deals with real-time price tracking and Price AI.',
  applicationName: 'Nordic Price',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-icon', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#171717' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable} ${robotoMono.variable} bg-background`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
          <FloatingShoppingAssistant />
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
