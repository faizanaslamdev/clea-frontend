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
  | 'underwear'
  | 'socks'
  | 'legwear'
  | 'gloves'
  | 'bags'
  | 'sleeping_bags'
  | 'makeup'
  | 'fragrance'
  | 'skincare'
  | 'beauty'
  | 'watches'
  | 'accessories';

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

export interface ProductReferenceSnapshot {
  productId: string;
  name: string;
  image: string;
  brand?: string;
  price?: number;
  currency?: string;
  merchantId?: string;
  merchantName?: string;
  unavailable?: boolean;
}

export interface ChatTurnContext {
  productId?: string;
  productReference?: ProductReferenceSnapshot;
  catalog?: CatalogQuery;
  intent?: ChatIntent;
  shopCategory?: ShopCategory;
  /** Favourite brands, budgets and sizes (style profile add-on). */
  styleProfile?: import('@/lib/style-profile/style-profile').StyleProfile;
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
  sections?: ChatResultSectionWire[];
  total?: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
  catalogQuery?: CatalogQuery;
  anchorProductId?: string;
  productReference?: ProductReferenceSnapshot;
  /** The user turn was a photo search: what Clea saw and the note typed with it. */
  photoSearch?: { summary: string; note?: string };
  suggestions?: string[];
  turnSeq?: number;
  degraded?: boolean;
}

export interface RestoreConversationResponse {
  conversationId: string;
  locale: 'nb' | 'en';
  shopCategory?: ShopCategory;
  anchorProductId?: string;
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

/** One group of products in a multi-item answer ("Kjole", "Sko"). */
export interface ChatResultSectionWire {
  title: string;
  query: string;
  products: ChatProductCard[];
  total: number;
  catalogQuery?: CatalogQuery;
}

export interface ChatResultSection {
  title: string;
  query: string;
  products: import('@/lib/types').Product[];
  total: number;
  catalogQuery?: CatalogQuery;
}

export interface ChatTurnResponse {
  reply: string;
  intent: ChatIntent;
  products: ChatProductCard[];
  /** Present when the answer has several product groups (outfit, multi-item). */
  sections?: ChatResultSectionWire[];
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

/** What Clea read from a photo (POST /chat/photo). */
export interface PhotoDescription {
  summary: string;
  items: { label: string; query: string }[];
}

/** POST /chat/photo: a photo instead of a typed message. */
export interface PhotoTurnRequest {
  /** `data:image/jpeg;base64,…`, already resized in the browser. */
  image: string;
  note?: string;
  conversationId: string;
  anonymousToken: string;
  clientTurnId: string;
  locale?: 'nb' | 'en';
  sessionId?: string;
  shopCategory?: ShopCategory;
  styleProfile?: import('@/lib/style-profile/style-profile').StyleProfile;
}

export interface ChatTurnResult {
  /** Set on a photo search turn. */
  photo?: PhotoDescription;
  reply: string;
  intent: ChatIntent;
  products: import('@/lib/types').Product[];
  sections?: ChatResultSection[];
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
