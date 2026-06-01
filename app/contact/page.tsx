import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/legal/legal-page-shell';
import { BRAND } from '@/lib/constants/brand';
import { COMPANY, formatCompanyAddress } from '@/lib/constants/company';

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
      <h2>Postal address</h2>
      <p>
        {COMPANY.name}
        <br />
        {COMPANY.address.line1}
        <br />
        {COMPANY.address.postalCode} {COMPANY.address.city}
        <br />
        {COMPANY.address.country}
      </p>
      <h2>Location</h2>
      <p>{COMPANY.locationLabel}</p>
      <p className="text-muted-foreground text-sm">{formatCompanyAddress()}</p>
    </LegalPageShell>
  );
}
