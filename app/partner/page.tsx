import type { Metadata } from 'next';
import { PartnerPage } from '@/components/partner/partner-page';
import { BRAND } from '@/lib/constants/brand';

export const metadata: Metadata = {
  title: 'Samarbeid',
  description: `Bli partner med ${BRAND.name} — nå kjøpsklare shoppere i Norden med AI-drevet produktopdagelse.`,
};

export default function PartnerRoutePage() {
  return <PartnerPage />;
}
