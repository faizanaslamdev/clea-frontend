import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/legal-page-shell';
import { BRAND } from '@/lib/constants/brand';
import { COMPANY } from '@/lib/constants/company';

export const metadata: Metadata = {
  title: 'Samarbeid',
  description: `Samarbeid med ${BRAND.name} — nå kjøpsklare mote-shoppere.`,
};

export default function PartnerPage() {
  return (
    <LegalPageShell
      title="Samarbeid med Clea"
      description="Nå shoppere med høy kjøpsintensjon i Norden."
    >
      <p>
        {BRAND.name} kobler mote- og skjønnhetsmerker med shoppere som bruker
        AI-søk for å finne produkter og sammenligne priser før de handler.
      </p>
      <h2>Hvorfor samarbeide</h2>
      <ul>
        <li>Synlighet i søk, merkesider og kuraterte samlinger</li>
        <li>Trafikk til produktsidene dine</li>
        <li>Målgruppe med fokus på Norge og resten av Norden</li>
        <li>Plassering i opplevelser shoppere allerede bruker til oppdagelse</li>
      </ul>
      <h2>Hvem vi samarbeider med</h2>
      <p>
        Mote- og skjønnhetsforhandlere, markedsplasser og merker som selger
        gjennom etablerte nordiske kanaler — fra globale navn til nye
        merkevarer.
      </p>
      <h2>Ta kontakt</h2>
      <p>
        For partnerskap, integrasjoner eller merkelisting, send e-post til{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> med
        «Partnerskap» i emnefeltet.
      </p>
      <p>
        <Link href="/brands">Utforsk merker på Clea</Link> ·{' '}
        <Link href="/contact">Kontakt</Link>
      </p>
    </LegalPageShell>
  );
}
