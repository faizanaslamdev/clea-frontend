import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/legal-page-shell';
import { BRAND } from '@/lib/constants/brand';

export const metadata: Metadata = {
  title: 'FAQ',
  description: `Ofte stilte spørsmål om ${BRAND.name}.`,
};

const FAQ_ITEMS = [
  {
    q: 'Hva er Clea?',
    a: 'Clea er en nordisk prissammenligningstjeneste for mote. Bruk AI-søk for å finne produkter og sammenligne priser hos ledende forhandlere.',
  },
  {
    q: 'Hvilke forhandlere dekker dere?',
    a: 'Vi fokuserer på store moteforhandlere populære i Norge og Norden, blant annet Zalando, Boozt, Nelly og H&M. Tilgjengelige merker og produkter utvides over tid.',
  },
  {
    q: 'Trenger jeg en konto?',
    a: 'Nei, du trenger ikke konto for å søke og bla. Du kan utforske merker, kjøre AI-søk og følge lenker for å handle hos forhandlerne.',
  },
  {
    q: 'Hvordan fungerer AI-søk?',
    a: 'Beskriv hva du leter etter med egne ord. Vi matcher forespørselen med relevante produkter og viser alternativer med lenker til forhandlernes sider.',
  },
  {
    q: 'Hvor fullfører jeg kjøpet?',
    a: 'Kjøp skjer alltid på forhandlerens nettsted. Clea hjelper deg med å oppdage og sammenligne — utsjekking skjer hos butikken du velger.',
  },
  {
    q: 'Er Clea tilgjengelig utenfor Norge?',
    a: 'Norge er hovedmarkedet vårt. Vi ekspanderer i hele Norden.',
  },
] as const;

export default function FaqPage() {
  return (
    <LegalPageShell
      title="FAQ"
      description="Vanlige spørsmål om å bruke Clea."
    >
      <div className="space-y-10">
        {FAQ_ITEMS.map((item) => (
          <section key={item.q}>
            <h2 className="legal-page__h2">{item.q}</h2>
            <p>{item.a}</p>
          </section>
        ))}
      </div>
      <p className="mt-12">
        Har du flere spørsmål? <Link href="/contact">Kontakt oss</Link>.
      </p>
    </LegalPageShell>
  );
}
