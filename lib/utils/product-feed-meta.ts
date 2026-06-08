export function buildProductImageGallery(
  primary: string | null | undefined,
  alternates: string[] | null | undefined,
  normalize: (url: string | null | undefined) => string | null,
): string[] {
  const seen = new Set<string>();
  const gallery: string[] = [];

  const add = (url: string | null | undefined) => {
    const normalized = normalize(url);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    gallery.push(normalized);
  };

  add(primary);
  for (const url of alternates ?? []) {
    add(url);
  }

  return gallery;
}
