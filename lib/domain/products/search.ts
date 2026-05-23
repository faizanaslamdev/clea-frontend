import { products } from '@/lib/data/dummy-data';
import type { Product, SearchResult } from '@/lib/types';

function calculateRelevance(product: Product, query: string): number {
  let score = 0;

  if (product.name.toLowerCase().startsWith(query)) score += 3;
  else if (product.name.toLowerCase().includes(query)) score += 2;

  if (product.brand.toLowerCase() === query) score += 2;
  else if (product.brand.toLowerCase().includes(query)) score += 1;

  if (product.category.toLowerCase() === query) score += 1;

  return score;
}

export function searchProducts(query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase();

  return products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.brand.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
    )
    .map((product) => ({
      product,
      relevance: calculateRelevance(product, lowerQuery),
    }))
    .sort((a, b) => b.relevance - a.relevance);
}
