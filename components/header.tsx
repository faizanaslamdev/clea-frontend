'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeroSearchForm } from '@/components/hero-search-form';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/brands', label: 'Brands' },
  { href: '/chat', label: 'Chat' },
] as const;

const HEADER_HEIGHT = 64;

function isNavActive(href: string, pathname: string): boolean {
  if (href === '/brands') return pathname.startsWith('/brands');
  if (href === '/chat') return pathname.startsWith('/chat');
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

export function Header() {
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState(false);

  const isHome = pathname === '/';
  const hasUnderlapHero =
    isHome || /^\/brands\/[^/]+$/.test(pathname);
  const overHero = hasUnderlapHero && !pastHero;
  const showStickySearch = isHome && pastHero;

  const updateHeaderOnScroll = useCallback(() => {
    if (!hasUnderlapHero) {
      setPastHero(true);
      return;
    }
    setPastHero(window.scrollY >= getPastHeroScrollThreshold());
  }, [hasUnderlapHero]);

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
          pastHero && 'site-header--scrolled',
          overHero && 'site-header--over-hero-scrolled',
        )}
      >
        <div className="site-header-bar">
          <div className="site-header-left">
            <nav className="flex items-center gap-6 md:gap-8" aria-label="Main">
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

          <Link
            href="/"
            className={cn(
              'site-header-wordmark site-header-wordmark--center z-[5]',
              overHero && 'site-header-wordmark--over-hero',
            )}
          >
            Nordic
          </Link>

          <div className="site-header-right" aria-hidden />
        </div>
      </header>

      {isHome ? (
        <HeroSearchForm
          variant="compact"
          idPrefix="sticky-hero-search"
          className={cn(
            'sticky-hero-search',
            showStickySearch && 'sticky-hero-search--visible',
          )}
          inert={!showStickySearch}
          aria-hidden={!showStickySearch}
        />
      ) : null}

      {!hasUnderlapHero && <div className="h-16 shrink-0" aria-hidden />}
    </>
  );
}
