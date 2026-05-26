/** Product branding — https://clea.no */
export const BRAND = {
  name: 'Clea',
  /** Lowercase mark for header, footer, and UI chrome */
  wordmark: 'clea',
  domain: 'clea.no',
  siteUrl: 'https://clea.no',
  /** Short label (metadata, etc.) */
  tagline: 'Fashion & beauty',
  /** Home hero headline (two lines) */
  heroTagline: [
    'Shop the best Nordic stores with',
    'AI-powered personalized discovery.',
  ] as const,
  title: 'Clea — Fashion & Beauty',
  titleTemplate: '%s | Clea',
  description:
    'Compare fashion and beauty prices on clea.no. Find the best deals with real-time price tracking and smart insights.',
} as const;
