# Architecture

Production-oriented layout for [Clea](https://clea.no). UI behavior is unchanged; concerns are separated for long-term maintenance.

## Directory map

```
app/                    # Next.js App Router pages & global styles entry
styles/                 # Design tokens + layout/typography utilities
components/
  layout/               # PageLayout and other shell primitives
  shared/               # Cross-feature UI (loading, empty states)
  ui/                   # shadcn/ui primitives
  stores/               # Store showcase feature
  …                     # Feature components (product, search, hero, etc.)
lib/
  constants/            # Brand (clea.no), curated IDs, search prompts
  data/                 # Static demo dataset (swap for API later)
  domain/               # Business logic (no React)
    products/           # Catalog, search, filters, comparison, insights
    stores/
    format.ts
  api/                  # Async facades for React Query
  hooks/                # TanStack Query hooks
  query/                # Query client factory & cache keys
  services.ts           # Public barrel — import from here in app code
  types.ts
  utils.ts
```

## Data flow

1. **Static demo:** `lib/data/dummy-data.ts` holds products and stores.
2. **Domain:** `lib/domain/*` implements queries, search, Clea insights, formatting.
3. **Services barrel:** `lib/services.ts` re-exports the domain API for pages and components.
4. **API layer:** `lib/api/*` wraps services in async functions for hooks.
5. **UI:** Server pages call `lib/services` directly; client sections use `lib/hooks/*`.

To plug in a real backend, replace `lib/api/*` implementations (or add `fetch` calls in domain) without changing component props.

## Styling

- **Tokens:** `styles/tokens.css` — colors, radius, hero/deal semantics, Tailwind `@theme`.
- **Utilities:** `styles/utilities.css` — typography (`type-*`), layout (`section-*`), header/footer/hero.
- **Entry:** `app/globals.css` imports Tailwind + token files only.

Do not add hardcoded colors in components; extend tokens in `styles/tokens.css`.

## Conventions

- Import business logic from `@/lib/services`, not from `@/lib/domain/*` (unless extending domain).
- Use `PageLayout` for pages that need header + footer.
- Use `section-container` / `section-shell` for page sections (defined in utilities).
- Query keys live in `lib/query/keys.ts`; stale times in `lib/query/client.ts`.
