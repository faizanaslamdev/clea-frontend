import { PageLayout } from '@/components/layout/page-layout';

export default function CartPage() {
  return (
    <PageLayout mainClassName="section-container section-shell min-h-[50vh]">
      <p className="type-eyebrow mb-3">Cart</p>
      <h1 className="type-heading mb-4">Your cart</h1>
      <p className="type-subheading">Your saved items will appear here.</p>
    </PageLayout>
  );
}
