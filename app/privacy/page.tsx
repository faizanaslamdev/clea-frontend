import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/legal-page-shell';
import { BRAND } from '@/lib/constants/brand';
import { COMPANY } from '@/lib/constants/company';

export const metadata: Metadata = {
  title: 'Privacy',
  description: `Privacy policy for ${BRAND.name}.`,
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy policy"
      description={`How ${BRAND.name} handles information when you use ${BRAND.domain}.`}
    >
      <p>
        <strong>Last updated:</strong> June 2026
      </p>
      <p>
        {COMPANY.name} ({BRAND.domain}) respects your privacy. This policy describes
        what information we collect and how we use it when you visit our website.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Usage data:</strong> anonymised analytics (e.g. pages visited,
          device type) via Vercel Analytics to improve the service.
        </li>
        <li>
          <strong>Search queries:</strong> text you enter in search or chat to
          provide product results. We do not require an account to browse.
        </li>
        <li>
          <strong>Technical data:</strong> standard server logs (IP address,
          browser type) for security and reliability.
        </li>
      </ul>
      <h2>How we use information</h2>
      <p>
        We use data to operate the site, improve search and comparison features,
        prevent abuse, and understand aggregate usage patterns. We do not sell
        personal data.
      </p>
      <h2>Cookies</h2>
      <p>
        We use essential cookies for site functionality and analytics cookies as
        described above. You can control cookies through your browser settings.
      </p>
      <h2>Third parties</h2>
      <p>
        When you follow links to retailers, their privacy policies apply. We may
        use infrastructure providers (e.g. hosting) that process data on our
        behalf under appropriate agreements.
      </p>
      <h2>Your rights</h2>
      <p>
        Depending on applicable law, you may request access, correction, or
        deletion of personal data we hold. Contact us at{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>
      <h2>Contact</h2>
      <p>
        {COMPANY.name} · <Link href="/contact">Contact page</Link> ·{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>
    </LegalPageShell>
  );
}
