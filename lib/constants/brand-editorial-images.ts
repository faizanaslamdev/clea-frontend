const EDITORIAL_IMAGES = {
  women: '/brands/editorial/01.webp',
  men: '/brands/editorial/02.webp',
  accessories: '/brands/editorial/03.webp',
  outdoor: '/brands/editorial/04.webp',
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
  index: number,
): string {
  const name = brandName.trim().toLowerCase();

  if (/nly\s?man|mens?|herre/.test(name)) {
    return EDITORIAL_IMAGES.men;
  }
  if (/nelly/.test(name)) {
    return EDITORIAL_IMAGES.women;
  }
  if (/outnorth|viking|sport|outdoor|footwear/.test(name)) {
    return EDITORIAL_IMAGES.outdoor;
  }
  if (/journey|bag|accessor|shoe|sko/.test(name)) {
    return EDITORIAL_IMAGES.accessories;
  }

  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}
