'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Menu, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandLogo } from './brand-logo';
import { SearchBar } from './search-bar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const NAV_ITEMS = [
  { href: '/trending', label: 'Trending' },
  { href: '/#stores', label: 'Stores' },
  { href: '/search', label: 'Products' },
] as const;

const SCROLL_THRESHOLD = 64;

function isNavActive(href: string, pathname: string): boolean {
  if (href === '/#stores') return false;
  if (href === '/search') return pathname.startsWith('/search');
  if (href === '/trending') return pathname.startsWith('/trending');
  return pathname === href;
}

function NavLink({
  href,
  label,
  pathname,
  onNavigate,
}: {
  href: string;
  label: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      data-active={isNavActive(href, pathname) ? 'true' : 'false'}
      className="nav-link"
    >
      {label}
    </Link>
  );
}

function CartLink({ className }: { className?: string }) {
  return (
    <Link
      href="/cart"
      className={cn('site-header-icon-btn', className)}
      aria-label="Shopping cart"
    >
      <ShoppingBag className="size-5" strokeWidth={1.5} />
    </Link>
  );
}

function HeaderSearch() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';

  return (
    <div className="site-header-search">
      <SearchBar
        key={`m-${searchQuery}`}
        defaultValue={searchQuery}
        placeholder="Search..."
        compact
        className="lg:hidden"
      />
      <SearchBar
        key={`d-${searchQuery}`}
        defaultValue={searchQuery}
        placeholder="Search fashion, beauty, brands..."
        className="hidden lg:block"
      />
    </div>
  );
}

function HeaderSearchFallback() {
  return (
    <div className="site-header-search">
      <SearchBar placeholder="Search..." compact className="lg:hidden" />
      <SearchBar
        placeholder="Search fashion, beauty, brands..."
        className="hidden lg:block"
      />
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = pathname === '/';
  const overHero = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const logoTextClass = overHero ? 'text-[var(--hero-foreground)]' : undefined;

  return (
    <>
      <header
        className={cn(
          'site-header',
          overHero ? 'site-header--over-hero' : 'site-header--solid',
        )}
      >
        <div className="site-header-inner gap-3 lg:gap-6">
          <Link href="/" className="shrink-0">
            <BrandLogo
              showText
              className="hidden lg:inline-flex"
              textClassName={logoTextClass}
            />
            <BrandLogo showText={false} className="lg:hidden" />
          </Link>

          <nav
            className="hidden flex-1 justify-center gap-8 lg:flex"
            aria-label="Main"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                pathname={pathname}
              />
            ))}
          </nav>

          <Suspense fallback={<HeaderSearchFallback />}>
            <HeaderSearch />
          </Suspense>

          <div className="flex shrink-0 items-center gap-0.5">
            <CartLink />

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="site-header-menu-btn"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" strokeWidth={1.5} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs">
                <SheetHeader>
                  <SheetTitle className="font-mono text-sm uppercase tracking-wide text-muted-foreground">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col px-4" aria-label="Mobile">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="border-b border-border py-4 font-mono text-sm uppercase tracking-wide text-foreground transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {!isHome && <div className="h-16 shrink-0" aria-hidden />}
    </>
  );
}
