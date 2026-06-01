import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/legal/legal-page-shell';
import { BRAND } from '@/lib/constants/brand';
import { COMPANY } from '@/lib/constants/company';

export const metadata: Metadata = {
  title: 'Kontakt',
  description: `Ta kontakt med ${BRAND.name}.`,
};

export default function ContactPage() {
  return (
    <LegalPageShell
      title="Kontakt"
      description={`Vi hører gjerne fra deg. Kontakt ${BRAND.name} med detaljene nedenfor.`}
    >
      <h2>Generelle henvendelser</h2>
      <p>
        E-post:{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>
      <h2>Sted</h2>
      <p>{COMPANY.locationLabel}</p>
    </LegalPageShell>
  );
}
