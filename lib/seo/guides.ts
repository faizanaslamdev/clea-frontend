/**
 * Short shopping guides in Norwegian. They answer the questions people ask
 * Google and AI assistants ("hvor er det billigst …", "hvordan sammenligne
 * priser …"), and point to the matching Clea pages. Keep them factual and
 * general: no prices or claims that go stale.
 */
export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  published: string;
  updated: string;
  intro: string;
  sections: GuideSection[];
  links: Array<{ href: string; label: string }>;
}

export const GUIDES: Guide[] = [
  {
    slug: 'sammenligne-priser-klaer-sko',
    title: 'Slik sammenligner du priser på klær og sko på nett',
    description:
      'En enkel guide til å finne laveste pris på klær, sko og vesker i norske nettbutikker – og hvordan Clea gjør det for deg på ett sted.',
    published: '2026-11-06',
    updated: '2026-11-06',
    intro:
      'Den samme jakken, skoen eller kjolen selges ofte av flere nettbutikker samtidig – og prisen kan variere mer enn mange tror. Med noen enkle grep betaler du ikke mer enn nødvendig.',
    sections: [
      {
        heading: 'Hvorfor er prisen forskjellig fra butikk til butikk?',
        paragraphs: [
          'Butikkene setter prisene selv. Noen har kampanjer, andre har restlager, og merkets egen nettbutikk er ikke alltid billigst. Prisene endrer seg også fra uke til uke.',
        ],
      },
      {
        heading: 'Slik finner du laveste pris',
        bullets: [
          'Søk opp nøyaktig samme vare – samme modell, farge og størrelse.',
          'Sammenlign totalpris: frakt, retur og eventuelle tollgebyrer fra butikker utenfor Norge.',
          'Sjekk at varen er på lager i din størrelse før du bestemmer deg.',
          'Bruk prisvarsel hvis du ikke har hastverk, så får du beskjed når prisen faller.',
        ],
      },
      {
        heading: 'Slik gjør Clea det for deg',
        paragraphs: [
          'Clea samler over 1 000 000 produkter fra 15+ nettbutikker. Når flere butikker selger samme vare, ser du prisene side om side og går rett til butikken med best pris. Du kan søke med vanlige ord, som «vinterjakke dame under 2000 kr», eller spørre AI-moteassistenten.',
        ],
      },
    ],
    links: [
      { href: '/shop', label: 'Handle etter kategori' },
      { href: '/chat', label: 'Spør AI-moteassistenten' },
      { href: '/merker', label: 'Merker A–Å' },
    ],
  },
  {
    slug: 'billige-sneakers-norge',
    title: 'Hvor er sneakers billigst i Norge?',
    description:
      'Tips for å finne sneakers og løpesko til lavest mulig pris: sammenlign butikker, følg med på salg og bruk prisvarsel.',
    published: '2026-11-06',
    updated: '2026-11-06',
    intro:
      'Populære sneakers fra merker som adidas, Nike og New Balance selges både av merkenes egne nettbutikker og av sportsbutikker og motebutikker. Det betyr at samme par ofte har flere priser.',
    sections: [
      {
        heading: 'Sammenlign samme modell hos flere butikker',
        paragraphs: [
          'Søk opp modellnavnet, for eksempel «Ultraboost 5» eller «Samba». På Clea ser du hvilke butikker som har skoen og hva den koster hos hver av dem.',
        ],
      },
      {
        heading: 'Når er det lurt å kjøpe?',
        bullets: [
          'Black Friday og Cyber Monday i slutten av november.',
          'Romjulssalg og januarsalg.',
          'Sommersalg når nye kolleksjoner kommer.',
          'Når en ny versjon av skoen lanseres, blir forrige modell ofte satt ned.',
        ],
      },
      {
        heading: 'Husk størrelse og retur',
        paragraphs: [
          'Størrelser varierer mellom merker. Sjekk butikkens returvilkår, særlig hvis du bestiller fra en butikk du ikke har handlet hos før.',
        ],
      },
    ],
    links: [
      { href: '/shop/sko', label: 'Sko og sneakers' },
      { href: '/merker/adidas', label: 'adidas' },
      { href: '/chat', label: 'Spør AI-moteassistenten' },
    ],
  },
  {
    slug: 'vinterjakke-guide',
    title: 'Vinterjakke: slik velger du riktig – og betaler minst',
    description:
      'Dunjakke, parkas eller syntetisk fôr? Slik velger du vinterjakke til norsk vinter og finner den til best pris.',
    published: '2026-11-06',
    updated: '2026-11-06',
    intro:
      'En god vinterjakke skal holde deg varm og tørr gjennom norsk vinter, og den er ofte et av de dyreste plaggene i garderoben. Derfor lønner det seg å velge riktig og sammenligne prisene.',
    sections: [
      {
        heading: 'Dun eller syntetisk fôr?',
        paragraphs: [
          'Dun er lett og veldig varmt, men taper isolasjon når det blir vått. Syntetisk fôr tåler fukt bedre og passer til vått kystklima. I tørr kulde er dun ofte det beste valget.',
        ],
      },
      {
        heading: 'Dette bør du se etter',
        bullets: [
          'Lengde: en lang parkas eller kåpe holder bedre på varmen enn en kort jakke.',
          'Hette, høy krage og tette mansjetter mot vind og snø.',
          'Vannavstøtende eller vanntett ytterstoff hvis du bor der det er mye nedbør.',
          'Plass til et varmt lag under.',
        ],
      },
      {
        heading: 'Slik får du den billigere',
        paragraphs: [
          'Samme jakke kan ha ulik pris hos forskjellige butikker. Filtrer på vinterjakker på Clea, sammenlign prisene, og slå på prisvarsel hvis du kan vente på et tilbud.',
        ],
      },
    ],
    links: [
      { href: '/shop/jakker', label: 'Jakker og yttertøy' },
      { href: '/chat', label: 'Finn jakke med AI-søk' },
    ],
  },
  {
    slug: 'prisvarsel',
    title: 'Prisvarsel: få beskjed når prisen faller',
    description:
      'Slik bruker du prisvarsel på Clea for å kjøpe klær, sko og skjønnhetsprodukter når de er billigst.',
    published: '2026-11-06',
    updated: '2026-11-06',
    intro:
      'Har du sett deg ut en vare, men synes den er litt for dyr? Med prisvarsel slipper du å sjekke prisen hver dag.',
    sections: [
      {
        heading: 'Slik slår du på prisvarsel',
        bullets: [
          'Finn varen på Clea og åpne produktsiden.',
          'Trykk «Varsle meg ved prisfall».',
          'Logg inn eller opprett en gratis konto, så sender vi deg en e-post når prisen går ned.',
        ],
      },
      {
        heading: 'Når lønner det seg?',
        paragraphs: [
          'Prisvarsel passer for varer du ikke trenger i dag: vinterjakken du vil ha før kulda kommer, eller sneakersene du venter på at skal komme på salg. Du ser alle prisvarslene dine under «Min konto».',
        ],
      },
    ],
    links: [
      { href: '/shop', label: 'Finn en vare å følge' },
      { href: '/faq', label: 'Ofte stilte spørsmål' },
    ],
  },
  {
    slug: 'ai-moteassistent',
    title: 'Hva er en AI-moteassistent – og hvordan bruker du den?',
    description:
      'Clea sin AI-moteassistent finner klær, sko og skjønnhet fra 15+ nettbutikker når du beskriver hva du trenger med egne ord.',
    published: '2026-11-06',
    updated: '2026-11-06',
    intro:
      'I stedet for å klikke deg gjennom menyer og filtre i mange nettbutikker, kan du skrive hva du leter etter – akkurat som du ville spurt en venn.',
    sections: [
      {
        heading: 'Slik bruker du den',
        bullets: [
          'Beskriv anledning, stil, farge og budsjett: «noe pent til julebord under 1500 kr».',
          'Juster svaret: «heller i svart», «billigere», «vis lignende».',
          'Åpne et produkt for å se prisen hos alle butikkene som selger det.',
        ],
      },
      {
        heading: 'Hvor kommer forslagene fra?',
        paragraphs: [
          'Forslagene hentes fra produktene til nettbutikkene på Clea, med oppdaterte priser. Du kjøper alltid direkte hos butikken.',
        ],
      },
    ],
    links: [
      { href: '/chat', label: 'Prøv AI-moteassistenten' },
      { href: '/about', label: 'Om Clea' },
    ],
  },
];

export function findGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
