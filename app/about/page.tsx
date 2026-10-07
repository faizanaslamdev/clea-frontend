import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/legal-page-shell';
import { BRAND } from '@/lib/constants/brand';
import { COMPANY } from '@/lib/constants/company';

export const metadata: Metadata = {
  title: 'Om oss',
  description: `Lær mer om ${BRAND.name} — din personlige moteassistent.`,
};

export default function AboutPage() {
  return (
    <LegalPageShell
      title={`Om ${BRAND.name}`}
      description="Smartere motehandel i Norden."
    >
      <p>
        {BRAND.name} er en personlig moteassistent. Våre brukere kommer til{' '}
        {BRAND.name} for å bli inspirert, oppdage nye merker og finne akkurat
        det de leter etter.
      </p>
      <p>
        I stedet for å lete gjennom uendelig mange nettbutikker, samler{' '}
        {BRAND.name} alt på ett sted. Ved å kombinere smart teknologi med
        oppdaterte produktlister fra ledende forhandlere, gjør vi veien fra
        inspirasjon til ferdig antrekk enklere, raskere og mer personlig.
      </p>
      <p>
        Når du har funnet det du ønsker, tar vi deg direkte til riktig produkt
        i riktig butikk – akkurat når du er klar til å handle.
      </p>
      <h2>Hva vi tilbyr</h2>
      <ul>
        <li>
          <strong>Personlig moteassistent:</strong> En smart løsning som
          forstår stilen og ønskene dine, og hjelper deg å finne riktige
          produkter.
        </li>
        <li>
          <strong>Bred produktoversikt:</strong> Søk på tvers av ledende mote-
          og skjønnhetsforhandlere med oppdatert tilgjengelighet.
        </li>
        <li>
          <strong>Stilutforskning:</strong> En inspirerende måte å oppdage nye
          trender, merker og samlinger på.
        </li>
        <li>
          <strong>Rett til butikken:</strong> Direkte lenker til produktsidene
          hos forhandlerne når du er klar til å handle.
        </li>
      </ul>
      <h2>Spørsmål eller innspill?</h2>
      <p>
        Besøk vår <Link href="/contact">kontaktside</Link> eller send oss en
        e-post på <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>
      <p className="text-muted-foreground text-sm">
        {COMPANY.name} · {COMPANY.locationLabel}
      </p>
    </LegalPageShell>
  );
}
