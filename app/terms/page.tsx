import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/legal-page-shell';
import { BRAND } from '@/lib/constants/brand';
import { COMPANY } from '@/lib/constants/company';

export const metadata: Metadata = {
  title: 'Vilkår',
  description: `Vilkår for bruk av ${BRAND.name}.`,
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Vilkår for bruk"
      description={`Vilkår for bruk av ${BRAND.domain}.`}
    >
      <p>
        <strong>Sist oppdatert:</strong> juni 2026
      </p>
      <p>
        Ved å bruke {BRAND.domain}, drevet av {COMPANY.name}, godtar du disse
        vilkårene. Hvis du ikke godtar dem, vennligst ikke bruk nettstedet.
      </p>
      <h2>Tjenesten</h2>
      <p>
        {BRAND.name} tilbyr prissammenligning og oppdagelse for mote og
        skjønnhet, inkludert AI-assistert søk. Produktinformasjon, priser og
        tilgjengelighet kommer fra forhandlere og kan endres uten varsel.
      </p>
      <h2>Nøyaktighet</h2>
      <p>
        Vi streber etter nøyaktige oppføringer, men garanterer ikke
        fullstendighet eller sanntidspriser. Bekreft alltid pris og
        tilgjengelighet hos forhandleren før kjøp.
      </p>
      <h2>Eksterne lenker</h2>
      <p>
        Lenker til tredjepartsforhandlere er tilgjengelig for din bekvemmelighet.{' '}
        {COMPANY.name} er ikke ansvarlig for forhandlernes nettsteder, produkter
        eller transaksjoner.
      </p>
      <h2>Akseptabel bruk</h2>
      <p>
        Du kan ikke misbruke nettstedet, forsøke uautorisert tilgang, scrape
        innhold i stort omfang eller bruke tjenesten til ulovlige formål.
      </p>
      <h2>Immaterielle rettigheter</h2>
      <p>
        {BRAND.name}-merkevare, design og programvare eies av {COMPANY.name} eller
        lisensgivere. Forhandlernes varemerker tilhører deres respektive eiere.
      </p>
      <h2>Ansvarsbegrensning</h2>
      <p>
        Nettstedet leveres «som det er» i den grad loven tillater. {COMPANY.name}{' '}
        er ikke ansvarlig for indirekte tap som følge av bruk av tjenesten eller
        tillit til vist informasjon.
      </p>
      <h2>Endringer</h2>
      <p>Vi kan oppdatere disse vilkårene; fortsatt bruk regnes som aksept.</p>
      <h2>Kontakt</h2>
      <p>
        <Link href="/contact">Kontakt</Link> ·{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>
    </LegalPageShell>
  );
}
