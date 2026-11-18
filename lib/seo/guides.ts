/**
 * Short shopping guides in Norwegian. They answer the questions people ask
 * Google and AI assistants ("hva skal jeg ha på meg …", "hvilken vinterjakke …"),
 * and point to the matching Clea pages. Clea is an AI stylist, not a price
 * comparison site, so the guides lead with style and fit, never "cheapest".
 * Keep them factual and general: no prices or claims that go stale.
 *
 * Renamed slugs keep a permanent redirect in `guide-redirects.mjs`.
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
    slug: 'finn-riktig-antrekk',
    title: 'Slik finner du riktig antrekk på nett',
    description:
      'Fra anledning til ferdig antrekk: slik finner du klær og sko som passer stilen, budsjettet og størrelsen din – og hvordan AI-stylisten Clea hjelper deg.',
    published: '2026-11-06',
    updated: '2026-11-18',
    intro:
      'Det er lett å bli sittende og bla i mange nettbutikker uten å finne det du egentlig leter etter. Begynn heller med hva du skal, så blir det mye enklere å velge.',
    sections: [
      {
        heading: 'Start med anledningen',
        paragraphs: [
          'Julebord, jobbintervju, hyttetur eller en vanlig arbeidsdag stiller helt ulike krav. Når du vet hva du skal, vet du også om du trenger noe pent, varmt, komfortabelt eller praktisk.',
        ],
      },
      {
        heading: 'Dette hjelper deg å velge',
        bullets: [
          'Tenk på hva du allerede har: et nytt plagg bør passe med det som henger i garderoben.',
          'Bestem deg for et budsjett før du begynner å lete.',
          'Velg farger som er lette å kombinere, som svart, hvitt, beige og marine.',
          'Sjekk størrelsesguiden: størrelser varierer mellom merker.',
          'Les returvilkårene, særlig hos butikker du ikke har handlet hos før.',
        ],
      },
      {
        heading: 'Slik hjelper Clea deg',
        paragraphs: [
          'Clea er en AI-stylist som kjenner over 1 000 000 produkter fra 15+ nettbutikker. Fortell hva du skal, for eksempel «noe pent til julebord» eller «vinterjakke dame under 2000 kr», så foreslår Clea plagg som passer og viser hvor du kan kjøpe dem.',
        ],
      },
    ],
    links: [
      { href: '/chat', label: 'Spør AI-stylisten' },
      { href: '/shop', label: 'Handle etter kategori' },
      { href: '/merker', label: 'Merker A–Å' },
    ],
  },
  {
    slug: 'sneakers-guide',
    title: 'Sneakers: slik finner du riktig par',
    description:
      'Hverdag, trening eller stil? Slik velger du sneakers og løpesko som passer deg, og finner dem i norske nettbutikker.',
    published: '2026-11-06',
    updated: '2026-11-18',
    intro:
      'Sneakers fra merker som adidas, Nike og New Balance finnes i mange varianter. Det lønner seg å vite hva du skal bruke dem til før du velger.',
    sections: [
      {
        heading: 'Hva skal du bruke dem til?',
        bullets: [
          'Hverdag: en enkel, hvit eller nøytral sneaker passer til det meste, fra jeans til dress.',
          'Løping og trening: velg sko laget for aktiviteten, med demping og støtte som passer deg.',
          'Stil: klassiske modeller som Samba og Old Skool gir et enkelt, tidløst uttrykk.',
        ],
      },
      {
        heading: 'Størrelse og passform',
        paragraphs: [
          'Størrelser varierer mellom merker og modeller. Sjekk butikkens størrelsesguide og returvilkår, særlig hvis du bestiller fra en butikk du ikke har handlet hos før.',
        ],
      },
      {
        heading: 'Spør AI-stylisten',
        paragraphs: [
          'Fortell Clea hva du ser etter, for eksempel «hvite sneakers dame» eller «løpesko til asfalt», så får du forslag fra flere butikker på ett sted. Følger du et par, kan du slå på prisvarsel.',
        ],
      },
    ],
    links: [
      { href: '/shop/sko', label: 'Sko og sneakers' },
      { href: '/merker/adidas', label: 'adidas' },
      { href: '/chat', label: 'Spør AI-stylisten' },
    ],
  },
  {
    slug: 'vinterjakke-guide',
    title: 'Vinterjakke: slik velger du riktig',
    description:
      'Dunjakke, parkas eller syntetisk fôr? Slik velger du vinterjakke som holder deg varm gjennom norsk vinter.',
    published: '2026-11-06',
    updated: '2026-11-06',
    intro:
      'En god vinterjakke skal holde deg varm og tørr gjennom norsk vinter, og den er ofte et av de dyreste plaggene i garderoben. Derfor lønner det seg å velge riktig.',
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
        heading: 'La AI-stylisten hjelpe deg',
        paragraphs: [
          'Fortell Clea hvor og hvordan du skal bruke jakken, for eksempel «varm vinterjakke til Oslo» eller «parkas til hverdags», så foreslår AI-stylisten jakker som passer. Slå på prisvarsel hvis du vil vente på et tilbud.',
        ],
      },
    ],
    links: [
      { href: '/shop/jakker', label: 'Jakker og yttertøy' },
      { href: '/chat', label: 'Spør AI-stylisten' },
    ],
  },
  {
    slug: 'prisvarsel',
    title: 'Prisvarsel: få beskjed når prisen faller',
    description:
      'Slik bruker du prisvarsel på Clea og får beskjed når klær, sko og skjønnhetsprodukter du følger går ned i pris.',
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
    slug: 'ai-stylist',
    title: 'Hva er en AI-stylist – og hvordan bruker du den?',
    description:
      'Clea sin AI-stylist finner klær, sko og skjønnhet fra 15+ nettbutikker når du beskriver hva du trenger med egne ord.',
    published: '2026-11-06',
    updated: '2026-11-06',
    intro:
      'I stedet for å klikke deg gjennom menyer og filtre i mange nettbutikker, kan du skrive hva du leter etter – akkurat som du ville spurt en venn.',
    sections: [
      {
        heading: 'Slik bruker du den',
        bullets: [
          'Beskriv anledning, stil, farge og budsjett: «noe pent til julebord under 1500 kr».',
          'Juster svaret: «heller i svart», «vis lignende», «under 1000 kr».',
          'Åpne et produkt for å se hvilke butikker som har det.',
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
      { href: '/chat', label: 'Prøv AI-stylisten' },
      { href: '/about', label: 'Om Clea' },
    ],
  },
];

export function findGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
