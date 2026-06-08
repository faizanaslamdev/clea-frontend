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
  constants/            # Brand (clea.no), curated merchant IDs, search prompts
  domain/               # Business logic (no React)
    products/           # Search, comparison, path helpers
    stores/
    format.ts
  api/                  # Backend fetch facades for React Query
  hooks/                # TanStack Query hooks
  query/                # Query client factory & cache keys
  services.ts           # Public barrel — import from here in app code
  types.ts
  utils.ts
```

## Data flow

1. **Backend API:** `lib/api/*` fetches catalog, products, and merchants from the Clea NestJS API.
2. **Domain:** `lib/domain/*` implements search resolution, price helpers, and store slug logic.
3. **Services barrel:** `lib/services.ts` re-exports the domain API for pages and components.
4. **Hooks:** Client sections use `lib/hooks/*` with TanStack Query (`lib/query/keys.ts`).
5. **UI:** Server pages may call `lib/services` directly; interactive sections use hooks.

Removed demo-era artifacts are documented in [`docs/archive/frontend-unused-exports-report.md`](./archive/frontend-unused-exports-report.md).

## Styling

- **Tokens:** `styles/tokens.css` — colors, radius, hero/deal semantics, Tailwind `@theme`.
- **Utilities:** `styles/utilities.css` — typography (`type-*`), layout (`section-*`), header/footer/hero.
- **Entry:** `app/globals.css` imports Tailwind + token files only.

Do not add hardcoded colors in components; extend tokens in `styles/tokens.css`.

## Conventions

- Import business logic from `@/lib/services`, not from `@/lib/domain/*` (unless extending domain).
- Import query keys from `@/lib/query/keys`, not from hook re-exports.
- Use `PageLayout` for pages that need header + footer.
- Use `section-container` / `section-shell` for page sections (defined in utilities).
- Query keys live in `lib/query/keys.ts`; stale times in `lib/query/client.ts`.
