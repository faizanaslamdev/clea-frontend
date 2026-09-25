const EDITORIAL_IMAGES = {
  adidas: '/brands/editorial/adidas.webp',
  asos: '/brands/editorial/asos.webp',
  bubbleroom: '/brands/editorial/bubbleroom.webp',
  dbJourney: '/brands/editorial/db-journey.webp',
  nelly: '/brands/editorial/nelly.webp',
  nlyMan: '/brands/editorial/nly-man.webp',
  outnorth: '/brands/editorial/outnorth.webp',
  viking: '/brands/editorial/viking.webp',
  ralphLauren: '/brands/editorial/ralph-lauren.webp',
  urverket: '/brands/editorial/urverket.webp',
  sephora: '/brands/editorial/sephora.webp',
} as const;

const DEFAULT_EDITORIAL_POSITION = '50% 50%';

function normalizeBrandName(brandName: string): string {
  return brandName.trim().toLowerCase();
}

/**
 * Approved brand imagery supplied for the `/brands` editorial grid and hero.
 * Unknown brands fall back to their live affiliate-feed product image.
 */
export function getBrandEditorialImage(
  brandName: string,
): string | null {
  const name = normalizeBrandName(brandName);

  if (/nly\s?man/.test(name)) {
    return EDITORIAL_IMAGES.nlyMan;
  }
  if (/nelly/.test(name)) {
    return EDITORIAL_IMAGES.nelly;
  }
  if (/db\s+journey|journey/.test(name)) {
    return EDITORIAL_IMAGES.dbJourney;
  }
  if (/outnorth/.test(name)) {
    return EDITORIAL_IMAGES.outnorth;
  }
  if (/viking/.test(name)) {
    return EDITORIAL_IMAGES.viking;
  }
  if (/ralph\s+lauren/.test(name)) {
    return EDITORIAL_IMAGES.ralphLauren;
  }
  if (/adidas/.test(name)) {
    return EDITORIAL_IMAGES.adidas;
  }
  if (/asos/.test(name)) {
    return EDITORIAL_IMAGES.asos;
  }
  if (/bubbleroom/.test(name)) {
    return EDITORIAL_IMAGES.bubbleroom;
  }
  if (/urverket/.test(name)) {
    return EDITORIAL_IMAGES.urverket;
  }
  if (/sephora/.test(name)) {
    return EDITORIAL_IMAGES.sephora;
  }

  return null;
}

/**
 * Per-image focal points keep faces and the primary subject inside landscape
 * card and hero crops without modifying the approved source imagery.
 */
export function getBrandEditorialPosition(brandName: string): string {
  const name = normalizeBrandName(brandName);

  if (/nly\s?man/.test(name)) return '50% 22%';
  if (/nelly/.test(name)) return '50% 18%';
  if (/db\s+journey|journey/.test(name)) return '70% 24%';
  if (/outnorth/.test(name)) return '50% 28%';
  if (/viking/.test(name)) return '50% 20%';
  if (/ralph\s+lauren/.test(name)) return '50% 18%';
  if (/adidas/.test(name)) return '50% 35%';
  // Tall portrait assets — bias hard to the top so faces stay in the 4:3 crop.
  if (/asos/.test(name)) return '50% 8%';
  if (/bubbleroom/.test(name)) return '50% 10%';
  if (/urverket/.test(name)) return '50% 40%';
  if (/sephora/.test(name)) return '50% 35%';

  return DEFAULT_EDITORIAL_POSITION;
}

/**
 * Optional frame scale for portrait editorial assets that read too tight in
 * the landscape brand-card crop. Hero keeps object-position only (Ken Burns).
 */
export function getBrandEditorialFrameClassName(brandName: string): string {
  const name = normalizeBrandName(brandName);
  if (/asos|bubbleroom/.test(name)) {
    return 'origin-top scale-[0.88] group-hover:scale-[0.93]';
  }
  return '';
}
