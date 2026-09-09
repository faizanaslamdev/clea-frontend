// Single source of truth for merchant/CDN image hostnames Clea currently
// serves product photos from. Used by next.config.mjs's `images.remotePatterns`
// -- this is what tells Next's built-in /_next/image optimizer which remote
// hosts it's allowed to fetch and resize. We use Next's default loader (see
// next.config.mjs for why a custom loader doesn't work for this), so this
// list has to include every host we actually serve product photos from.
//
// Compiled from a live query of every merchant currently in the catalog
// (GET /merchants, then GET /products?merchant_id=... sampled across each
// merchant's full offset range) on 2026-09-08, not from the static
// feed.csv snapshot -- that snapshot was confirmed missing at least one
// live, sizable host (vikingfootwear.centracdn.net, ~9k products), which
// is what made next/image 500 the last time optimization was turned on.
//
// A merchant onboarded after this list was compiled and NOT added here will
// fail to optimize: in dev, next/image throws a loud, visible error for
// that image (easy to spot and fix by adding the host below); in prod it's
// a single broken photo (400 from /_next/image), not a page crash. Re-run
// the same query against /merchants + /products to refresh this list as
// new merchants are added.
export const IMAGE_HOSTS = [
  'images.unsplash.com',
  'cdn.occtoo-media.com', // Nelly NO, NLY Man NO
  'images2.productserve.com',
  'cdn.shopify.com', // DB Journey NO, Papique NO
  'prod.fjellsport.no', // Outnorth NO
  'www.fjellsport.no', // Outnorth NO (both variants seen live)
  'assets.adidas.com', // adidas NO
  'ralphlauren.scene7.com', // Ralph Lauren NO
  'vikingfootwear.centracdn.net', // Viking Footwear
  'media.sephora.eu', // Sephora SE
  'media.urverket.no', // Urverket NO
  'media2.urverket.no', // Urverket NO
  'media3.urverket.no', // Urverket NO
];
