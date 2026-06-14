import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  CircleDollarSign,
  MousePointerClick,
  RefreshCw,
  Search,
  Sparkles,
  Store,
  Tag,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { PageLayout } from '@/components/layout/page-layout';
import { PartnerContactForm } from '@/components/partner/partner-contact-form';
import { PartnerFeatureVisual } from '@/components/partner/partner-feature-visual';
import { BRAND } from '@/lib/constants/brand';
import { COMPANY } from '@/lib/constants/company';

const PROBLEMS = [
  {
    icon: Search,
    title: 'Oppdagelse er fragmentert',
    description:
      'Shoppere starter på sosiale medier og i søk, men det er vanskelig å gjøre den oppmerksomheten om til målbar trafikk på produktsidene dine.',
  },
  {
    icon: MousePointerClick,
    title: 'Betalt trafikk er ujevn',
    description:
      'Merker betaler for klikk, men kvaliteten varierer — og mange besøkende er langt fra et kjøp.',
  },
  {
    icon: Tag,
    title: 'Merkevare vs. pris',
    description:
      'Shoppere sammenligner priser hele tiden. Konstante rabatter kan svekke merkevaren din over tid.',
  },
  {
    icon: TrendingUp,
    title: 'Fragmentert innsikt',
    description:
      'Søkeintensjon, produktdata og kampanjer lever ofte i separate systemer — uten helhetlig bilde.',
  },
] as const;

const WHY_PARTNER = [
  {
    icon: Sparkles,
    title: 'Kuratert oppdagelse',
    description:
      'Produktene dine vises i AI-søk og relevante resultater — der shoppere allerede beskriver hva de leter etter.',
  },
  {
    icon: Users,
    title: 'Nå nye shoppere',
    description:
      'Vi kobler deg med kjøpsklare brukere som sammenligner produkter på tvers av nordiske forhandlere.',
  },
  {
    icon: Store,
    title: 'Trafikk med intensjon',
    description:
      'Brukere kommer med et konkret behov, ikke for tilfeldig scrolling. De er nærmere et kjøp.',
  },
  {
    icon: BarChart3,
    title: 'Nordisk fokus',
    description:
      'Bygget for Norge og Norden — der shoppere sammenligner mote og skjønnhet digitalt.',
  },
  {
    icon: RefreshCw,
    title: 'Resultatbasert',
    description:
      'Vi kobler til via eksisterende affiliate- eller produktfeed-oppsett. Ingen plattformavgift.',
  },
] as const;

const GET_STARTED = [
  {
    icon: CircleDollarSign,
    title: 'Ingen integrasjonsavgift',
    description: 'Vi kobler til via ditt eksisterende affiliate- eller feed-oppsett.',
  },
  {
    icon: CircleDollarSign,
    title: 'Del produktkatalog',
    description:
      'Oppdatert feed med korrekt pris, bilde og deeplink til produktsidene dine.',
  },
  {
    icon: Zap,
    title: '1–2 ukers gjennomgang',
    description: 'Vi sjekker datakvalitet, tilgjengelighet og nordisk relevans.',
  },
  {
    icon: Sparkles,
    title: 'Live på Clea',
    description:
      'Merkevaren din vises i AI-søk, merkesider og kuraterte produktopplevelser.',
  },
  {
    icon: BarChart3,
    title: 'Videre samarbeid',
    description:
      'Vi evaluerer resultater og ser på hvordan vi kan utvide synligheten sammen.',
  },
] as const;

const SPOTLIGHTS = [
  {
    title: 'AI-søk for mote og skjønnhet',
    description:
      'Shoppere beskriver behovet sitt i naturlig språk — anledning, stil, farge eller produkt. Clea matcher produktene dine når de er relevante.',
    aside:
      'Høy-intensjons trafikk: Brukere kommer for å finne og sammenligne — ikke for passiv browsing.',
    variant: 'chat' as const,
    reverse: false,
  },
  {
    title: 'Merkesider',
    description:
      'En dedikert side der shoppere utforsker merkevaren din og finner produkter på tvers av forhandlere.',
    aside:
      'Merkevarebygging: Shoppere oppdager deg i en kontekst bygget for mote — ikke bare rabatter.',
    variant: 'brands' as const,
    reverse: true,
  },
  {
    title: 'Produktfunn i søk',
    description:
      'Når shoppere finjusterer søket sitt, kan produktene dine dukke opp i resultater og forslag — akkurat når intensjonen er høyest.',
    aside:
      'Riktig timing: Synlighet i øyeblikket brukeren aktivt vurderer hva de vil kjøpe.',
    variant: 'search' as const,
    reverse: false,
  },
] as const;

function PartnerTile({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <article className="partner-page__tile">
      <div className="partner-page__tile-icon" aria-hidden>
        <Icon className="size-4" strokeWidth={1.5} />
      </div>
      <h3 className="partner-page__tile-title">{title}</h3>
      <p className="partner-page__tile-text">{description}</p>
    </article>
  );
}

export function PartnerPage() {
  return (
    <PageLayout mainClassName="partner-page-layout">
      <div className="partner-page">
        <section className="partner-page__hero">
          <p className="partner-page__eyebrow">Partner med {BRAND.name}</p>
          <h1 className="partner-page__hero-title">
            <span>Bli med på</span>
            <span>fremtidens mote.</span>
          </h1>
          <p className="partner-page__hero-lead">
            Nå kjøpsklare shoppere i Norden. Vis produktene dine i AI-søk,
            merkesider og kuraterte samlinger som driver reelle kjøp.
          </p>
          <a href="#partner-contact" className="partner-page__cta">
            Ta kontakt
          </a>
        </section>

        <section className="partner-page__section">
          <h2 className="partner-page__section-title">
            Utfordringen for motemerker i dag
          </h2>
          <div className="partner-page__grid partner-page__grid--problems">
            {PROBLEMS.map((item) => (
              <PartnerTile key={item.title} {...item} />
            ))}
          </div>
        </section>

        <section className="partner-page__section">
          <h2 className="partner-page__section-title">
            Hvorfor samarbeide med {BRAND.name}?
          </h2>
          <p className="partner-page__section-lead">
            Vi kobler høy-intensjons oppdagelse med trafikk til produktsidene
            dine — uten å være en nettbutikk.
          </p>
          <div className="partner-page__card-row">
            {WHY_PARTNER.map((item) => (
              <PartnerTile key={item.title} {...item} />
            ))}
          </div>
        </section>

        <section className="partner-page__section">
          <h2 className="partner-page__section-title">
            Slik kommer du <span className="italic">i gang</span>
          </h2>
          <div className="partner-page__card-row">
            {GET_STARTED.map((item) => (
              <PartnerTile key={item.title} {...item} />
            ))}
          </div>
        </section>

        {SPOTLIGHTS.map((spotlight) => (
          <section
            key={spotlight.title}
            className={
              spotlight.reverse
                ? 'partner-page__spotlight partner-page__spotlight--reverse'
                : 'partner-page__spotlight'
            }
          >
            <div className="partner-page__spotlight-copy">
              <h2 className="partner-page__spotlight-title">{spotlight.title}</h2>
              <p className="partner-page__spotlight-text">{spotlight.description}</p>
              <div className="partner-page__spotlight-aside">
                <p>{spotlight.aside}</p>
              </div>
            </div>
            <PartnerFeatureVisual variant={spotlight.variant} />
          </section>
        ))}

        <section
          id="partner-contact"
          className="partner-page__section partner-page__section--contact"
        >
          <div className="partner-page__contact-panel">
            <h2 className="partner-page__contact-title">Ta kontakt</h2>
            <p className="partner-page__contact-lead">
              Eller send e-post direkte til{' '}
              <a
                href={`mailto:${COMPANY.email}`}
                className="partner-page__contact-link"
              >
                {COMPANY.email}
              </a>
            </p>
            <PartnerContactForm />
          </div>
        </section>

        <div className="partner-page__footer-note">
          <Link href="/brands" className="partner-page__footer-link">
            Utforsk merker på {BRAND.name}
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
