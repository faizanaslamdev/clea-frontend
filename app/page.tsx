import { HeroSection } from '@/components/hero-section';
import { ProductGrid } from '@/components/product-grid';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getTrendingProducts } from '@/lib/services';

export default function Home() {
  const trendingProducts = getTrendingProducts(6);

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />

        {/* Trending Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                Trending Now
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                Check out the most popular products across Nordic stores
              </p>
            </div>

            <ProductGrid products={trendingProducts} />
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                Why Choose Nordic Price?
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="rounded-lg border border-border bg-card p-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary text-xl font-bold">
                  ⚡
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  Real-time Prices
                </h3>
                <p className="text-muted-foreground">
                  Get instant price updates across all Nordic retailers. No outdated information.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-lg border border-border bg-card p-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent text-xl font-bold">
                  📊
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  Price History
                </h3>
                <p className="text-muted-foreground">
                  Track price trends over 30 days. Make smarter purchase decisions.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-lg border border-border bg-card p-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary text-xl font-bold">
                  🎯
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  Smart Comparison
                </h3>
                <p className="text-muted-foreground">
                  Compare prices side-by-side. Find the best deal instantly.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-lg border border-border bg-card p-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent text-xl font-bold">
                  ✨
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  Price AI
                </h3>
                <p className="text-muted-foreground">
                  Buy now or wait? Insights from tracked price history only.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
