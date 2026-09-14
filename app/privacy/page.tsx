import type { Metadata } from 'next';
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
        erklæringen beskriver hvilken informasjon vi samler inn, hvorfor, og
        hvordan du kan utøve rettighetene dine.
      </p>

      <h2>Informasjon vi samler inn</h2>
      <ul>
        <li>
          <strong>Ikke-personlig informasjon:</strong> Anonymisert bruksdata
          (f.eks. besøkte sider, enhetstype, nettlesertype) via Vercel Analytics,
          brukt for å forbedre tjenesten. Denne kan ikke kobles til deg som
          enkeltperson. Vercel Analytics bruker ikke cookies.
        </li>
        <li>
          <strong>Personlig informasjon:</strong> Søkeforespørsler og tekst du
          skriver inn i søk eller chat, som brukes til å vise deg relevante
          produktresultater. Du trenger ikke konto for å bla på siden.
        </li>
        <li>
          <strong>Tekniske data:</strong> Standard serverlogger (IP-adresse,
          nettlesertype) for sikkerhet og drift.
        </li>
      </ul>

      <h2>Hvordan vi bruker informasjon</h2>
      <p>
        Vi bruker data til å drive nettstedet, forbedre søk og sammenligning,
        hindre misbruk, og forstå bruk i aggregert form. Søketekst behandles
        blant annet ved hjelp av tredjeparts AI-teknologi for å generere
        relevante resultater. Vi selger ikke personopplysninger.
      </p>

      <h2>Lagringstid</h2>
      <p>
        Tekniske serverlogger lagres i en begrenset periode i henhold til våre
        drifts- og sikkerhetsbehov og hostingleverandørens gjeldende
        lagringsvilkår. Søkeforespørsler og chatmeldinger lagres for å levere og
        forbedre tjenesten. Anonyme chat-samtaler kan ikke lenger hentes via
        tjenesten etter 30 dager uten aktivitet.
      </p>

      <h2>Informasjonskapsler (cookies)</h2>
      <p>Vi bruker følgende typer:</p>
      <ul>
        <li>
          <strong>Strengt nødvendige cookies:</strong> kreves for grunnleggende
          funksjonalitet, kan ikke deaktiveres.
        </li>
        <li>
          <strong>Analyse:</strong> Vercel Analytics måler bruk i aggregert,
          anonymisert form for å forbedre tjenesten, uten å bruke cookies.
        </li>
      </ul>
      <p>
        Du kan når som helst endre cookie-innstillingene i nettleseren din.
      </p>

      <h2>Tredjeparter</h2>
      <p>
        Når du følger lenker til forhandlere, gjelder deres personvernregler. Vi
        bruker infrastrukturleverandører (hosting, database, e-post) og
        AI-teknologi for søk, som behandler data på våre vegne i henhold til
        avtale.
      </p>

      <h2>Ved eierskifte</h2>
      <p>
        Dersom {COMPANY.name} selges, fusjoneres, eller virksomheten på annen
        måte overføres til en ny part, kan brukerinformasjon inngå som en del av
        det som overføres. Du vil bli varslet dersom dette medfører vesentlige
        endringer i hvordan dataene dine behandles.
      </p>

      <h2>Dine rettigheter</h2>
      <p>
        Du har rett til å be om innsyn i, retting av, eller sletting av
        personopplysninger vi har om deg, samt rett til å motsette deg eller
        begrense visse former for behandling.
      </p>
      <p>
        Kontakt oss på{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> for å utøve
        disse rettighetene.
      </p>
    </LegalPageShell>
  );
}
