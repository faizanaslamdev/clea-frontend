import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/legal-page-shell';
import { BRAND } from '@/lib/constants/brand';
import { COMPANY } from '@/lib/constants/company';

export const metadata: Metadata = {
  title: 'Terms',
  description: `Terms of use for ${BRAND.name}.`,
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of use"
      description={`Terms for using ${BRAND.domain}.`}
    >
      <p>
        <strong>Last updated:</strong> June 2026
      </p>
      <p>
        By using {BRAND.domain}, operated by {COMPANY.name}, you agree to these
        terms. If you do not agree, please do not use the site.
      </p>
      <h2>Service</h2>
      <p>
        {BRAND.name} provides fashion and beauty price comparison and discovery
        tools, including AI-assisted search. Product information, prices, and
        availability come from retailers and may change without notice.
      </p>
      <h2>Accuracy</h2>
      <p>
        We strive for accurate listings but do not guarantee completeness or
        real-time pricing. Always confirm price and availability on the
        retailer&apos;s site before purchasing.
      </p>
      <h2>External links</h2>
      <p>
        Links to third-party retailers are provided for your convenience.{' '}
        {COMPANY.name} is not responsible for retailer sites, products, or
        transactions.
      </p>
      <h2>Acceptable use</h2>
      <p>
        You may not misuse the site, attempt unauthorised access, scrape content
        at scale, or use the service for unlawful purposes.
      </p>
      <h2>Intellectual property</h2>
      <p>
        {BRAND.name} branding, design, and software are owned by {COMPANY.name}
        or its licensors. Retailer trademarks belong to their respective owners.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        The site is provided &quot;as is&quot; to the extent permitted by law.{' '}
        {COMPANY.name} is not liable for indirect losses arising from use of the
        service or reliance on displayed information.
      </p>
      <h2>Changes</h2>
      <p>We may update these terms; continued use constitutes acceptance.</p>
      <h2>Contact</h2>
      <p>
        <Link href="/contact">Contact</Link> ·{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>
    </LegalPageShell>
  );
}
