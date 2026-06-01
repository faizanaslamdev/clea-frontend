import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/legal-page-shell';
import { BRAND } from '@/lib/constants/brand';

export const metadata: Metadata = {
  title: 'FAQ',
  description: `Frequently asked questions about ${BRAND.name}.`,
};

const FAQ_ITEMS = [
  {
    q: `What is ${BRAND.name}?`,
    a: `${BRAND.name} is a Nordic fashion price comparison platform. Use AI search to find products and compare prices across leading retailers.`,
  },
  {
    q: 'Which retailers do you cover?',
    a: 'We focus on major fashion retailers popular in Norway and the Nordics, including brands such as Zalando, Boozt, Nelly, and H&M. Available brands and products grow over time.',
  },
  {
    q: 'Do I need an account?',
    a: 'No account is required to search and browse. You can explore brands, run AI search, and follow links to shop on retailer sites.',
  },
  {
    q: 'How does AI search work?',
    a: 'Describe what you are looking for in natural language. We match your request to relevant products and show options with links to retailer pages.',
  },
  {
    q: 'Where do I complete my purchase?',
    a: 'Purchases happen on the retailer’s website. Clea helps you discover and compare — checkout is always with the store you choose.',
  },
  {
    q: 'Is Clea available outside Norway?',
    a: 'Norway is our primary market. We are expanding across the Nordics.',
  },
] as const;

export default function FaqPage() {
  return (
    <LegalPageShell
      title="FAQ"
      description="Common questions about using Clea."
    >
      <div className="space-y-10">
        {FAQ_ITEMS.map((item) => (
          <section key={item.q}>
            <h2 className="legal-page__h2">{item.q}</h2>
            <p>{item.a}</p>
          </section>
        ))}
      </div>
      <p className="mt-12">
        Still have questions?{' '}
        <Link href="/contact">Contact us</Link>.
      </p>
    </LegalPageShell>
  );
}
