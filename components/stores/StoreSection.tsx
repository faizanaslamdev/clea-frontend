"use client"
import StoreGrid from "./StoreGrid";
import { useFeaturedStores } from "@/lib/hooks/useStores";
import Link from "next/link";
import { ArrowRight } from "lucide-react";



export default function StoreSection() {
    const { data: stores = [], isLoading } = useFeaturedStores();

  if (isLoading) return <div className="section-container animate-pulse h-64" />;
  return (
    <section id="stores" className="section-container section-shell scroll-mt-20">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h2 className="type-heading">Explore stores</h2>
          <p className="type-subheading md:max-w-[35%] md:text-right">
            Explore top-tier products from stores you know and discover new
            stores you'll love.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="type-eyebrow">Trending stores</h3>

          <Link
            href="/stores"
            className="border-b border-black flex items-center gap-1"
          >
            <span className="type-link">See all</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Grid */}
      <StoreGrid stores={stores} />
    </section>
  );
}
