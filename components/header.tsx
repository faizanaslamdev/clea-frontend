'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { AudienceSwitch } from '@/components/audience-switch';
import { BrandLogo } from '@/components/brand-logo';
import { HeroSearchForm } from '@/components/hero-search-form';
import { useAuthModal } from '@/components/auth/auth-provider';
import { useSession } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import { isFooterNearStickySearch } from '@/lib/ui/floating-search-dock';
import { useAppPathname } from '@/lib/navigation/app-pathname';

/* Explore/Shop/Brands -- daydream.ing's own header nav is Explore/Shop/
   Favorites; Clea doesn't have a favorites concept in the header today, so
   Merker (Brands) takes that third slot. Utforsk (Explore) links home --
   the homepage IS Clea's explore experience (search landing, feature
   tabs, categories). Sok (Search) was dropped from here: search already
   lives in the hero search box and the sticky compact bar, so a separate
   nav entry for it was redundant with Utforsk pointing at the same page. */
const NAV_ITEMS = [
  { href: '/', label: 'Utforsk' },
  { href: '/shop', label: 'Handle' },
  { href: '/brands', label: 'Merker' },
] as const;

const HEADER_HEIGHT = 96;
const MOBILE_MAX_WIDTH = 767;

function isNavActive(href: string, pathname: string): boolean {
  if (href === '/shop') return pathname.startsWith('/shop');
  if (href === '/brands') return pathname.startsWith('/brands');
  return pathname === href;
}

function NavLink({
  href,
  label,
  pathname,
  overHero,
}: {
  href: string;
  label: string;
  pathname: string;
  overHero: boolean;
}) {
  const active = isNavActive(href, pathname);

  return (
    <Link
      href={href}
      className={cn(
        'site-header-nav-link',
        overHero && 'site-header-nav-link--over-hero',
        active && 'site-header-nav-link--active',
      )}
    >
      {label}
    </Link>
  );
}

/**
 * True when no `[data-audience-toggle]` is on the page, or the one that is
 * has left the viewport.
 */
function useAudienceToggleScrolledAway(pathname: string): boolean {
  const [scrolledAway, setScrolledAway] = useState(false);
  useEffect(() => {
    let intersection: IntersectionObserver | null = null;
    let mutation: MutationObserver | null = null;
    const watch = (target: Element) => {
      mutation?.disconnect();
      mutation = null;
      intersection = new IntersectionObserver(
        ([entry]) => setScrolledAway(!entry.isIntersecting),
        { threshold: 0 },
      );
      intersection.observe(target);
    };
    const found = document.querySelector('[data-audience-toggle]');
    if (found) {
      watch(found);
    } else {
      // Pages such as the /shop hub render their toggle after a client
      // transition: show the switch now, hand over once the toggle appears.
      setScrolledAway(true);
      mutation = new MutationObserver(() => {
        const late = document.querySelector('[data-audience-toggle]');
        if (late) watch(late);
      });
      mutation.observe(document.body, { childList: true, subtree: true });
    }
    return () => {
      intersection?.disconnect();
      mutation?.disconnect();
    };
  }, [pathname]);
  return scrolledAway;
}

function getPastHeroScrollThreshold(): number {
  const hero = document.querySelector('.page-hero');
  if (!hero) return 400;
  const { bottom } = hero.getBoundingClientRect();
  return Math.max(0, bottom + window.scrollY - HEADER_HEIGHT);
}

function isMobileViewport(): boolean {
  return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;
}

export function Header() {
  const pathname = useAppPathname();
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const [pastHero, setPastHero] = useState(false);
  const [hideStickyNearFooter, setHideStickyNearFooter] = useState(false);

  const isHome = pathname === '/';
  const isBrandDetail = /^\/brands\/[^/]+$/.test(pathname);
  const hasUnderlapHero = isHome || isBrandDetail;
  // Only brand pages still have a dark photo hero underneath — the home
  // hero is a plain background now, so its header stays in its normal
  // (dark logo/text) theme instead of switching to the light-over-photo one.
  const overHero = isBrandDetail && !pastHero;
  // Home no longer has a photo hero to be transparent over, so its header
  // background should render immediately, not wait for the hero-height
  // scroll threshold below (that threshold still gates the sticky search
  // bar reveal on home/brand pages, which is unrelated and unchanged).
  const showHeaderBackground = pastHero || isHome;
  const showStickySearchBar = isHome || isBrandDetail;
  const showStickySearch =
    showStickySearchBar && pastHero && !hideStickyNearFooter;
  const firstName = session?.user.name?.trim().split(/\s+/)[0] || 'Min konto';
  // The header's Dame/Herre stays out of the way while a page's own toggle
  // (home hero, /chat landing, /shop hub) is on screen: one choice, not
  // two. It comes in, like the sticky search, once that toggle has scrolled
  // away, and is always there on pages without one.
  const showAudienceSwitch = useAudienceToggleScrolledAway(pathname);

  const updateHeaderOnScroll = useCallback(() => {
    if (!hasUnderlapHero) {
      setPastHero(true);
      setHideStickyNearFooter(false);
      return;
    }
    setPastHero(window.scrollY >= getPastHeroScrollThreshold());

    if (showStickySearchBar && isMobileViewport()) {
      setHideStickyNearFooter(isFooterNearStickySearch());
    } else {
      setHideStickyNearFooter(false);
    }
  }, [hasUnderlapHero, showStickySearchBar]);

  useEffect(() => {
    if (!hasUnderlapHero) {
      setPastHero(true);
      return;
    }

    updateHeaderOnScroll();
    window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
    window.addEventListener('resize', updateHeaderOnScroll);
    return () => {
      window.removeEventListener('scroll', updateHeaderOnScroll);
      window.removeEventListener('resize', updateHeaderOnScroll);
    };
  }, [hasUnderlapHero, pathname, updateHeaderOnScroll]);

  return (
    <>
      <header
        className={cn(
          'site-header',
          showHeaderBackground && 'site-header--scrolled',
          overHero && 'site-header--over-hero-scrolled',
        )}
      >
        <div className="site-header-bar">
          <div className="site-header-left">
            <nav
              className={cn(
                'site-header-nav',
                overHero && 'site-header-nav--over-hero',
              )}
              aria-label="Hovedmeny"
            >
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  pathname={pathname}
                  overHero={overHero}
                />
              ))}
            </nav>
            <AudienceSwitch
              overHero={overHero}
              className={cn('site-header-audience', !showAudienceSwitch && 'site-header-audience--hidden')}
              hidden={!showAudienceSwitch}
            />
          </div>

          <BrandLogo
            variant="wordmark"
            theme={overHero ? 'light' : 'dark'}
            headerSized
            className="site-header-logo site-header-logo--center z-5"
            priority
          />

          <div className="site-header-right">
            {session?.user ? (
              <Link
                href="/account"
                className={cn(
                  'site-header-account-link',
                  overHero && 'site-header-account-link--over-hero',
                  pathname.startsWith('/account') &&
                    'site-header-account-link--active',
                )}
                aria-label={`Min konto${session.user.name ? `, ${session.user.name}` : ''}`}
              >
                <UserRound className="size-5" strokeWidth={1.5} aria-hidden />
                <span>{firstName}</span>
              </Link>
            ) : (
              <button
                type="button"
                className={cn(
                  'site-header-account-link',
                  overHero && 'site-header-account-link--over-hero',
                )}
                onClick={() => openAuthModal({ view: 'sign-in' })}
                aria-label="Logg inn på Clea"
              >
                <UserRound className="size-5" strokeWidth={1.5} aria-hidden />
                <span>Logg inn</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {showStickySearchBar ? (
        <HeroSearchForm
          variant="compact"
          appearance="floating"
          idPrefix={isBrandDetail ? 'sticky-brand-search' : 'sticky-hero-search'}
          className={cn(
            'sticky-hero-search',
            showStickySearch && 'sticky-hero-search--visible',
          )}
          inert={!showStickySearch}
          aria-hidden={!showStickySearch}
        />
      ) : null}

      {!hasUnderlapHero && (
        <div className="site-header-spacer shrink-0" aria-hidden />
      )}
    </>
  );
}
