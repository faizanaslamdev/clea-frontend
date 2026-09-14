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
        {COMPANY.name} tilbyr prissammenligning og oppdagelse for mote og
        skjønnhet, inkludert AI-assistert søk. Produktinformasjon, priser og
        tilgjengelighet kommer fra forhandlere og kan endres uten varsel.
      </p>

      <h2>Nøyaktighet</h2>
      <p>
        Vi streber etter nøyaktige oppføringer, men garanterer ikke
        fullstendighet eller sanntidspriser. Bekreft alltid pris og
        tilgjengelighet hos forhandleren før kjøp. AI-søket kan i noen tilfeller
        gi upresise eller feilaktige treff og anbefalinger – bruk skjønn og
        verifiser informasjon som er viktig for din beslutning.
      </p>

      <h2>Annonselenker og provisjon</h2>
      <p>
        {COMPANY.name} inneholder annonselenker til forhandlere. Vi kan motta
        provisjon dersom du klikker på en lenke og gjennomfører et kjøp, uten at
        det koster deg noe ekstra. Dette påvirker ikke hvilke priser du vises
        eller vår vurdering av nøyaktighet.
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
        innhold i stort omfang, forsøke å omgå tekniske sperrer, eller bruke
        tjenesten til ulovlige formål. Du kan heller ikke gi inntrykk av at
        uttalelser du gjør er godkjent eller uttalt av {COMPANY.name}.
      </p>

      <h2>Håndheving</h2>
      <p>
        Ved brudd på disse vilkårene kan vi, uten forvarsel, begrense eller
        stenge din tilgang til nettstedet. Bestemmelser som etter sin art er
        ment å bestå etter en slik stenging (som immaterielle rettigheter og
        ansvarsbegrensning) gjelder fortsatt.
      </p>

      <h2>Tilbakemeldinger</h2>
      <p>
        Forslag, kommentarer eller tilbakemeldinger du sender oss kan brukes
        fritt av {COMPANY.name} til å forbedre tjenesten, uten kompensasjon til
        deg.
      </p>

      <h2>Immaterielle rettigheter</h2>
      <p>
        {COMPANY.name}-merkevare, design og programvare eies av {COMPANY.name}{' '}
        eller lisensgivere. Forhandlernes varemerker tilhører deres respektive
        eiere.
      </p>

      <h2>Ansvarsbegrensning</h2>
      <p>
        Nettstedet leveres «som det er» i den grad loven tillater.{' '}
        {COMPANY.name} er ikke ansvarlig for indirekte tap som følge av bruk av
        tjenesten eller tillit til vist informasjon.
      </p>

      <h2>Lovvalg og verneting</h2>
      <p>
        Disse vilkårene reguleres av norsk rett. Eventuelle tvister skal søkes
        løst i minnelighet; dersom dette ikke fører frem, hører tvisten inn under
        norske domstoler med {COMPANY.name} sitt verneting som rett verneting.
      </p>

      <h2>Delvis ugyldighet</h2>
      <p>
        Dersom en bestemmelse i disse vilkårene anses ugyldig eller ikke kan
        håndheves, skal denne bestemmelsen begrenses eller fjernes i minst mulig
        grad, slik at resten av vilkårene fortsatt gjelder fullt ut.
      </p>

      <h2>Endringer</h2>
      <p>Vi kan oppdatere disse vilkårene; fortsatt bruk regnes som aksept.</p>

      <h2>Kontakt</h2>
      <p>
        <Link href="/contact">Kontakt</Link> ·{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>
      <p>©️ 2026 {COMPANY.name} · Alle rettigheter reservert</p>
    </LegalPageShell>
  );
}
