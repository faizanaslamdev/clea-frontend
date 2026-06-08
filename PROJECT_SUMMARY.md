# Clea Frontend — Project Summary

## Overview

Next.js App Router frontend for [clea.no](https://clea.no) — Norwegian fashion price comparison. Product and merchant data comes from the Clea backend API (~100k Awin feed products).

## Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4 with design tokens
- **UI:** shadcn/ui components
- **Data:** TanStack Query + `lib/api/*` fetch layer
- **Language:** TypeScript

## Project structure

```
app/
├── page.tsx                 # Home — hero, featured carousel, brand grid
├── chat/page.tsx            # Chat-style product search
├── brands/                  # Merchant listing & brand detail pages
└── layout.tsx               # Root layout

components/
├── product-card.tsx         # Product card with lowest-price highlight
├── product-carousel.tsx     # Home trending carousel
├── trending-section.tsx     # Featured products section
├── search/                  # Chat search UI
└── brands/                  # Brand hero, cards, product grids

lib/
├── api/                     # Backend HTTP facades
├── domain/                  # Business logic (search, comparison, stores)
├── hooks/                   # React Query hooks
├── query/                   # Cache keys & client config
├── services.ts              # Public barrel for pages/components
└── constants/               # Featured merchant IDs, limits
```

## Key features

- **Home carousel** — featured products from NLY Man NO (`merchant_id=19567`)
- **Brand pages** — infinite catalog per merchant via `/catalog`
- **Chat search** — product discovery with relevance-ranked results
- **Product detail modal** — inline product view with similar products
- **Responsive layout** — mobile-first with design tokens

## Data flow

```
Backend API → lib/api/* → lib/hooks/* (React Query) → components
                      ↘ lib/domain/* → lib/services.ts → server pages
```

## Services barrel (active exports)

| Export | Used by |
|--------|---------|
| `formatPrice`, `getLowestPriceStore` | Product cards |
| `resolveStoreIdForProduct` | Product detail modal |
| `resolveProductSearch` | Chat search |
| `getBrandSlug`, `resolveStoreFromRouteParam` | Brand pages |
| `getBrandHref` | Brand cards |
| `searchStores` | Brands index |

## Documentation

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — layout and conventions
- [docs/archive/frontend-unused-exports-report.md](./docs/archive/frontend-unused-exports-report.md) — removed demo-era code

## Development

```bash
npm install
npm run dev      # http://localhost:3000 (requires backend)
npm run build
npm run lint
```

Set `NEXT_PUBLIC_API_URL` to point at the Clea backend (default local: `http://localhost:3000` API).
