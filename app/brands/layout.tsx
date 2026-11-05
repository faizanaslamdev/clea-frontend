import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Butikker og merker – alle partnerbutikker',
  description:
    'Se alle nettbutikkene på Clea, som Outnorth, Nelly, H&M, ASOS, Bubbleroom og KICKS. Utforsk produktene og sammenlign priser på ett sted.',
  alternates: { canonical: '/brands' },
};

export default function BrandsLayout({ children }: { children: ReactNode }) {
  return children;
}
