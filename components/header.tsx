'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRound } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { HeroSearchForm } from '@/components/hero-search-form';
import { useAuthModal } from '@/components/auth/auth-provider';
import { useSession } from '@/lib/auth/client';
import { cn } from '@/lib/utils';

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
/** Hide bottom sticky search when footer enters this zone (mobile only). */
const STICKY_SEARCH_FOOTER_CLEARANCE_PX = 112;

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

function getPastHeroScrollThreshold(): number {
  const hero = document.querySelector('.page-hero');
  if (!hero) return 400;
  const { bottom } = hero.getBoundingClientRect();
  return Math.max(0, bottom + window.scrollY - HEADER_HEIGHT);
}

function isMobileViewport(): boolean {
  return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;
}

function isFooterNearStickySearch(): boolean {
  const footer = document.querySelector('.site-footer');
  if (!footer) return false;
  const { top } = footer.getBoundingClientRect();
  return top < window.innerHeight - STICKY_SEARCH_FOOTER_CLEARANCE_PX;
}

export function Header() {
  const pathname = usePathname();
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
