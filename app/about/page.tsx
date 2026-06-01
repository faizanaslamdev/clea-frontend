import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/legal-page-shell';
import { BRAND } from '@/lib/constants/brand';
import { COMPANY } from '@/lib/constants/company';

export const metadata: Metadata = {
  title: 'Om oss',
  description: `Lær mer om ${BRAND.name} — nordisk AI-drevet prissammenligning for mote.`,
};

export default function AboutPage() {
  return (
    <LegalPageShell
      title={`Om ${BRAND.name}`}
      description="Smartere motehandel i Norden."
    >
      <p>{COMPANY.about}</p>
      <p>{COMPANY.market}</p>
      <p>
        {BRAND.name} er basert i {COMPANY.locationLabel}. Vi kombinerer
        samtale-AI med ekte produktlister fra forhandlere, slik at du raskt kan
        sammenligne priser og handle trygt.
      </p>
      <h2>Det vi tilbyr</h2>
      <ul>
        <li>AI-drevet søk på tvers av mote- og skjønnhetsforhandlere</li>
        <li>Prissammenligning og oppdagelse for kjøpsklare shoppere</li>
        <li>Direkte lenker til produktsider hos forhandlere</li>
        <li>Merkeutforskning og kuraterte samlinger</li>
      </ul>
      <p>
        Spørsmål? Besøk{' '}
        <Link href="/contact">kontaktsiden</Link> eller send e-post til{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>
      <p className="text-muted-foreground text-sm">
        {COMPANY.name} · {COMPANY.locationLabel}
      </p>
    </LegalPageShell>
  );
}
