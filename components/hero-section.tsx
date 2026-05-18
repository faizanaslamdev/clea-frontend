'use client';

import { SearchBar } from './search-bar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Headline */}
          <h1 className="text-balance mb-4 text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl">
            Find the <span className="text-primary">Best Prices</span> Across <span className="text-accent">Nordic Stores</span>
          </h1>

          {/* Subheadline */}
          <p className="text-balance mb-8 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
            Compare fashion and beauty across Nordic stores. Track price history, spot trends, and get Price AI guidance on when to buy.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mb-8 max-w-xl">
            <SearchBar placeholder="Search for fashion, beauty, or brands..." />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row items-center justify-center">
            <Link href="/trending">
              <Button size="lg" className="w-full sm:w-auto">
                Explore Trending
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View All Products
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div>
              <p className="text-3xl font-bold text-primary">38+</p>
              <p className="text-sm text-muted-foreground">Products</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">5</p>
              <p className="text-sm text-muted-foreground">Nordic Stores</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">Real-time</p>
              <p className="text-sm text-muted-foreground">Price Tracking</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
