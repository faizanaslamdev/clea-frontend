/** Product branding — https://clea.no */
/** Transparent WebP assets in /public/logos — used for header and footer. */
export const BRAND_LOGOS = {
  wordmark: {
    dark: '/logos/clea-wordmark-black-v2.webp',
    light: '/logos/clea-wordmark-white-v2.webp',
  },
  mark: {
    dark: '/logos/clea-mark-black-v2.webp',
    light: '/logos/clea-mark-white-v2.webp',
  },
} as const;

/** Browser tab, home-screen and bookmark icons (✦ sparkle on black). */
export const BRAND_ICONS = {
  ico: '/logos/favicon.ico',
  svg: '/logos/favicon.svg',
  png512: '/logos/icon-512.png',
  apple: '/logos/apple-touch-icon-180.png',
} as const;

export const BRAND = {
  name: 'Clea',
  wordmark: 'clea',
  domain: 'clea.no',
  siteUrl: 'https://www.clea.no',
  tagline: 'Mote og skjønnhet',
  heroTagline: [
    // Non-breaking spaces keep "1 000 000+" on one line.
    'Søk blant 1\u00a0000\u00a0000+ produkter',
    'med din AI-moteassistent',
  ] as const,
  title: 'Clea — Mote og skjønnhet',
  titleTemplate: '%s | Clea',
  description:
    'Sammenlign mote- og skjønnhetspriser på clea.no. Finn de beste tilbudene med smarte prissammenligninger og AI-søk.',
} as const;
