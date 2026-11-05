/**
 * Short buying guide + FAQ under each Shop category. Written for shoppers in
 * Norway; kept general so it stays true as stores and products change.
 */
export interface CategoryContent {
  heading: string;
  paragraphs: string[];
  faq: Array<{ q: string; a: string }>;
}

const SHARED_FAQ = {
  howItWorks: {
    q: 'Hvordan sammenligner Clea priser?',
    a: 'Clea henter produkter fra nettbutikkene og viser samme vare side om side når flere butikker selger den. Du ser prisen, butikken og om varen er på lager, og går rett til butikken for å kjøpe.',
  },
  alert: {
    q: 'Kan jeg få beskjed når prisen faller?',
    a: 'Ja. Åpne produktet og velg «Varsle meg ved prisfall», så sender vi deg en e-post når prisen går ned.',
  },
};

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  kjoler: {
    heading: 'Kjoler på nett – finn riktig kjole til riktig pris',
    paragraphs: [
      'Her finner du kjoler fra mange nettbutikker samlet på ett sted: hverdagskjoler, festkjoler til julebord og bryllup, maxikjoler, strikkekjoler og skjortekjoler. Filtrer på farge, butikk, merke og pris for å finne det du leter etter.',
      'Samme kjole kan koste forskjellig hos ulike butikker. Clea viser prisene side om side, så du ser hvor kjolen er billigst før du kjøper.',
    ],
    faq: [
      { q: 'Hvor finner jeg en kjole til julebord under 1500 kr?', a: 'Bruk prisfilteret her, eller skriv det rett inn i AI-søket, for eksempel «festkjole til julebord under 1500 kr». Du får forslag fra flere butikker med prisene sammenlignet.' },
      SHARED_FAQ.howItWorks,
      SHARED_FAQ.alert,
    ],
  },
  overdeler: {
    heading: 'Overdeler – t-skjorter, skjorter og bluser fra flere butikker',
    paragraphs: [
      'Sammenlign t-skjorter, skjorter, bluser og topper fra mange nettbutikker. Velg dame eller herre, og filtrer på farge, merke og pris.',
      'Basisplagg som hvite t-skjorter og skjorter selges ofte av flere butikker samtidig. Her ser du prisforskjellene med én gang.',
    ],
    faq: [SHARED_FAQ.howItWorks, SHARED_FAQ.alert],
  },
  gensere: {
    heading: 'Gensere og strikk – ull, cardigans og hettegensere',
    paragraphs: [
      'Finn strikkegensere, ullgensere, cardigans og hettegensere fra mange butikker. Perfekt til norsk høst og vinter.',
      'Filtrer på merke, farge og pris, og se samme genser hos flere butikker før du bestemmer deg.',
    ],
    faq: [SHARED_FAQ.howItWorks, SHARED_FAQ.alert],
  },
  'bukser-jeans': {
    heading: 'Bukser og jeans – sammenlign priser på tvers av butikker',
    paragraphs: [
      'Jeans, dressbukser, chinos, shorts og skjørt fra mange nettbutikker. Velg passform, farge, merke og prisnivå med filtrene.',
      'Populære jeansmodeller finnes ofte hos flere butikker. Clea viser hvor de koster minst.',
    ],
    faq: [SHARED_FAQ.howItWorks, SHARED_FAQ.alert],
  },
  jakker: {
    heading: 'Jakker og yttertøy – vinterjakker, regnjakker og kåper',
    paragraphs: [
      'Her finner du vinterjakker, dunjakker, parkas, regnjakker, kåper og frakker fra mange nettbutikker, for dame og herre.',
      'Yttertøy er ofte en større investering. Sammenlign prisene på samme jakke hos flere butikker, og slå på prisvarsel hvis du vil vente på et bedre tilbud.',
    ],
    faq: [
      { q: 'Hvor finner jeg en god vinterjakke til en rimelig pris?', a: 'Velg «Vinterjakker» og bruk prisfilteret, eller spør AI-søket, for eksempel «dunjakke dame under 2000 kr». Clea viser jakker fra flere butikker med prisene sammenlignet.' },
      SHARED_FAQ.howItWorks,
      SHARED_FAQ.alert,
    ],
  },
  sko: {
    heading: 'Sko på nett – sneakers, støvler og løpesko',
    paragraphs: [
      'Sammenlign sneakers, løpesko, støvler, sandaler og pensko fra mange nettbutikker, med merker som adidas, Nike, New Balance og Ecco.',
      'Samme sko selges ofte av både merkets egen nettbutikk og andre butikker, til ulik pris. Clea viser alle tilbudene, så du finner laveste pris.',
    ],
    faq: [
      { q: 'Hvor er sneakers billigst?', a: 'Det varierer fra modell til modell. Søk opp skoen, så viser Clea hvilke butikker som selger den og hva den koster hos hver av dem.' },
      SHARED_FAQ.howItWorks,
      SHARED_FAQ.alert,
    ],
  },
  vesker: {
    heading: 'Vesker – håndvesker, ryggsekker og crossbody',
    paragraphs: [
      'Finn håndvesker, skinnvesker, totes, crossbody-vesker og ryggsekker fra mange nettbutikker, også brukte designervesker.',
      'Filtrer på merke, farge og pris, og sammenlign samme veske hos flere butikker.',
    ],
    faq: [SHARED_FAQ.howItWorks, SHARED_FAQ.alert],
  },
  sokker: {
    heading: 'Sokker og ullsokker',
    paragraphs: ['Sokker, ullsokker og sportssokker fra flere nettbutikker, med prisene sammenlignet.'],
    faq: [SHARED_FAQ.howItWorks],
  },
  tights: {
    heading: 'Tights og leggings',
    paragraphs: ['Strømpebukser, leggings og treningstights fra flere nettbutikker. Filtrer på merke, farge og pris.'],
    faq: [SHARED_FAQ.howItWorks],
  },
  skjonnhet: {
    heading: 'Skjønnhet – sminke, parfyme og hudpleie',
    paragraphs: [
      'Sammenlign priser på sminke, parfyme, hudpleie og hårpleie fra flere nettbutikker.',
      'Favorittproduktene dine kan ha ulik pris hos forskjellige butikker. Clea viser deg hvor de er billigst.',
    ],
    faq: [SHARED_FAQ.howItWorks, SHARED_FAQ.alert],
  },
  klokker: {
    heading: 'Klokker og armbåndsur',
    paragraphs: ['Klokker og armbåndsur fra flere nettbutikker, med prisene sammenlignet side om side.'],
    faq: [SHARED_FAQ.howItWorks, SHARED_FAQ.alert],
  },
  tilbehor: {
    heading: 'Tilbehør – smykker, belter, skjerf og solbriller',
    paragraphs: ['Smykker, belter, skjerf, luer, solbriller og annet tilbehør fra flere nettbutikker.'],
    faq: [SHARED_FAQ.howItWorks],
  },
};
