export interface PromoTestimonial {
  quote: string;
  author: string;
}

export const PROMO_TESTIMONIALS: PromoTestimonial[] = [
  {
    quote:
      'Endelig et verktøy som hjelper meg å handle smartere uten støy — ekte prisinnsikt, ikke reklame. Enten det er hverdagsmote eller en treat, vet jeg at jeg handler til rett tid.',
    author: 'Ari L.',
  },
  {
    quote:
      'Jeg pleide å åpne ti faner for å sammenligne priser. Nå sjekker jeg clea.no én gang og vet hvilken butikk som faktisk er billigst — det sparer meg tid hver uke.',
    author: 'Sofia M.',
  },
  {
    quote:
      'Samlingsfunksjonen er perfekt til ønskelister. Jeg ser tydelig hva som har falt i pris og hva som fortsatt er full pris før jeg kjøper.',
    author: 'Jonas K.',
  },
  {
    quote:
      'Rent, raskt og uten rot. Det føles laget for hvordan jeg faktisk handler på nett — bla, sammenlign, bestem deg med trygghet.',
    author: 'Ella R.',
  },
];

export const PROMO_TESTIMONIAL_ROTATE_MS = 6500;
