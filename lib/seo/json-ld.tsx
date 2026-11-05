import { BRAND, BRAND_ICONS, BRAND_SOCIAL } from '@/lib/constants/brand';

type JsonLdValue = Record<string, unknown>;

/** Renders schema.org data for search engines. `<` is escaped so text can't close the tag. */
export function JsonLd({ data }: { data: JsonLdValue | JsonLdValue[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

const ORGANIZATION_ID = `${BRAND.siteUrl}/#organization`;

export function organizationJsonLd(): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: BRAND.name,
    url: BRAND.siteUrl,
    logo: `${BRAND.siteUrl}${BRAND_ICONS.png512}`,
    description: BRAND.description,
    sameAs: BRAND_SOCIAL.map((social) => social.href),
  };
}

export function websiteJsonLd(): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BRAND.siteUrl}/#website`,
    name: BRAND.name,
    url: BRAND.siteUrl,
    inLanguage: 'nb-NO',
    publisher: { '@id': ORGANIZATION_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BRAND.siteUrl}/sok?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export interface ProductJsonLdOffer {
  price: number;
  currency: string;
  inStock: boolean;
  storeName?: string | null;
}

export function productJsonLd(input: {
  url: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  images: string[];
  sku?: string | null;
  colour?: string | null;
  offers: ProductJsonLdOffer[];
}): JsonLdValue | null {
  const offers = input.offers.filter(
    (offer) => Number.isFinite(offer.price) && offer.price > 0,
  );
  if (offers.length === 0) return null;

  const availability = (inStock: boolean) =>
    inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  const currency = offers[0].currency || 'NOK';
  const prices = offers.map((offer) => offer.price);

  const offerData =
    offers.length === 1
      ? {
          '@type': 'Offer',
          url: input.url,
          price: offers[0].price.toFixed(2),
          priceCurrency: currency,
          availability: availability(offers[0].inStock),
          ...(offers[0].storeName
            ? { seller: { '@type': 'Organization', name: offers[0].storeName } }
            : {}),
        }
      : {
          '@type': 'AggregateOffer',
          url: input.url,
          lowPrice: Math.min(...prices).toFixed(2),
          highPrice: Math.max(...prices).toFixed(2),
          priceCurrency: currency,
          offerCount: offers.length,
          availability: availability(offers.some((offer) => offer.inStock)),
        };

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    url: input.url,
    image: input.images.slice(0, 5),
    ...(input.description ? { description: input.description } : {}),
    ...(input.brand ? { brand: { '@type': 'Brand', name: input.brand } } : {}),
    ...(input.sku ? { sku: input.sku } : {}),
    ...(input.colour ? { color: input.colour } : {}),
    offers: offerData,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BRAND.siteUrl}${item.path}`,
    })),
  };
}
