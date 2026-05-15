import { products, stores } from './dummy-data';
import {
  MatchType,
  PriceAIInsights,
  Product,
  SearchResult,
  Store,
} from './types';

export const getAllProducts = (): Product[] => {
  return products;
};

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const getTrendingProducts = (limit: number = 6): Product[] => {
  return products
    .filter((p) => p.trending)
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit);
};

export const searchProducts = (query: string): SearchResult[] => {
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
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter((p) => p.category === category);
};

export const getLowestPriceStore = (
  product: Product
): { store: Store; price: number } | null => {
  let lowestStore: Store | null = null;
  let lowestPrice = Infinity;

  Object.entries(product.prices).forEach(([storeId, price]) => {
    if (product.inStock[storeId] && price < lowestPrice) {
      lowestPrice = price;
      lowestStore = stores.find((s) => s.id === storeId) || null;
    }
  });

  return lowestStore ? { store: lowestStore, price: lowestPrice } : null;
};

export const getStoreById = (id: string): Store | undefined => {
  return stores.find((s) => s.id === id);
};

export const getAllStores = (): Store[] => {
  return stores;
};

export const getProductComparison = (productId: string) => {
  const product = getProductById(productId);
  if (!product) return null;

  const comparison = stores.map((store) => ({
    store,
    price: product.prices[store.id] || null,
    inStock: product.inStock[store.id] || false,
  }));

  return { product, comparison };
};

export const getPriceChartData = (
  productId: string,
  days: 7 | 15 | 30 = 30
) => {
  const product = getProductById(productId);
  if (!product) return null;

  const slice = product.priceHistory.slice(-days);

  return slice.map((point) => ({
    date: formatDateShort(point.date),
    fullDate: point.date,
    price: point.price,
    store: point.store,
  }));
};

export const getMatchTypeLabel = (matchType: MatchType): string => {
  switch (matchType) {
    case 'exact':
      return 'Exact match — same SKU across stores';
    case 'near':
      return 'Near match — same brand & model family';
    case 'similar':
      return 'Similar alternative — comparable product';
    default:
      return '';
  }
};

export const getPriceAIInsights = (product: Product): PriceAIInsights => {
  const history = product.priceHistory;
  const last7 = history.slice(-7).map((p) => p.price);
  const last30 = history.map((p) => p.price);
  const avg7 = last7.reduce((a, b) => a + b, 0) / last7.length;
  const avg30 = last30.reduce((a, b) => a + b, 0) / last30.length;
  const current = product.lowestPrice;
  const comparedToAveragePercent = Math.round(
    ((current - avg30) / avg30) * 100
  );
  const trend7 =
    last7.length >= 2 ? last7[last7.length - 1] - last7[0] : 0;
  const lowestStore = getLowestPriceStore(product);

  let verdict: PriceAIInsights['verdict'] = 'fair';
  let verdictLabel = 'Fair price';
  if (comparedToAveragePercent <= -5) {
    verdict = 'good_deal';
    verdictLabel = 'Below 30-day average';
  } else if (comparedToAveragePercent >= 8) {
    verdict = 'above_average';
    verdictLabel = 'Above recent average';
  }

  let recommendation: PriceAIInsights['recommendation'] = 'buy_now';
  let recommendationLabel = 'Buy now';
  if (trend7 > 0 && comparedToAveragePercent > 3) {
    recommendation = 'wait';
    recommendationLabel = 'Consider waiting';
  } else if (verdict === 'good_deal' && trend7 <= 0) {
    recommendation = 'buy_now';
    recommendationLabel = 'Good time to buy';
  }

  const insights: string[] = [
    `Current lowest price is ${formatPrice(current)} — ${Math.abs(comparedToAveragePercent)}% ${comparedToAveragePercent <= 0 ? 'below' : 'above'} the 30-day tracked average (${formatPrice(Math.round(avg30))}).`,
    `7-day average: ${formatPrice(Math.round(avg7))}. Price trend over the last week: ${trend7 < 0 ? 'falling' : trend7 > 0 ? 'rising' : 'stable'}.`,
  ];

  if (lowestStore) {
    insights.push(
      `Best deal right now at ${lowestStore.store.name} (${formatPrice(lowestStore.price)}).`
    );
  }

  if (product.savingsPercent >= 15) {
    insights.push(
      `You can save up to ${product.savingsPercent}% vs the highest listed store price.`
    );
  }

  const summary =
    recommendation === 'buy_now'
      ? verdict === 'good_deal'
        ? 'Based on collected price history, this is one of the better prices we have seen recently.'
        : 'Current pricing is in line with recent trends. If you need it now, buying is reasonable.'
      : 'Prices have been trending up recently. Waiting may yield a better deal if history repeats.';

  return {
    verdict,
    verdictLabel,
    recommendation,
    recommendationLabel,
    summary,
    insights,
    comparedToAveragePercent,
  };
};

export const getSimilarProducts = (productId: string, limit: number = 4) => {
  const product = getProductById(productId);
  if (!product) return [];

  return products
    .filter((p) => p.id !== productId && p.category === product.category)
    .slice(0, limit);
};

// Helper functions
const calculateRelevance = (product: Product, query: string): number => {
  let score = 0;

  if (product.name.toLowerCase().startsWith(query)) score += 3;
  else if (product.name.toLowerCase().includes(query)) score += 2;

  if (product.brand.toLowerCase() === query) score += 2;
  else if (product.brand.toLowerCase().includes(query)) score += 1;

  if (product.category.toLowerCase() === query) score += 1;

  return score;
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatPrice = (price: number): string => {
  return price.toLocaleString('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
  });
};

export const filterByPriceRange = (
  products: Product[],
  minPrice: number,
  maxPrice: number
): Product[] => {
  return products.filter(
    (p) => p.lowestPrice >= minPrice && p.lowestPrice <= maxPrice
  );
};

export const filterByRating = (
  products: Product[],
  minRating: number
): Product[] => {
  return products.filter((p) => p.rating >= minRating);
};

export const sortProducts = (
  products: Product[],
  sortBy: 'price-asc' | 'price-desc' | 'rating' | 'trending'
): Product[] => {
  const sorted = [...products];

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
};
