import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ProductDetails } from '@/components/product-details';
import { ProductGrid } from '@/components/product-grid';
import { PriceChart } from '@/components/price-chart';
import { PriceAIInsightsPanel } from '@/components/price-ai-insights';
import { getProductById, getSimilarProducts } from '@/lib/services';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const similarProducts = getSimilarProducts(id);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Product Details Section */}
        <section className="border-b border-border py-8 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ProductDetails product={product} />
          </div>
        </section>

        {/* Price AI */}
        <section className="border-b border-border py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <PriceAIInsightsPanel product={product} />
          </div>
        </section>

        {/* Price Chart Section */}
        <section className="border-b border-border py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <PriceChart product={product} />
          </div>
        </section>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <section className="py-12 md:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-foreground">
                  Similar Products
                </h2>
                <p className="mt-2 text-lg text-muted-foreground">
                  Other {product.category.toLowerCase()} items you might like
                </p>
              </div>

              <ProductGrid products={similarProducts} />
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: '7' },
    { id: '8' },
    { id: '9' },
    { id: '10' },
    { id: '11' },
    { id: '12' },
    { id: '13' },
    { id: '14' },
  ];
}
