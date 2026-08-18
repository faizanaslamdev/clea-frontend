const EDITORIAL_IMAGES = {
  dbJourney: '/brands/editorial/db-journey.webp',
  duomain: '/brands/editorial/duomain.webp',
  nelly: '/brands/editorial/nelly.webp',
  nlyMan: '/brands/editorial/nly-man.webp',
  outnorth: '/brands/editorial/outnorth.webp',
  viking: '/brands/editorial/viking.webp',
  ralphLauren: '/brands/editorial/ralph-lauren.webp',
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
  if (/duomain/.test(name)) {
    return EDITORIAL_IMAGES.duomain;
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
  if (/duomain/.test(name)) return '50% 22%';

  return DEFAULT_EDITORIAL_POSITION;
}
