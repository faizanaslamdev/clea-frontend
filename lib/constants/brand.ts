/** Product branding — https://clea.no */
/** Transparent WebP assets in /public/logos — used for header and footer. */
export const BRAND_LOGOS = {
  wordmark: {
    dark: '/logos/clea-wordmark-black.webp',
    light: '/logos/clea-wordmark-white.webp',
  },
  mark: {
    dark: '/logos/clea-mark-black.webp',
    light: '/logos/clea-mark-white.webp',
  },
} as const;

export const BRAND = {
  name: 'Clea',
  wordmark: 'clea',
  domain: 'clea.no',
  siteUrl: 'https://www.clea.no',
  tagline: 'Mote og skjønnhet',
  heroTagline: [
    'Få den beste prisen på favorittmerkene dine med',
    'AI-drevet oppdagelse.',
  ] as const,
  title: 'Clea — Mote og skjønnhet',
  titleTemplate: '%s | Clea',
  description:
    'Sammenlign mote- og skjønnhetspriser på clea.no. Finn de beste tilbudene med smarte prissammenligninger og AI-søk.',
} as const;
