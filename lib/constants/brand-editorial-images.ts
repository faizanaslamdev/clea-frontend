const EDITORIAL_IMAGES = {
  dbJourney: '/brands/editorial/db-journey.webp',
  nelly: '/brands/editorial/nelly.webp',
  nlyMan: '/brands/editorial/nly-man.webp',
  outnorth: '/brands/editorial/outnorth.webp',
  viking: '/brands/editorial/viking.webp',
  ralphLauren: '/brands/editorial/ralph-lauren.webp',
} as const;

/**
 * Approved brand imagery supplied for the `/brands` editorial grid and hero.
 * Unknown brands fall back to their live affiliate-feed product image.
 */
export function getBrandEditorialImage(
  brandName: string,
): string | null {
  const name = brandName.trim().toLowerCase();

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

  return null;
}
