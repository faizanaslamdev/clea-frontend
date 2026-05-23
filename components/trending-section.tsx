// "use client";

// import { useRef, useState, useEffect } from "react";
// import Link from "next/link";
// import { ArrowLeft, ArrowRight } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { ProductCarousel, type ProductCarouselHandle } from "@/components/product-carousel";
// import { useFeaturedProducts } from "@/lib/hooks/useProducts";

// export function TrendingSection() {
//   const carouselRef = useRef<ProductCarouselHandle>(null);
//   const [canLeft, setCanLeft]   = useState(false);
//   const [canRight, setCanRight] = useState(false);

//   const { data: products = [], isLoading } = useFeaturedProducts();

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (carouselRef.current) {
//         setCanLeft(carouselRef.current.canScrollLeft);
//         setCanRight(carouselRef.current.canScrollRight);
//       }
//     }, 100);
//     return () => clearInterval(interval);
//   }, []);

//   if (isLoading) return <div className="animate-pulse h-96" />;

//   return (
//     <section className="py-16 md:py-24">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

//         <div className="mb-6 flex items-end justify-between">
//           <div>
//             <h2 className="type-heading md:mb-2">Trending Now</h2>
//             <p className="type-subheading">
//               Popular fashion picks — compare prices across Nordic stores
//             </p>
//           </div>

//           <div className="hidden md:flex items-center gap-2">
//             <Button
//               variant="outline"
//               size="icon"
//               aria-label="Scroll left"
//               disabled={!canLeft}
//               onClick={() => carouselRef.current?.scrollLeft()}
//               className="size-9 border-border disabled:opacity-30"
//             >
//               <ArrowLeft className="size-4" />
//             </Button>
//             <Button
//               variant="outline"
//               size="icon"
//               aria-label="Scroll right"
//               disabled={!canRight}
//               onClick={() => carouselRef.current?.scrollRight()}
//               className="size-9 border-border disabled:opacity-30"
//             >
//               <ArrowRight className="size-4" />
//             </Button>
//             <Link
//               href="/trending"
//               className="ml-2 inline-flex items-center gap-1 border-b border-foreground pb-0.5 text-sm font-medium transition-opacity hover:opacity-70"
//             >
//               See all <ArrowRight className="size-4" />
//             </Link>
//           </div>
//         </div>

//         <ProductCarousel ref={carouselRef} products={products} hideControls />

//         {/* mobile see all */}
//         <div className="mt-8 flex justify-center md:hidden">
//           <Link
//             href="/trending"
//             className="inline-flex items-center gap-1 border-b border-foreground pb-0.5 text-sm font-medium"
//           >
//             View all trending <ArrowRight className="size-4" />
//           </Link>
//         </div>

//       </div>
//     </section>
//   );
// }


"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCarousel, type ProductCarouselHandle } from "@/components/product-carousel";
import { useFeaturedProducts } from "@/lib/hooks/useProducts";

export function TrendingSection() {
  const carouselRef = useRef<ProductCarouselHandle>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const { data: products = [], isLoading } = useFeaturedProducts();

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        setCanLeft(carouselRef.current.canScrollLeft);
        setCanRight(carouselRef.current.canScrollRight);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <div className="section-container animate-pulse h-96" />;

  return (
    <section className="overflow-hidden">

      {/* header */}
      <div className="section-container mb-6 flex items-center justify-between">
        <h2 className="type-heading">Trending Now</h2>

        {/* mobile arrow only */}
        <Link href="/trending" aria-label="See all" className="md:hidden">
          <Button variant="outline" size="icon" className="rounded-full size-6 bg-muted border-none">
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>


      <div className="section-container mb-6 hidden md:flex items-center justify-between">
        <p className="type-subheading">
          Popular fashion picks — compare prices across Nordic stores
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/trending"
            className="type-link"
          >
            See all
          </Link>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Scroll left"
              disabled={!canLeft}
              onClick={() => carouselRef.current?.scrollLeft()}
              className="rounded-full size-7 bg-muted hover:bg-muted/80 disabled:opacity-30"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Scroll right"
              disabled={!canRight}
              onClick={() => carouselRef.current?.scrollRight()}
              className="rounded-full size-7 bg-muted hover:bg-muted/80 disabled:opacity-30"
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="section-container">
  <ProductCarousel ref={carouselRef} products={products} hideControls />
</div>



    </section>
  );
}