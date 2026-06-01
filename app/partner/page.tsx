import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/legal-page-shell';
import { BRAND } from '@/lib/constants/brand';
import { COMPANY } from '@/lib/constants/company';

export const metadata: Metadata = {
  title: 'Partner',
  description: `Partner with ${BRAND.name} — reach high-intent fashion shoppers.`,
};

export default function PartnerPage() {
  return (
    <LegalPageShell
      title="Partner with Clea"
      description="Reach purchase-ready shoppers across the Nordics."
    >
      <p>
        {BRAND.name} connects fashion and beauty brands with high-intent shoppers
        who use AI search to find products and compare prices before they buy.
      </p>
      <h2>Why partner</h2>
      <ul>
        <li>Exposure across search, brand pages, and curated collections</li>
        <li>Traffic driven to your product pages</li>
        <li>Audience focused on Norway and the wider Nordic region</li>
        <li>Placement alongside discovery experiences shoppers already trust</li>
      </ul>
      <h2>Who we work with</h2>
      <p>
        Fashion and beauty retailers, marketplaces, and brands that sell through
        established Nordic channels — from global names to emerging labels.
      </p>
      <h2>Get in touch</h2>
      <p>
        To discuss partnerships, integrations, or brand listings, email{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> with
        &quot;Partnership&quot; in the subject line.
      </p>
      <p>
        <Link href="/brands">Explore brands on Clea</Link> ·{' '}
        <Link href="/contact">Contact</Link>
      </p>
    </LegalPageShell>
  );
}
