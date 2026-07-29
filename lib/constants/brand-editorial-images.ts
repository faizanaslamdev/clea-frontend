const EDITORIAL_IMAGES = {
  women: '/brands/editorial/01.webp',
  men: '/brands/editorial/02.webp',
  accessories: '/brands/editorial/03.webp',
  outdoor: '/brands/editorial/04.webp',
  viking: '/brands/editorial/viking.webp',
  ralphLauren: '/brands/editorial/ralph-lauren.webp',
} as const;

const FALLBACK_IMAGES = [
  EDITORIAL_IMAGES.women,
  EDITORIAL_IMAGES.men,
  EDITORIAL_IMAGES.accessories,
  EDITORIAL_IMAGES.outdoor,
] as const;

/**
 * Curated, consistently sized imagery for the `/brands` editorial grid.
 * Product imagery remains live on the individual brand/product pages.
 */
export function getBrandEditorialImage(
  brandName: string,
): string {
  const name = brandName.trim().toLowerCase();

  if (/nly\s?man|mens?|herre/.test(name)) {
    return EDITORIAL_IMAGES.men;
  }
  if (/nelly/.test(name)) {
    return EDITORIAL_IMAGES.women;
  }
  if (/viking/.test(name)) {
    return EDITORIAL_IMAGES.viking;
  }
  if (/ralph\s+lauren/.test(name)) {
    return EDITORIAL_IMAGES.ralphLauren;
  }
  if (/outnorth|sport|outdoor|footwear/.test(name)) {
    return EDITORIAL_IMAGES.outdoor;
  }
  if (/journey|bag|accessor|shoe|sko/.test(name)) {
    return EDITORIAL_IMAGES.accessories;
  }

  const stableIndex = Array.from(name).reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
  return FALLBACK_IMAGES[stableIndex % FALLBACK_IMAGES.length];
}
