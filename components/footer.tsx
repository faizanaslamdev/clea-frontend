import Link from 'next/link';
import { ArrowRight, Instagram, Linkedin } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';

const FOOTER_LINKS = {
  shopping: [
    { href: '/brands', label: 'All brands' },
    { href: '/#brands', label: 'Featured brands' },
    { href: '/brands', label: 'Compare prices' },
  ],
  explore: [
    { href: '/brands', label: 'Fashion brands' },
    { href: '/brands', label: 'Beauty brands' },
    { href: '/#brands', label: 'Shop brands' },
  ],
  company: [
    { href: '#', label: 'About' },
    { href: '#', label: 'Partner' },
    { href: '#', label: 'Careers' },
    { href: '#', label: 'Press' },
  ],
  resources: [
    { href: '#', label: 'Privacy' },
    { href: '#', label: 'Terms' },
    { href: '#', label: 'Contact' },
    { href: '#', label: 'FAQ' },
  ],
} as const;

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="footer-col-title">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="footer-link">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="site-footer" aria-label="Site footer">
      {/* <p className="site-footer-watermark" aria-hidden>
        Clea
      </p> */}

      <div className="section-container relative z-10 py-16 md:py-20 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,240px)_1fr] lg:gap-20 xl:grid-cols-[minmax(0,280px)_1fr]">
          <div className="flex flex-col gap-6">
            <Link href="/" className="site-footer-brand w-fit">
              {BRAND.wordmark}
            </Link>

            <div className="flex items-center gap-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Instagram"
              >
                <Instagram className="size-[18px]" strokeWidth={1.5} />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="X"
              >
                <XIcon className="size-[17px]" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-[18px]" strokeWidth={1.5} />
              </a>
            </div>

            <p className="text-sm font-light text-muted-foreground">
              © 2026 · All rights reserved
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 sm:gap-x-6">
            <FooterColumn title="Shopping" links={FOOTER_LINKS.shopping} />
            <FooterColumn title="Explore" links={FOOTER_LINKS.explore} />
            <FooterColumn title="Company" links={FOOTER_LINKS.company} />
            <FooterColumn title="Resources" links={FOOTER_LINKS.resources} />
          </div>
        </div>

        <div className="mt-14 flex justify-center md:mt-20">
          <Link href="/brands" className="footer-cta-pill group">
            <span>Start comparing prices</span>
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={1.5}
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
