// 'use client';

// import { SearchBar } from './search-bar';
// import { Button } from '@/components/ui/button';
// import Link from 'next/link';

// export function HeroSection() {
//   return (
//     <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 md:py-24">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//         <div className="text-center">
//           {/* Headline */}
//           <h1 className="text-balance mb-4 text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl">
//             Find the <span className="text-primary">Best Prices</span> Across <span className="text-accent">Nordic Stores</span>
//           </h1>

//           {/* Subheadline */}
//           <p className="text-balance mb-8 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
//             Compare fashion and beauty across Nordic stores. Track price history, spot trends, and get Price AI guidance on when to buy.
//           </p>

//           {/* Search Bar */}
//           <div className="mx-auto mb-8 max-w-xl">
//             <SearchBar placeholder="Search for fashion, beauty, or brands..." />
//           </div>

//           {/* CTA Buttons */}
//           <div className="flex flex-col gap-4 sm:flex-row items-center justify-center">
//             <Link href="/trending">
//               <Button size="lg" className="w-full sm:w-auto">
//                 Explore Trending
//               </Button>
//             </Link>
//             <Link href="/search">
//               <Button variant="outline" size="lg" className="w-full sm:w-auto">
//                 View All Products
//               </Button>
//             </Link>
//           </div>

//           {/* Stats */}
//           <div className="mt-16 grid gap-8 sm:grid-cols-3">
//             <div>
//               <p className="text-3xl font-bold text-primary">38+</p>
//               <p className="text-sm text-muted-foreground">Products</p>
//             </div>
//             <div>
//               <p className="text-3xl font-bold text-primary">5</p>
//               <p className="text-sm text-muted-foreground">Nordic Stores</p>
//             </div>
//             <div>
//               <p className="text-3xl font-bold text-primary">Real-time</p>
//               <p className="text-sm text-muted-foreground">Price Tracking</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroCarousel, type HeroSlide } from '@/components/hero-carousel';
import { useCountUp } from '@/hooks/use-count-up';
import { getAllProducts, getAllStores } from '@/lib/services';
import { productImages } from '@/lib/dummy-data';

const HERO_SLIDES: HeroSlide[] = [
  { src: productImages.linenDressWhite, alt: 'Linen dress in neutral tones' },
  { src: productImages.sweater, alt: 'Knit sweater' },
  { src: productImages.jeans, alt: 'Tailored blazer' },
  { src: productImages.scarf, alt: 'Minimal scarf' },
  { src: productImages.palette, alt: 'Poplin dress' },
];

const PRODUCT_COUNT = getAllProducts().length;
const STORE_COUNT = getAllStores().length;

function HeroStat({
  end,
  suffix = '',
  label,
}: {
  end: number;
  suffix?: string;
  label: string;
}) {
  const { ref, display } = useCountUp({ end, suffix, duration: 1400 });

  return (
    <div ref={ref} className="min-w-28">
      <p className="font-mono text-2xl tabular-nums tracking-tight text-foreground sm:text-3xl">
        {display}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden  bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-muted/60 via-background to-background"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-2 justify-center text-center lg:text-left items-center lg:gap-16 lg:py-24 lg:px-8">
       
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Nordic price comparison
          </p>

          <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
            Find the{' '}
            <span className="text-primary">best price</span>
            <span className="mt-1 block text-foreground/90">
              across trusted stores.
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Compare fashion and beauty, track price history, and get clear
            guidance on when to buy — use search in the header to get started.
          </p>

          <div className="mt-8 flex flex-wrap justify-center lg:justify-start items-center gap-4">
            <Link href="/search">
              <Button size="lg" className="gap-2">
                Compare prices now
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/trending">
              <Button variant="outline" size="lg" className="gap-2">
                Explore trending
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-8  pt-8 sm:gap-12">
            <HeroStat
              end={PRODUCT_COUNT}
              suffix="+"
              label="Products tracked"
            />
            <HeroStat end={STORE_COUNT} label="Nordic stores" />
            <div className="min-w-[7rem]">
              <p className="font-mono text-2xl tracking-tight text-primary sm:text-3xl">
                Real-time
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Price guidance
              </p>
            </div>
          </div>
        </div>

        {/* Image carousel */}
        <div className="hidden lg:block relative w-full max-w-md justify-self-center lg:max-w-none lg:justify-self-end">
          <HeroCarousel slides={HERO_SLIDES} intervalMs={5000} />

          {/* <div className="absolute -bottom-4 left-4 z-10 hidden rounded-lg border border-border bg-card/95 px-4 py-3 shadow-sm backdrop-blur-sm sm:block">
            <p className="text-xs text-muted-foreground">Lowest price today</p>
            <p className="text-sm font-medium text-foreground">
              Compared across {STORE_COUNT} stores
            </p>
          </div> */}
        </div>
      </div>
    </section>
  );
}