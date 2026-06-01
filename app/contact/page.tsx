import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/legal/legal-page-shell';
import { BRAND } from '@/lib/constants/brand';
import { COMPANY } from '@/lib/constants/company';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with ${BRAND.name}.`,
};

export default function ContactPage() {
  return (
    <LegalPageShell
      title="Contact"
      description={`We would love to hear from you. Reach ${BRAND.name} using the details below.`}
    >
      <h2>General enquiries</h2>
      <p>
        Email:{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>
      <h2>Location</h2>
      <p>{COMPANY.locationLabel}</p>
    </LegalPageShell>
  );
}
