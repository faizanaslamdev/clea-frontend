"use client";

import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "./search-bar";
import { Button } from "@/components/ui/button";

const HERO_IMAGE = "/products/hero.jpg";

export function HeroSection() {
  return (
    <section className="hero" aria-label="Welcome">
      <div className="hero-media" aria-hidden>
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="hero-overlay" />
      </div>

      <div className="hero-content section-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="type-eyebrow mb-4 text-[var(--hero-muted)]">
            Nordic fashion & beauty
          </p>

          <h1 className="type-heading mb-6 text-balance">
            Find the <span className="text-accent">best prices</span> across
            Nordic stores
          </h1>

          <p className="type-subheading mx-auto mb-10 max-w-2xl text-pretty">
            Compare fashion and beauty across Nordic stores. Track price
            history, spot trends, and get Price AI guidance on when to buy.
          </p>

          <div className="hero-surface mx-auto mb-8 max-w-xl p-2">
            <SearchBar placeholder="Search for fashion, beauty, or brands..." />
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/trending">
              <Button size="lg" className="w-full sm:w-auto">
                Explore Trending
              </Button>
            </Link>
            <Link href="/search">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-[oklch(1_0_0/0.35)] bg-transparent text-[var(--hero-foreground)] hover:bg-[oklch(1_0_0/0.1)] hover:text-[var(--hero-foreground)] sm:w-auto"
              >
                View All Products
              </Button>
            </Link>
          </div>

          <div className="mt-16 hidden sm:grid gap-8 grid-cols-2 sm:grid-cols-3">
            <div>
              <p className="hero-stat-value">38+</p>
              <p className="hero-stat-label">Products</p>
            </div>
            <div>
              <p className="hero-stat-value">5</p>
              <p className="hero-stat-label">Nordic Stores</p>
            </div>
            <div>
              <p className="hero-stat-value">Real-time</p>
              <p className="hero-stat-label">Price Tracking</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
