import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ProductPageClient } from '@/components/product-page-client';
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
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <ProductPageClient product={product} />
      </main>
      <Footer />
    </>
  );
}

export async function generateStaticParams() {
  return [
    { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' },
    { id: '6' }, { id: '7' }, { id: '8' }, { id: '9' }, { id: '10' },
    { id: '11' }, { id: '12' }, { id: '13' }, { id: '14' }, { id: '15' },
    { id: '16' }, { id: '17' }, { id: '18' }, { id: '19' }, { id: '20' },
    { id: '21' }, { id: '22' }, { id: '23' }, { id: '24' },     { id: '25' },
    { id: '26' },
    { id: '27' },
    { id: '28' },
    { id: '29' },
    { id: '30' },
    { id: '31' },
    { id: '32' },
    { id: '33' },
    { id: '34' },
    { id: '35' },
    { id: '36' },
    { id: '37' },
    { id: '38' },
    { id: '39' },
  ];
}
