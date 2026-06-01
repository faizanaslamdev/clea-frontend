import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/legal-page-shell';
import { BRAND } from '@/lib/constants/brand';
import { COMPANY } from '@/lib/constants/company';

export const metadata: Metadata = {
  title: 'About',
  description: `Learn about ${BRAND.name} — Nordic AI-powered fashion price comparison.`,
};

export default function AboutPage() {
  return (
    <LegalPageShell
      title={`About ${BRAND.name}`}
      description="Smarter fashion shopping for the Nordics."
    >
      <p>{COMPANY.about}</p>
      <p>{COMPANY.market}</p>
      <p>
        {BRAND.name} is based in {COMPANY.locationLabel}. We combine conversational
        AI with real retailer listings so you can compare prices quickly and shop
        with confidence.
      </p>
      <h2>What we offer</h2>
      <ul>
        <li>AI-powered search across fashion and beauty retailers</li>
        <li>Price comparison and discovery for purchase-ready shoppers</li>
        <li>Direct links to retailer product pages</li>
        <li>Brand exploration and curated collections</li>
      </ul>
      <p>
        Questions? Visit our{' '}
        <Link href="/contact">contact page</Link> or email{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>
      <p className="text-muted-foreground text-sm">
        {COMPANY.name} · {COMPANY.locationLabel}
      </p>
    </LegalPageShell>
  );
}
