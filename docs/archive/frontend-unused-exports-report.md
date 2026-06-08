# Frontend unused exports — removal report

Generated during stabilization cleanup (behavior-preserving PR).  
Symbols below had **zero production imports** at time of removal.

---

## Deleted files

| File path | Exported symbol(s) | Reason for removal |
|-----------|-------------------|-------------------|
| `lib/data/dummy-data.ts` | `DUMMY_PRODUCTS`, `DUMMY_STORES`, and all demo catalog data | Static demo dataset from pre-API era; no imports anywhere in app |
| `lib/domain/products/filters.ts` | `filterByPriceRange`, `filterByRating`, `sortProducts` | Client-side filter helpers only re-exported via `lib/services.ts`; no page or component consumed them |
| `lib/domain/products/insights.ts` | `getPriceAIInsights` | Price AI insight builder never wired to UI; only barrel export |
| `scripts/write-pcs.mjs` | _(script)_ | Generated placeholder product-card page from dummy `getAllProducts()` / `getAllStores()` |
| `scripts/download-product-images.sh` | _(script)_ | Downloaded images for dummy catalog products |
| `scripts/install-root-product-images.sh` | _(script)_ | Installed dummy product images into `public/products/` |

---

## Removed from `lib/hooks/useProducts.tsx`

| Exported symbol | Reason for removal |
|----------------|-------------------|
| `useTrendingProducts` | Duplicate of `useFeaturedProducts` (same merchant carousel data); no callers |
| `useSearchResults` | Search UI uses `resolveProductSearch` via chat view, not this hook |
| `useProductComparison` | Comparison UI not mounted; hook had no callers |
| `usePriceChartData` | Price chart UI not mounted; hook had no callers |
| `productKeys` re-export (F12) | Consumers import keys from `@/lib/query/keys` directly |

---

## Removed from `lib/hooks/useStores.tsx`

| Exported symbol | Reason for removal |
|----------------|-------------------|
| `storeKeys` re-export (F12) | No external imports; hooks use keys from `@/lib/query/keys` |

---

## Removed from `lib/api/products.ts`

| Exported symbol | Reason for removal |
|----------------|-------------------|
| `fetchProductsFromApi` | Raw `/products` listing unused; all listings use `fetchCatalogFromApi` (`/catalog`) |
| `fetchTrendingProducts` | Alias of `fetchFeaturedProducts`; merged into featured path (F7) |
| `fetchSearchResultItems` | Only consumed by removed `useSearchResults` hook |

---

## Removed from `lib/query/keys.ts`

| Exported symbol | Reason for removal |
|----------------|-------------------|
| `productKeys.trending` | Merged with `productKeys.featured` (F7) |
| `productKeys.search` | Only used by removed `useSearchResults` |
| `productKeys.comparison` | Only used by removed `useProductComparison` |
| `productKeys.chart` | Only used by removed `usePriceChartData` |

---

## Deleted module: `lib/domain/products/catalog.ts`

| Exported symbol | Reason for removal |
|----------------|-------------------|
| `BrandListingResult` | Type only used by removed catalog helpers |
| `getAllProducts` | No callers; listings use infinite catalog hook + API |
| `getProductById` | No callers via services; product detail uses `fetchProductById` in hooks |
| `getTrendingProducts` | Wrapper around removed trending API alias |
| `getHomeFeaturedProducts` | No callers; home uses `useFeaturedProducts` |
| `getProductsByCategory` | No callers |
| `resolveBrandProducts` | No callers; brand pages use catalog infinite query |
| `getProductsByStoreId` | No callers |
| `getSimilarProducts` | No callers; similar products use `useSimilarProducts` → API directly |

---

## Trimmed: `lib/domain/products/paths.ts`

| Removed symbol | Reason for removal |
|---------------|-------------------|
| `getProductHref` | No imports; product links use modal + brand routes |
| `getProductHrefFromProduct` | No imports |

**Kept:** `resolveStoreIdForProduct` — used by `product-detail-modal.tsx`

---

## Trimmed: `lib/domain/products/search.ts`

| Removed symbol | Reason for removal |
|---------------|-------------------|
| `searchProducts` | Thin wrapper; search chat calls `resolveProductSearch` directly |

**Kept:** `resolveProductSearch`, `ProductSearchResponse`

---

## Trimmed: `lib/domain/products/comparison.ts`

| Removed symbol | Reason for removal |
|---------------|-------------------|
| `getProductComparison` | Only used by removed hook / services barrel |
| `getPriceChartData` | Only used by removed hook / services barrel |
| `getMatchTypeLabel` | No UI consumers |

**Kept:** `getLowestPriceStore` — used by `product-card.tsx`

---

## Trimmed: `lib/services.ts` (removed re-exports)

| Removed symbol | Reason for removal |
|---------------|-------------------|
| `getAllProducts`, `getProductById`, `getTrendingProducts`, `getHomeFeaturedProducts`, `getProductsByCategory`, `getSimilarProducts`, `getProductsByStoreId`, `resolveBrandProducts`, `BrandListingResult` | Catalog module deleted |
| `searchProducts` | Removed from search domain |
| `filterByPriceRange`, `filterByRating`, `sortProducts` | Filters module deleted |
| `getProductComparison`, `getPriceChartData`, `getMatchTypeLabel` | Comparison helpers trimmed |
| `getPriceAIInsights` | Insights module deleted |
| `getStoreById`, `getStoreBySlug`, `getAllStores`, `getFeaturedStores` | Store data fetched via React Query hooks, not services barrel |
| `buildBrandVisitLink`, `BrandVisitLink`, `BrandVisitLinkOptions` | Imported directly from domain in `useBrandVisitLink` |
| `formatDateShort` | Only used by removed `getPriceChartData` |

**Kept re-exports:** `formatPrice`, `getLowestPriceStore`, `resolveProductSearch`, `ProductSearchResponse`, `resolveStoreFromRouteParam`, `getBrandSlug`, `getBrandHref`, `searchStores`, `resolveStoreIdForProduct`

---

## Component cleanup

| File path | Removed symbol | Reason for removal |
|-----------|---------------|-------------------|
| `components/product-carousel.tsx` | `isAtStart` state + `setIsAtStart` | State updated on scroll but never read in render or imperative handle |

---

## Intentionally excluded from this cleanup

- F11 — hero `category` URL param (per approval)
- FR1–FR8 — risky frontend items
- BR1–BR7 — risky backend items
