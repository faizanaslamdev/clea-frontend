/** Product branding — https://clea.no */
/** Transparent PNGs in /public/logos — used for header, footer, and favicon. */
export const BRAND_LOGOS = {
  wordmark: {
    dark: '/logos/clea-wordmark-black.png',
    light: '/logos/clea-wordmark-white.png',
  },
  mark: {
    dark: '/logos/clea-mark-black.png',
    light: '/logos/clea-mark-white.png',
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
