# AI Chat Phase B2 — Frontend Validation

**PR:** PR-B2 (Frontend)  
**Date:** 2026-06-09  
**Backend:** B2.0 anchor retrieval on `localhost:3000` (see `clea-backend/docs/AI-CHAT-ANCHOR-REGRESSION-SUITE.md`)  
**Frontend:** `localhost:3001`

---

## Build result

```
npm run build
✓ Compiled successfully
✓ TypeScript — no errors
✓ 13 static routes generated
```

---

## Summary

PR-B2 wires anchor-based chat flows end-to-end in the frontend:

- `context.productId` sent on anchor turns
- `anchorProductId` mapped from `POST /chat/turn` responses
- **Vis lignende** / **Finn billigere** on chat product cards and `ProductDetailModal`
- Suggestion chips pass `productId` when an anchor is active; anchor-dependent chips hidden otherwise
- Load More hidden for `similar_products` and `cheaper_alternatives`
- `product_search` pagination unchanged

---

## Live UI validation (Playwright)

| Scenario | Result | Evidence |
|----------|--------|----------|
| Similar from product card | **PASS** | Card action → user msg `Vis lignende produkter` → reply with 8/20 Nike similar → no Load More |
| Similar from modal | **PASS** | Modal `Chat-handlinger` → modal closes → similar turn appended |
| Cheaper from product card | **PASS** | `Finn billigere` on card → honest cheaper reply, 8 products |
| Cheaper from modal | **PASS** | Same buttons in modal (bridge to chat provider) |
| Chip with anchor | **PASS** | After similar turn, `Finn billigere alternativer` chip → cheaper turn with `productId` |
| Chip without anchor | **PASS** | Fresh `product_search` load — no `Forslag` chips when `activeProductId` unset |
| Chip after card focus | **PASS** | Opening product card sets anchor → `Vis billigere alternativer` chip appears |
| Load More — product_search | **PASS** | `Vis flere produkter` visible on 12/13 Nike search |
| Load More — similar/cheaper | **PASS** | Absent on similar (8/20) and cheaper (8/32) turns |
| Refresh — anchor turn | **PASS** | `?q=Vis+lignende+produkter` + `sessionStorage` anchor → similar reloads correctly |
| Mobile (390×844) | **PASS** | `Chat-handlinger` always visible on cards; 2-column grid; actions tappable |

**Test anchor product:** Nike Air Force 1 `6085790a-490d-418e-839f-9bfc083256c8` @ 1499 kr

---

## Contract compatibility

| Wire field | Frontend handling |
|------------|-------------------|
| `context.productId` | Sent via `runAnchorAction`, chips, refresh restore |
| `anchorProductId` | Mapped in `fetchChatTurn` → `SearchChatMessage.anchorProductId` |
| `intent: similar_products` | Rendered; Load More suppressed |
| `intent: cheaper_alternatives` | Rendered; Load More suppressed |
| `hasMore: false` | Honored; no button for anchor intents |
| `limit: 8` | Displayed as `Viser 8 av N` |
| `suggestions` | Filtered via `filterSuggestionsForAnchor()` |
| `product_search` pagination | Unchanged (`context.catalog.offset`) |

No API contract changes. No backend changes in this PR.

---

## Example flows (manual curl equivalent)

### Similar from card

```
POST /chat/turn
{ "message": "Vis lignende produkter", "context": { "productId": "6085790a-..." } }
→ intent: similar_products, anchorProductId set, 8 products, hasMore: false
```

### Cheaper from chip (after similar)

```
POST /chat/turn
{ "message": "Finn billigere alternativer", "context": { "productId": "6085790a-..." } }
→ intent: cheaper_alternatives, prices all < 1499
```

---

## Files changed

```
lib/api/chat.ts, chat-types.ts
lib/chat/anchor-actions.ts, chat-anchor-bridge.ts
components/chat/chat-anchor-provider.tsx
components/search/search-chat-view.tsx, search-chat-thread.tsx
components/product-card.tsx, product-grid.tsx
components/product/product-detail-modal.tsx
styles/utilities.css
```

---

## Known limitations (acceptable for B2)

1. **Refresh without sessionStorage** — plain `?q=Vis+lignende+produkter` without stored anchor loses `productId` (backend may clarify). Mitigated by `clea-chat-anchor` session key on anchor turns.
2. **Cheaper result quality** — backend surfaces brand/category matches at lower price (often accessories); frontend displays backend results faithfully with honest copy.
3. **Modal similar grid** — local `useSimilarProducts` section unchanged; anchor actions on main modal body only.

---

## GO / NO-GO for PR-B3 audit

### **GO**

Frontend correctly integrates Phase B backend:

- All required entry points wired (card, modal, chips)
- Pagination rules enforced
- Contract fields mapped
- Build passes
- Live flows verified against real catalog

PR-B3 should run full E2E quality audit (similar/cheaper relevance, mobile UX polish, accessibility review of new action buttons).

---

## Phase B UX polish (follow-up)

**Date:** 2026-06-09  
**Scope:** Frontend only — no API contract changes

### New Chat

- **Ny chat** plus button beside the bottom composer (circular, send-button scale; input width unchanged at `--chat-composer-width`).
- On click: clears messages, `activeProductId`, `clea-chat-anchor`, draft, loading state; removes all URL query params (`router.replace('/chat')`); returns to `SearchLanding`.
- **`sessionId`:** regenerated via `resetChatSessionId()` so each conversation starts a fresh server session (recommended for future rate-limit boundaries).

### Anchor preview in user bubbles

For `Vis lignende produkter` and `Finn billigere alternativer` user messages:

- Compact preview: product image, title, action label.
- Preview snapshot passed from product card/modal; persisted in `clea-chat-anchor` for refresh restore.
- Plain search messages unchanged.

### Stale anchor cleanup

- `runTurn()` without `context.productId` clears `activeProductId` and `clea-chat-anchor` (unchanged).
- **`reconcileAnchorSessionForMessage()`** clears stored anchor when `?q=` does not match the saved anchor message (refresh / manual URL edits).
- Initial URL load sets `activeProductId` to `null` when no matching anchor session exists.

### Tests

```
npm test
✓ 19 tests (anchor-turn-state, anchor-preview, chat-messages, chat-reset)
```
