import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/legal-page-shell';
import { BRAND } from '@/lib/constants/brand';
import { COMPANY } from '@/lib/constants/company';

export const metadata: Metadata = {
  title: 'Personvern',
  description: `Personvernerklæring for ${BRAND.name}.`,
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Personvernerklæring"
      description={`Hvordan ${BRAND.name} behandler informasjon når du bruker ${BRAND.domain}.`}
    >
      <p>
        <strong>Sist oppdatert:</strong> juni 2026
      </p>
      <p>
        {COMPANY.name} ({BRAND.domain}) respekterer personvernet ditt. Denne
        erklæringen beskriver hvilken informasjon vi samler inn og hvordan vi
        bruker den når du besøker nettstedet vårt.
      </p>
      <h2>Informasjon vi samler inn</h2>
      <ul>
        <li>
          <strong>Bruksdata:</strong> anonymisert analyse (f.eks. besøkte sider,
          enhetstype) via Vercel Analytics for å forbedre tjenesten.
        </li>
        <li>
          <strong>Søkeforespørsler:</strong> tekst du skriver inn i søk eller
          chat for å vise produktresultater. Du trenger ikke konto for å bla på
          siden.
        </li>
        <li>
          <strong>Tekniske data:</strong> standard serverlogger (IP-adresse,
          nettlesertype) for sikkerhet og drift.
        </li>
      </ul>
      <h2>Hvordan vi bruker informasjon</h2>
      <p>
        Vi bruker data til å drive nettstedet, forbedre søk og sammenligning,
        hindre misbruk og forstå bruk i aggregert form. Vi selger ikke
        personopplysninger.
      </p>
      <h2>Informasjonskapsler</h2>
      <p>
        Vi bruker nødvendige informasjonskapsler for funksjonalitet og
        analysekapsler som beskrevet over. Du kan styre kapsler i
        nettleserinnstillingene.
      </p>
      <h2>Tredjeparter</h2>
      <p>
        Når du følger lenker til forhandlere, gjelder deres personvernregler. Vi
        kan bruke infrastrukturleverandører (f.eks. hosting) som behandler data
        på våre vegne etter avtale.
      </p>
      <h2>Dine rettigheter</h2>
      <p>
        Avhengig av gjeldende lov kan du be om innsyn, retting eller sletting av
        personopplysninger vi har. Kontakt oss på{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>
      <h2>Kontakt</h2>
      <p>
        {COMPANY.name} · <Link href="/contact">Kontaktside</Link> ·{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>
    </LegalPageShell>
  );
}
