export interface Store {
  // id: string;
  // name: string;
  // country: string;
  // logo?: string;
  // currency: string;
   id: string;
  name: string;
   country: string;
  currency: string;
  slug?: string;
  href?: string;
  coverImage: string;
  logo?: string;
  size?: "sm" | "md" | "lg";
}

export interface PricePoint {
  date: string;
  price: number;
  store: string;
}

export type ProductCategory = 'Fashion' | 'Beauty' | 'Accessories';

/** How confidently the same product is matched across stores */
export type MatchType = 'exact' | 'near' | 'similar';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  image: string;
  description: string;
  sku: string;
  matchType: MatchType;
  rating: number;
  reviewCount: number;
  prices: {
    [storeId: string]: number;
  };
  priceHistory: PricePoint[];
  inStock: {
    [storeId: string]: boolean;
  };
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  savingsPercent: number;
  trending: boolean;
  trendingScore: number;
}

export interface SearchResult {
  product: Product;
  relevance: number;
}

export interface ComparisonData {
  product: Product;
  stores: Store[];
}

export type PriceAIVerdict = 'good_deal' | 'fair' | 'above_average';
export type PriceAIRecommendation = 'buy_now' | 'wait';

export interface PriceAIInsights {
  verdict: PriceAIVerdict;
  verdictLabel: string;
  recommendation: PriceAIRecommendation;
  recommendationLabel: string;
  summary: string;
  insights: string[];
  comparedToAveragePercent: number;
}
