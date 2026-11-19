'use client';

import { useCallback, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, X } from 'lucide-react';
import type { ShopCategory } from '@/lib/api/chat-types';
import { navigateToChatEntry } from '@/lib/chat/chat-entry';
import { buildSearchUrl, shouldOpenChat } from '@/lib/search/search-routing';
import { TypewriterText } from '@/components/shared/typewriter-text';
import { PhotoSearchButton } from '@/components/search/photo-search-button';
import { setPendingPhoto } from '@/lib/photo/pending-photo';
import { cn } from '@/lib/utils';

export type HeroSearchVariant = 'full' | 'compact';
export type HeroSearchSize = 'default' | 'large';
export type HeroSearchAppearance = 'default' | 'floating';

interface HeroSearchFormProps {
  variant?: HeroSearchVariant;
  size?: HeroSearchSize;
  appearance?: HeroSearchAppearance;
  className?: string;
  idPrefix?: string;
  inert?: boolean;
  'aria-hidden'?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  onSubmitQuery?: (query: string) => void;
  submitLocked?: boolean;
  /**
   * When true, the compact send control stays muted/disabled until the
   * field has non-empty text (AI modal/sheet). Floating CLEA inputs leave
   * this off so they keep their always-ready send affordance.
   */
  submitRequiresText?: boolean;
  placeholder?: string;
  /** When given (and the field is empty), cycles through these as an
   *  animated multi-line placeholder instead of the static `placeholder`
   *  text -- same type/delete/next-phrase effect as the search-landing
   *  headline above it, so the two feel like one system instead of a
   *  static box under an animated one. Only wired up for variant="full". */
  animatedPlaceholderPhrases?: readonly string[];
  shopCategory?: ShopCategory;
  /** Called with undefined when the visitor clears the choice. */
  onShopCategoryChange?: (category: ShopCategory | undefined) => void;
  /** Shows the camera button for photo search. */
  photoSearch?: boolean;
  /**
   * Receives the resized photo and what the shopper typed with it. Without it
   * the photo is handed to /chat, which sends it (homepage).
   */
  onSubmitPhoto?: (dataUrl: string, note?: string) => void;
}

export function HeroSearchForm({
  variant = 'full',
  size = 'default',
  appearance = 'default',
  className,
  idPrefix = 'hero-search',
  inert,
  'aria-hidden': ariaHidden,
  value: controlledValue,
  onValueChange,
  onSubmitQuery,
  submitLocked = false,
  submitRequiresText = false,
  placeholder = 'Beskriv hva du leter etter …',
  animatedPlaceholderPhrases,
  shopCategory: controlledShopCategory,
  onShopCategoryChange,
  photoSearch = false,
  onSubmitPhoto,
}: HeroSearchFormProps) {
  // No audience preselected: a first-time visitor's "kjole" or "jakke" must
  // not be read as men's. Clicking the chosen one again clears it.
  const [internalShopCategory, setInternalShopCategory] = useState<
    ShopCategory | undefined
  >(undefined);
  const isShopCategoryControlled = onShopCategoryChange !== undefined;
  const shopCategory = isShopCategoryControlled
    ? controlledShopCategory
    : internalShopCategory;
  const setShopCategory = (next: ShopCategory | undefined) => {
    if (!isShopCategoryControlled) {
      setInternalShopCategory(next);
    }
    onShopCategoryChange?.(next);
  };
  const [internalQuery, setInternalQuery] = useState('');
  const router = useRouter();

  const isControlled = controlledValue !== undefined;
  const query = isControlled ? controlledValue : internalQuery;
  const setQuery = (next: string) => {
    if (!isControlled) setInternalQuery(next);
    onValueChange?.(next);
  };

  const inputId = `${idPrefix}-query`;
  const hasText = query.trim().length > 0;
  const glassClass = appearance === 'floating' ? 'hero-search-glass' : undefined;

  const navigateToChat = useCallback(
    (trimmed: string) => {
      navigateToChatEntry(router, { query: trimmed, shopCategory });
    },
    [router, shopCategory],
  );

  // A picked photo waits here as an attachment until the shopper sends it,
  // so they can add words to it ("i rødt", "fra Arket").
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);

  const submitPhoto = useCallback(
    (dataUrl: string, note?: string) => {
      if (submitLocked) return;
      const text = note?.trim() || undefined;
      setAttachedPhoto(null);
      setQuery('');
      if (onSubmitPhoto) {
        onSubmitPhoto(dataUrl, text);
        return;
      }
      setPendingPhoto({ dataUrl, shopCategory, note: text });
      router.push('/chat');
    },
    // setQuery is a plain local helper; the deps below are the real inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSubmitPhoto, router, shopCategory, submitLocked],
  );

  const submitQuery = useCallback(() => {
    if (submitLocked) return;

    const trimmed = query.trim();
    if (attachedPhoto) {
      submitPhoto(attachedPhoto, trimmed);
      return;
    }
    if (!trimmed) return;

    if (onSubmitQuery) {
      onSubmitQuery(trimmed);
      return;
    }

    // Product lookups ("svarte jeans herre") open the results page; questions,
    // occasions and styling requests go to the AI chat.
    if (shouldOpenChat(trimmed)) {
      navigateToChat(trimmed);
      return;
    }
    router.push(buildSearchUrl(trimmed, shopCategory));
  }, [query, onSubmitQuery, navigateToChat, submitLocked, router, shopCategory, attachedPhoto, submitPhoto]);

  const attachment = attachedPhoto ? (
    <PhotoAttachment url={attachedPhoto} onRemove={() => setAttachedPhoto(null)} />
  ) : null;
  const photoPlaceholder = 'Legg til en beskjed, f.eks. «i svart» (valgfritt)';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuery();
  };

  const handleQueryKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    submitQuery();
  };

  if (variant === 'compact') {
    const submitReady = !submitRequiresText || hasText || Boolean(attachedPhoto);
    const canSubmit = submitReady && !submitLocked;

    return (
      <form
        onSubmit={handleSubmit}
        inert={inert}
        aria-hidden={ariaHidden}
        className={cn(
          'hero-search-bar hero-search-bar--compact',
          size === 'large' && 'hero-search-bar--large',
          glassClass,
          className,
        )}
        aria-busy={submitLocked}
      >
        <label htmlFor={inputId} className="sr-only">
          Beskriv hva du leter etter
        </label>
        {attachment}
        <textarea
          id={inputId}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleQueryKeyDown}
          placeholder={attachedPhoto ? 'Legg til tekst …' : placeholder}
          rows={1}
          className="hero-search-bar--compact__input"
          autoComplete="off"
          enterKeyHint="search"
        />
        {photoSearch ? (
          <PhotoSearchButton onPhoto={setAttachedPhoto} disabled={submitLocked} />
        ) : null}
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            'hero-search-bar--compact__submit',
            submitReady && 'hero-search-bar--compact__submit--active',
          )}
          aria-label="Søk"
        >
          <ArrowUp className="size-[1.125rem]" strokeWidth={2.25} />
        </button>
      </form>
    );
  }

  return (
    <div className={cn('hero-search-stack layout-inner-medium', className)}>
      <div
        className={cn('hero-category-toggle', glassClass)}
        role="tablist"
        aria-label="Handlekategori"
      >
        {(['womens', 'mens'] as const).map((value) => {
          const label = value === 'womens' ? 'Dame' : 'Herre';
          const isActive = shopCategory === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setShopCategory(isActive ? undefined : value)}
              className={cn(
                'hero-category-toggle__btn',
                isActive && 'hero-category-toggle__btn--active',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <form
        onSubmit={handleSubmit}
        className={cn(
          'hero-search-card',
          glassClass,
          submitLocked && 'hero-search-card--locked',
        )}
        aria-busy={submitLocked}
      >
        <label htmlFor={inputId} className="sr-only">
          Beskriv hva du leter etter
        </label>
        {attachment}
        <div className="hero-search-card__field">
          {animatedPlaceholderPhrases && animatedPlaceholderPhrases.length > 0 && !hasText && !attachedPhoto ? (
            <TypewriterText
              phrases={animatedPlaceholderPhrases}
              className="hero-search-card__placeholder"
              showCursor
            />
          ) : null}
          <textarea
            id={inputId}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleQueryKeyDown}
            placeholder={attachedPhoto ? photoPlaceholder : animatedPlaceholderPhrases ? undefined : placeholder}
            rows={1}
            className="hero-search-card__input"
            enterKeyHint="search"
            disabled={submitLocked}
            readOnly={submitLocked}
          />
        </div>

        <div className="hero-search-card__footer">
          {photoSearch ? (
            <PhotoSearchButton onPhoto={setAttachedPhoto} disabled={submitLocked} className="photo-search-button--card" />
          ) : null}
          <button
            type="submit"
            className="hero-search-card__submit hero-search-card__submit--active"
            aria-label="Søk"
          >
            <ArrowUp className="size-[1.125rem]" strokeWidth={2.25} />
          </button>
        </div>
      </form>
    </div>
  );
}

/** The picked photo inside the ask box, before it is sent. */
function PhotoAttachment({ url, onRemove }: { url: string; onRemove: () => void }) {
  return (
    <div className="photo-attachment">
      <img src={url} alt="Valgt bilde" className="photo-attachment__image" />
      <button type="button" className="photo-attachment__remove" aria-label="Fjern bildet" onClick={onRemove}>
        <X aria-hidden className="size-3.5" strokeWidth={2.25} />
      </button>
    </div>
  );
}
