import type { Product } from '@/lib/types';

/**
 * Round-robin merge so the carousel does not show long single-brand blocks.
 * Empty groups are skipped; order within each group is preserved.
 */
export function interleaveProductGroups(groups: Product[][]): Product[] {
  const queues = groups
    .map((group) => group.filter(Boolean))
    .filter((group) => group.length > 0)
    .map((group) => [...group]);

  const result: Product[] = [];
  let progressed = true;

  while (progressed) {
    progressed = false;
    for (const queue of queues) {
      const next = queue.shift();
      if (next) {
        result.push(next);
        progressed = true;
      }
    }
  }

  return result;
}

/** Drop duplicate product ids while preserving order. */
export function dedupeProductsById(products: Product[]): Product[] {
  const seen = new Set<string>();
  const result: Product[] = [];
  for (const product of products) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    result.push(product);
  }
  return result;
}
