import type { Product } from '@/lib/types';

export function filterByPriceRange(
  productList: Product[],
  minPrice: number,
  maxPrice: number
): Product[] {
  return productList.filter(
    (p) => p.lowestPrice >= minPrice && p.lowestPrice <= maxPrice
  );
}

export function filterByRating(
  productList: Product[],
  minRating: number
): Product[] {
  return productList.filter((p) => p.rating >= minRating);
}

export function sortProducts(
  productList: Product[],
  sortBy: 'price-asc' | 'price-desc' | 'rating' | 'trending'
): Product[] {
  const sorted = [...productList];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.lowestPrice - b.lowestPrice);
    case 'price-desc':
      return sorted.sort((a, b) => b.lowestPrice - a.lowestPrice);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'trending':
      return sorted.sort((a, b) => b.trendingScore - a.trendingScore);
    default:
      return sorted;
  }
}
