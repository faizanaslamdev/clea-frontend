'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import { AiSparkIcon } from '@/components/icons/ai-spark-icon';
import { cn } from '@/lib/utils';
import { navigateToChatEntry } from '@/lib/chat/chat-entry';
import { formatPrice, toDisplayCase } from '@/lib/domain/format';
import { useCategoryPreviews, useFeaturedProducts, useSimilarProducts } from '@/lib/hooks/useProducts';
import { useAllStores } from '@/lib/hooks/useStores';
import type { ProductFamily } from '@/lib/api/chat-types';
import type { CategoryPreview } from '@/lib/api/products';
import { fetchCatalogFromApi } from '@/lib/api/products';
import { TRENDING_DISPLAY_LIMIT } from '@/lib/constants/popular-brands';
import { STALE_TIME_STATIC_MS } from '@/lib/query/client';

type TabKey = 'explore' | 'chat' | 'save' | 'compare';

/** Utforsk: fashion-forward families only — accessories look sparse in the
 * vertical marquee and kill the "wow" of the panel. */
const EXPLORE_FAMILY_ORDER: readonly ProductFamily[] = [
  'dresses',
  'tops',
  'knitwear',
  'bottoms',
  'outerwear',
  'footwear',
  'bags',
];

/** Prefer lifestyle / fashion CDN shots over flat outdoor packshots. */
function exploreImageScore(src: string): number {
  const image = src.toLowerCase();
  let value = 0;
  if (image.includes('occtoo-media.com')) value += 6;
  if (image.includes('ralphlauren.scene7.com')) value += 6;
  if (image.includes('cdn.shopify.com')) value += 3;
  if (image.includes('nelly') || image.includes('hunkem')) value += 2;
  // Flat cutouts / outdoor catalog hosts read colder in the marquee.
  if (image.includes('outnorth')) value -= 3;
  if (image.includes('.png')) value -= 2;
  return value;
}

/**
 * Build three marquee columns of the strongest fashion photos we already
 * have on the homepage — category heroes first, then featured products —
 * sorted for visual punch so Utforsk feels curated, not random inventory.
 */
function buildExploreColumns(
  categories: readonly CategoryPreview[],
  featuredProducts: readonly { image: string }[],
): string[][] {
  const byFamily = new Map(categories.map((category) => [category.family, category]));
  const ordered = EXPLORE_FAMILY_ORDER.map((family) => byFamily.get(family)).filter(
    (category): category is CategoryPreview => Boolean(category),
  );

  const seen = new Set<string>();
  const pool: string[] = [];

  const pushUnique = (src: string | undefined) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    pool.push(src);
  };

  // Pass 1–2: best shots from hero fashion families (dresses/tops first).
  for (let rank = 0; rank < 2; rank += 1) {
    for (const category of ordered) {
      pushUnique(category.images[rank]);
    }
  }

  // Pass 3: featured/popular products that score as lifestyle photos.
  featuredProducts
    .map((product) => product.image)
    .filter(Boolean)
    .sort((a, b) => exploreImageScore(b) - exploreImageScore(a))
    .forEach((src) => pushUnique(src));

  // Final polish: keep the visually strongest frames first.
  pool.sort((a, b) => exploreImageScore(b) - exploreImageScore(a));

  // Cap so each column stays dense (~6–7 unique) without endless outdoor noise.
  const capped = pool.slice(0, 21);

  const columns: string[][] = [[], [], []];
  capped.forEach((src, index) => {
    columns[index % 3]!.push(src);
  });

  // Stagger start frames so all three columns don't show the same beat.
  if (columns[1]!.length > 1) {
    columns[1] = [...columns[1]!.slice(1), columns[1]![0]!];
  }
  if (columns[2]!.length > 2) {
    columns[2] = [...columns[2]!.slice(2), ...columns[2]!.slice(0, 2)];
  }

  return columns;
}

const TABS: readonly { key: TabKey; label: string }[] = [
  { key: 'explore', label: 'Utforsk' },
  { key: 'chat', label: 'Chat' },
  { key: 'save', label: 'Prisvarsel' },
  { key: 'compare', label: 'Sammenlign' },
];

const CHAT_EXAMPLE_QUERY =
  'Lette sandaler til ferie — gjerne under 800 kr';

/** Warm assistant reply shown in the Chat tab demo (not a live LLM turn). */
const CHAT_EXAMPLE_REPLY =
  'Her er noen sommerklare sandaler til deg — stilige, lette og fra flere butikker.';

/** Catalog lookup so Chat-tab product photos match the demo query. */
const CHAT_DEMO_PHOTO = {
  brand: 'nelly',
  q: 'sandal',
  limit: 4,
} as const;

/** Relative offsets for the small photos fanned around the Compare tab own
 * hero card -- studied from daydream.ing own Refine tab markup (screen
 * recorded and inspected): translate/rotate values scattering five photos
 * around a larger centered card. */
const COMPARE_FAN_POSITIONS: readonly { x: string; y: string; r: string }[] = [
  { x: '-150%', y: '-14%', r: '-13deg' },
  { x: '-100%', y: '24%', r: '-7deg' },
  { x: '110%', y: '-30%', r: '7deg' },
  { x: '130%', y: '40%', r: '9deg' },
  { x: '170%', y: '0%', r: '13deg' },
];

/** How long the skeleton holds before the real visual fades in -- matches
 * the beat observed on daydream.ing's own tab switch (screen-recorded and
 * frame-stepped: the right-hand copy swaps instantly, the left-hand visual
 * briefly shows a placeholder before the real content resolves in). */
const VISUAL_REVEAL_DELAY_MS = 260;

/** How long each tab stays active before auto-advancing to the next one.
 * daydream.ing's own tabs cycle on their own -- confirmed by screen-recording
 * the live site and watching the active tab change from Explore to Chat
 * while the cursor sat completely still, nowhere near the tab bar. A thin
 * bar (`.feature-tabs__tab-progress`) grows under the active tab the whole
 * time as a visual countdown, then the cycle moves to the next tab and
 * loops back to the first after the last. */
const AUTO_ADVANCE_MS = 7000;

/** The Chat visual reveals in three separate beats, none of them instant:
 * the tab activates on an empty visual, then the user query bubble fades
 * in on the right (like a message the user just sent), then the AI
 * response bubble fades in on the left, then the product photos --
 * matches how our own live chat page actually plays out a real search,
 * instead of dumping everything on screen the moment the tab switches. */
const CHAT_PROMPT_DELAY_MS = 750;
const CHAT_CAPTION_DELAY_MS = 1100;
const CHAT_PRODUCTS_DELAY_MS = 1950;

/** Sets the CSS custom property that staggers each item's entrance --
 * daydream.ing's own photo grid loads in one image at a time rather than
 * revealing all six at once (also confirmed frame-by-frame). */
const revealStyle = (index: number): CSSProperties => ({ '--reveal-index': index } as CSSProperties);

/**
 * Homepage tabbed feature showcase -- studied from daydream.ing's "Meet
 * Daydream" section (Explore / Chat / Save / Refine tabs). Every image and
 * number here comes from data already fetched elsewhere on the homepage --
 * nothing fabricated.
 */
export function FeatureTabsSection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('explore');
  const [visualLoaded, setVisualLoaded] = useState(true);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [chatStage, setChatStage] = useState<0 | 1 | 2 | 3>(0);
  const chatPromptTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatCaptionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatProductsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: categories = [] } = useCategoryPreviews();
  const { data: featuredProducts = [] } = useFeaturedProducts();
  const { data: stores = [] } = useAllStores();
  const { data: chatDemoProducts = [] } = useQuery({
    queryKey: ['products', 'feature-tabs-chat-demo', CHAT_DEMO_PHOTO],
    queryFn: async () => {
      const { products } = await fetchCatalogFromApi({
        brand: CHAT_DEMO_PHOTO.brand,
        q: CHAT_DEMO_PHOTO.q,
        limit: CHAT_DEMO_PHOTO.limit,
      });
      return products.filter((product) => Boolean(product.image)).slice(0, 4);
    },
    staleTime: STALE_TIME_STATIC_MS,
  });

  // Prefer a strong fashion hero (kjoler → topper → sko) so Sammenlign
  // fans real similar products around something shoppable, not a random
  // spare category packshot.
  const compareHeroCategory =
    categories.find((category) => category.family === 'dresses') ??
    categories.find((category) => category.family === 'tops') ??
    categories.find((category) => category.family === 'footwear') ??
    categories[0];
  const compareHeroId = compareHeroCategory?.productId ?? '';
  const { data: similarForCompare = [] } = useSimilarProducts(compareHeroId, 5);

  const goToTab = (next: TabKey) => {
    if (next === activeTab) return;
    setActiveTab(next);
    setVisualLoaded(false);
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    revealTimeoutRef.current = setTimeout(() => setVisualLoaded(true), VISUAL_REVEAL_DELAY_MS);
  };

  // Auto-advance: restarts every time the active tab changes, whether that
  // change came from a click below or from this same timer, so the cycle
  // continues indefinitely and always gives a manual click a fresh 7s.
  useEffect(() => {
    advanceTimeoutRef.current = setTimeout(() => {
      const currentIndex = TABS.findIndex((tab) => tab.key === activeTab);
      const next = TABS[(currentIndex + 1) % TABS.length];
      goToTab(next.key);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Chat tab reveal: nothing shows the instant the tab activates -- the
  // user query bubble fades in first (right side), then the AI response
  // bubble (left side), then the product photos, each on its own delay.
  // Resets and restarts every time the tab becomes active, whether from a
  // click or from the auto-advance cycle above.
  useEffect(() => {
    if (chatPromptTimeoutRef.current) clearTimeout(chatPromptTimeoutRef.current);
    if (chatCaptionTimeoutRef.current) clearTimeout(chatCaptionTimeoutRef.current);
    if (chatProductsTimeoutRef.current) clearTimeout(chatProductsTimeoutRef.current);
    setChatStage(0);
    if (activeTab === 'chat') {
      chatPromptTimeoutRef.current = setTimeout(() => setChatStage(1), CHAT_PROMPT_DELAY_MS);
      chatCaptionTimeoutRef.current = setTimeout(() => setChatStage(2), CHAT_CAPTION_DELAY_MS);
      chatProductsTimeoutRef.current = setTimeout(() => setChatStage(3), CHAT_PRODUCTS_DELAY_MS);
    }
    return () => {
      if (chatPromptTimeoutRef.current) clearTimeout(chatPromptTimeoutRef.current);
      if (chatCaptionTimeoutRef.current) clearTimeout(chatCaptionTimeoutRef.current);
      if (chatProductsTimeoutRef.current) clearTimeout(chatProductsTimeoutRef.current);
    };
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  // Three vertical photo columns for the Explore visual — curated fashion
  // heroes + strongest featured shots so the marquee feels premium.
  const exploreColumns = buildExploreColumns(categories, featuredProducts);

  // Same idea for products: the fetched pool is larger than what the
  // "Populært nå" carousel displays (TRENDING_DISPLAY_LIMIT) -- the tail is
  // reserved for here so Chat/Save previews don't repeat that carousel.
  const remainingFeaturedProducts = featuredProducts.slice(TRENDING_DISPLAY_LIMIT);
  const chatProducts =
    chatDemoProducts.length > 0
      ? chatDemoProducts
      : remainingFeaturedProducts.slice(0, 4);
  const chatStoreCount = new Set(
    chatProducts.map((product) => product.merchantName ?? product.brand),
  ).size;
  const chatReply =
    chatStoreCount > 1
      ? `Her er noen sommerklare sandaler til deg — stilige, lette og fra ${chatStoreCount} butikker.`
      : CHAT_EXAMPLE_REPLY;
  const priceDropProducts = remainingFeaturedProducts.filter(
    (product) => product.priceHistory.length > 1,
  );
  const compareHeroImage =
    compareHeroCategory?.images[0] ?? remainingFeaturedProducts[0]?.image;
  const compareFanPhotos = (() => {
    const fromSimilar = similarForCompare
      .map((product) => product.image)
      .filter((src): src is string => Boolean(src) && src !== compareHeroImage)
      .slice(0, COMPARE_FAN_POSITIONS.length);
    if (fromSimilar.length > 0) return fromSimilar;
    // Same-family tile extras if similar API is empty for this hero.
    return (compareHeroCategory?.images.slice(1) ?? [])
      .filter((src): src is string => Boolean(src) && src !== compareHeroImage)
      .slice(0, COMPARE_FAN_POSITIONS.length);
  })();
  const storeCount = stores.length;

  const handleChatCta = () => {
    navigateToChatEntry(router, { query: CHAT_EXAMPLE_QUERY, shopCategory: 'womens' });
  };

  return (
    <section aria-labelledby="feature-tabs-heading" className="section-shell">
      <div className="section-container flex flex-col items-center text-center">
        <p className="type-eyebrow">Møt Clea</p>
        <h2 id="feature-tabs-heading" className="type-heading-section mt-2 max-w-[18ch] text-balance">
          Handling som er laget for deg.
        </h2>

        <div className="feature-tabs__tablist mt-8 md:mt-10" role="tablist" aria-label="Clea-funksjoner">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={cn(
                'feature-tabs__tab',
                activeTab === tab.key && 'feature-tabs__tab--active',
              )}
              onClick={() => goToTab(tab.key)}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span
                  key={activeTab}
                  className="feature-tabs__tab-progress"
                  style={{ animationDuration: `${AUTO_ADVANCE_MS}ms` }}
                  aria-hidden
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="section-container mt-10 md:mt-14">
        <div className="feature-tabs__panel">
          {/* Visual -- placeholder holds briefly, then the real content fades in item by item */}
          <div
            className={cn(
              'feature-tabs__visual',
              activeTab === 'chat' && 'feature-tabs__visual--top',
            )}
          >
            {activeTab === 'chat' && chatStage >= 1 && (
              <p className="feature-tabs__prompt" style={revealStyle(0)}>
                {CHAT_EXAMPLE_QUERY}
              </p>
            )}

            {!visualLoaded ? (
              <div className="feature-tabs__skeleton" aria-hidden>
                {activeTab === 'explore' && (
                  <div className="feature-tabs__explore-grid">
                    {exploreColumns.map((_, colIndex) => (
                      <div key={colIndex} className="feature-tabs__explore-col">
                        <div className="flex flex-col gap-3 sm:gap-4">
                          {Array.from({ length: 2 }, (_, i) => (
                            <div key={i} className="feature-tabs__explore-photo animate-pulse bg-muted" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'save' && (
                  <div className="feature-tabs__pricealert-row">
                    <div className="flex gap-3 sm:gap-4">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className="feature-tabs__pricealert-card">
                          <div className="feature-tabs__pricealert-photo animate-pulse bg-muted" />
                          <div className="mt-2 h-2.5 w-20 animate-pulse rounded bg-muted" />
                          <div className="mt-1.5 h-2.5 w-16 animate-pulse rounded bg-muted" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'compare' && (
                  <div className="feature-tabs__compare-stage" aria-hidden>
                    <div className="h-[180px] w-[140px] animate-pulse rounded-lg bg-muted sm:h-[220px] sm:w-[170px]" />
                  </div>
                )}
              </div>
            ) : (
              <div className="feature-tabs__visual-content">
                {activeTab === 'explore' && (
                  <div className="feature-tabs__explore-grid" role="list" aria-label="Utvalg på tvers av kategorier">
                    {exploreColumns.map((column, colIndex) => {
                      if (column.length === 0) return null;
                      const direction = colIndex === 1 ? 'down' : 'up';

                      return (
                        <div key={colIndex} className="feature-tabs__explore-col" role="listitem">
                          <div
                            className={cn(
                              'feature-tabs__explore-track',
                              direction === 'down'
                                ? 'feature-tabs__explore-track--down'
                                : 'feature-tabs__explore-track--up',
                            )}
                          >
                            {[...column, ...column].map((src, i) => (
                              <div key={`${colIndex}-${i}`} className="feature-tabs__explore-photo">
                                <Image
                                  src={src}
                                  alt=""
                                  fill
                                  className="object-cover object-center"
                                  sizes="180px"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'chat' && chatProducts.length > 0 && (
                  <div className="flex flex-col gap-4 pt-1">
                    {chatStage >= 2 && (
                      <p className="feature-tabs__ai-bubble" style={revealStyle(0)}>
                        {chatReply}
                      </p>
                    )}
                    {chatStage >= 3 && (
                      <div className="feature-tabs__row" role="list" aria-label="Søkeresultater">
                        {chatProducts.map((product, i) => (
                          <div key={product.id} className="feature-tabs__row-photo" style={revealStyle(i)} role="listitem">
                            <Image
                              src={product.image}
                              alt={toDisplayCase(product.name)}
                              fill
                              className="feature-tabs__photo-zoom object-cover"
                              sizes="160px"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'save' && priceDropProducts.length > 0 && (
                  <div className="feature-tabs__pricealert-row" role="list" aria-label="Prisvarsler">
                    <div className="feature-tabs__pricealert-track">
                      {[...priceDropProducts, ...priceDropProducts].map((product, i) => {
                        const [before, after] = product.priceHistory;
                        const dropPercent = Math.round(((before.price - after.price) / before.price) * 100);

                        return (
                          <div key={`${product.id}-${i}`} className="feature-tabs__pricealert-card" role="listitem">
                            <div className="feature-tabs__pricealert-photo">
                              <Image
                                src={product.image}
                                alt={toDisplayCase(product.name)}
                                fill
                                className="object-cover"
                                sizes="150px"
                              />
                              {dropPercent > 0 && (
                                <span className="feature-tabs__pricealert-badge">-{dropPercent}%</span>
                              )}
                            </div>
                            <p className="feature-tabs__pricealert-name">{toDisplayCase(product.name)}</p>
                            <p className="feature-tabs__pricealert-price">
                              <span className="feature-tabs__pricealert-price-old">
                                {formatPrice(before.price, product.currency)}
                              </span>
                              <span className="feature-tabs__pricealert-price-new">
                                {formatPrice(after.price, product.currency)}
                              </span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'compare' && compareHeroImage && (
                  <div className="feature-tabs__compare-stage" role="list" aria-label="Lignende produkter">
                    {compareFanPhotos.map((src, i) => {
                      const pos = COMPARE_FAN_POSITIONS[i % COMPARE_FAN_POSITIONS.length];
                      return (
                        <div
                          key={`${src}-${i}`}
                          className="feature-tabs__compare-fan-photo"
                          style={
                            {
                              '--fan-x': pos.x,
                              '--fan-y': pos.y,
                              '--fan-r': pos.r,
                              '--reveal-index': i,
                            } as CSSProperties
                          }
                          role="listitem"
                        >
                          <div className="feature-tabs__compare-fan-photo-inner">
                            <Image src={src} alt="" fill className="object-cover" sizes="92px" />
                          </div>
                        </div>
                      );
                    })}
                    <div className="feature-tabs__compare-hero" role="listitem">
                      <div className="feature-tabs__compare-hero-photo">
                        <Image src={compareHeroImage} alt="" fill className="object-cover" sizes="180px" />
                        <span className="feature-tabs__compare-hero-badge">
                          <AiSparkIcon />
                          Flere lignende
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Copy -- swaps the instant the tab is clicked, no transition */}
          <div className="feature-tabs__copy">
            {activeTab === 'explore' && (
              <>
                <h3 className="feature-tabs__copy-heading">Personlig shopping, uten filtrene.</h3>
                <p className="feature-tabs__copy-body">
                  Bla gjennom hele utvalget på tvers av butikker — sortert akkurat slik du liker det, ikke slik en butikk vil vise det.
                </p>
                <Link href="/shop" className="feature-tabs__cta">
                  Se hele utvalget
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </>
            )}

            {activeTab === 'chat' && (
              <>
                <h3 className="feature-tabs__copy-heading">Spør oss, vi finner det.</h3>
                <p className="feature-tabs__copy-body">
                  Skriv som du snakker — anledning, stil eller budsjett. Vi finner matchene på tvers av butikker, uten at du må filtrere deg frem.
                </p>
                <button type="button" className="feature-tabs__cta feature-tabs__cta--button" onClick={handleChatCta}>
                  Start et søk
                  <ArrowUpRight className="size-4" aria-hidden />
                </button>
              </>
            )}

            {activeTab === 'save' && (
              <>
                <h3 className="feature-tabs__copy-heading">Få beskjed når prisen faller.</h3>
                <p className="feature-tabs__copy-body">
                  Følg produktene du liker. Vi sender deg en e-post så snart prisen synker.
                </p>
                <Link href="/account/tracks" className="feature-tabs__cta">
                  Se mine prisvarsler
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </>
            )}

            {activeTab === 'compare' && (
              <>
                <h3 className="feature-tabs__copy-heading">Én pris er sjelden den beste.</h3>
                <p className="feature-tabs__copy-body">
                  {storeCount > 0
                    ? `Vi sammenligner priser fra ${storeCount}+ butikker, så du alltid vet om du får den beste avtalen.`
                    : 'Vi sammenligner priser på tvers av butikker, så du alltid vet om du får den beste avtalen.'}
                </p>
                <Link href="/brands" className="feature-tabs__cta">
                  Se alle butikker
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
