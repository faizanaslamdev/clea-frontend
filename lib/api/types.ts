/** JSON shape from clea-backend Product entity (Awin feed / Postgres). */
export interface ApiProduct {
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
  price: string | number;
  old_price: string | number | null;
  currency: string;
  deep_link: string | null;
  merchant_name: string | null;
  merchant_id: string | null;
  ean: string | null;
  mpn: string | null;
  in_stock: boolean;
  last_updated: string;
  created_at: string;
}

export interface ApiProductListResponse {
  items: ApiProduct[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiMerchant {
  id: string;
  name: string;
  currency: string;
  productCount: number;
  coverImage: string | null;
}
