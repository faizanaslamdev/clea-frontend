import { ProductPageClient } from '@/components/product-page-client';
import { PageLayout } from '@/components/layout/page-layout';
import { getProductById } from '@/lib/services';
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

  return (
    <PageLayout>
      <ProductPageClient product={product} />
    </PageLayout>
  );
}

export function generateStaticParams() {
  return Array.from({ length: 39 }, (_, i) => ({ id: String(i + 1) }));
}
