import { PageLayout } from '@/components/layout/page-layout';
import { ProductGrid } from '@/components/product-grid';
import { getTrendingProducts } from '@/lib/services';

export default function TrendingPage() {
  const trendingProducts = getTrendingProducts(40);

  return (
    <PageLayout>
      <div className="section-container section-shell">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Trending Products</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            The most popular fashion and beauty products across Nordic stores right now
          </p>
        </div>

        <ProductGrid products={trendingProducts} />

        <section className="mt-20 rounded-lg border border-border bg-muted/30 p-8 md:p-12">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            What Makes These Trending?
          </h2>
          <p className="mb-4 text-muted-foreground">
            Our trending products are determined by a combination of factors:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li>✓ High customer ratings and reviews</li>
            <li>✓ Significant price movements in the last week</li>
            <li>✓ Strong sales velocity across stores</li>
            <li>✓ Social media mentions and discussions</li>
          </ul>
        </section>
      </div>
    </PageLayout>
  );
}
