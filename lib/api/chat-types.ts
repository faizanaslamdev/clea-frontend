export type ChatIntent =
  | 'product_search'
  | 'similar_products'
  | 'cheaper_alternatives'
  | 'brand_recommendation'
  | 'recommendations'
  | 'clarify';

export type ProductSegment = 'fashion' | 'all';

export type ShopCategory = 'mens' | 'womens';

export type CatalogFilterMode = 'hard' | 'soft';

export type SuitableFor = 'male' | 'female' | 'unisex';

export type ProductFamily =
  | 'footwear'
  | 'outerwear'
  | 'knitwear'
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'socks'
  | 'legwear'
  | 'gloves'
  | 'bags'
  | 'sleeping_bags';

export interface CatalogQuery {
  q?: string;
  brand?: string;
  brandValues?: string[];
  brandQueryLocked?: boolean;
  category?: string;
  merchantId?: string;
  minPrice?: number;
  maxPrice?: number;
  segment?: ProductSegment;
  suitableFor?: SuitableFor;
  colour?: string;
  productFamily?: ProductFamily;
  pathPrefix?: string;
  ontologyCategoryIds?: string[];
  genderFilterMode?: CatalogFilterMode;
  familyFilterMode?: CatalogFilterMode;
  ontologyFilterMode?: CatalogFilterMode;
  offset?: number;
}

export interface ChatTurnContext {
  productId?: string;
  catalog?: CatalogQuery;
  intent?: ChatIntent;
  shopCategory?: ShopCategory;
}

export interface ChatSuggestionsResponse {
  suggestions: string[];
  locale: 'nb' | 'en';
  shopCategory?: ShopCategory;
}

export interface ChatTurnRequest {
  message: string;
  context?: ChatTurnContext;
  sessionId?: string;
  locale?: 'nb' | 'en';
  conversationId?: string;
  anonymousToken?: string;
  clientTurnId?: string;
}

export interface CreateConversationRequest {
  locale?: 'nb' | 'en';
  shopCategory?: ShopCategory;
}

export interface CreateConversationResponse {
  conversationId: string;
  anonymousToken: string;
  locale: 'nb' | 'en';
  shopCategory?: ShopCategory;
}

export interface RestoreConversationTurn {
  seq: number;
  role: 'user' | 'assistant';
  message: string;
  clientTurnId?: string;
  reply?: string;
  intent?: ChatIntent;
  products?: ChatProductCard[];
  total?: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
  catalogQuery?: CatalogQuery;
  anchorProductId?: string;
  suggestions?: string[];
  turnSeq?: number;
  degraded?: boolean;
}

export interface RestoreConversationResponse {
  conversationId: string;
  locale: 'nb' | 'en';
  shopCategory?: ShopCategory;
  activeSearchIntent: Record<string, unknown>;
  pendingClarifySlots: string[] | null;
  lastCatalogQuery?: CatalogQuery;
  turns: RestoreConversationTurn[];
  hasMoreCatalog: boolean;
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
  conversationId?: string;
  turnSeq?: number;
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
