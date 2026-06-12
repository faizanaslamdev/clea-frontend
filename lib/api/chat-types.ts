export type ChatIntent =
  | 'product_search'
  | 'similar_products'
  | 'cheaper_alternatives'
  | 'brand_recommendation'
  | 'recommendations'
  | 'clarify';

export type ProductSegment = 'fashion' | 'all';

export type ShopCategory = 'mens' | 'womens';

export interface CatalogQuery {
  q?: string;
  brand?: string;
  category?: string;
  merchantId?: string;
  minPrice?: number;
  maxPrice?: number;
  segment?: ProductSegment;
  offset?: number;
}

export interface ChatTurnContext {
  productId?: string;
  catalog?: CatalogQuery;
  intent?: ChatIntent;
  shopCategory?: ShopCategory;
}

export interface ChatTurnRequest {
  message: string;
  context?: ChatTurnContext;
  sessionId?: string;
  locale?: 'nb' | 'en';
}

/** Wire shape from POST /chat/turn products[] */
export interface ChatProductCard {
  id: string;
  aw_product_id: string;
  merchant_product_id: string | null;
  name: string;
  brand: string | null;
  description: string | null;
  image_url: string | null;
  category: string | null;
  category_path: string | null;
  colour: string | null;
  size: string | null;
  suitable_for: string | null;
  product_type: string | null;
  condition: string | null;
  brand_id: string | null;
  data_feed_id: string | null;
  is_for_sale: boolean | null;
  alternate_images: string[] | null;
  price: number;
  old_price: number | null;
  currency: string;
  deep_link: string | null;
  merchant_name: string | null;
  merchant_id: string | null;
  ean: string | null;
  mpn: string | null;
  in_stock: boolean;
  last_updated: string;
  created_at: string;
  on_sale: boolean;
  relevance_score?: number;
}

export interface ChatTurnResponse {
  reply: string;
  intent: ChatIntent;
  products: ChatProductCard[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  catalogQuery?: CatalogQuery;
  anchorProductId?: string;
  suggestions?: string[];
  meta?: {
    usedFallback: boolean;
    degraded?: boolean;
    latencyMs: number;
  };
}

export interface ChatTurnResult {
  reply: string;
  intent: ChatIntent;
  products: import('@/lib/types').Product[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  catalogQuery?: CatalogQuery;
  anchorProductId?: string;
  suggestions?: string[];
  usedFallback: boolean;
  degraded?: boolean;
}
