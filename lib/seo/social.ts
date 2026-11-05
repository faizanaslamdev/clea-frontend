import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants/brand';

export const DEFAULT_SOCIAL_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: BRAND.title,
} as const;

/**
 * Open Graph + Twitter tags for a page. Pages that build their own metadata
 * set these explicitly, so the share preview never falls back to no image.
 */
export function socialMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Pick<Metadata, 'openGraph' | 'twitter'> {
  return {
    openGraph: {
      type: 'website',
      siteName: BRAND.name,
      locale: 'nb_NO',
      title: input.title,
      description: input.description,
      url: input.path,
      images: [DEFAULT_SOCIAL_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [DEFAULT_SOCIAL_IMAGE.url],
    },
  };
}
