import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { BRAND, BRAND_SOCIAL } from '@/lib/constants/brand';
import { InstagramIcon, LinkedInIcon, TikTokIcon } from '@/components/social-icons';

const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  linkedin: LinkedInIcon,
} as const;

type FooterLink = {
  href: string;
  label: string;
  /** External affiliate/partner URL — renders a plain <a>, not Next Link. */
  external?: boolean;
};

const FOOTER_LINKS = {
  discover: [
    { href: '/brands', label: 'Alle merker' },
    { href: '/chat', label: 'AI-søk' },
    { href: '/shop', label: 'Handle' },
  ],
  company: [
    { href: '/about', label: 'Om oss' },
    { href: '/partner', label: 'Samarbeid' },
  ],
  resources: [
    { href: '/privacy', label: 'Personvern' },
    { href: '/terms', label: 'Vilkår' },
    { href: '/contact', label: 'Kontakt' },
    { href: '/faq', label: 'FAQ' },
  ],
} as const satisfies Record<string, readonly FooterLink[]>;

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly FooterLink[];
}) {
  return (
    <div>
      <h3 className="footer-col-title">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                className="footer-link"
                target="_blank"
                rel="noopener noreferrer sponsored"
              >
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className="footer-link">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// function XIcon({ className }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       aria-hidden
//       className={className}
//       fill="currentColor"
//     >
//       <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
//     </svg>
//   );
// }

export function Footer({ showCompareCta = true }: { showCompareCta?: boolean }) {
  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="section-container relative z-10 py-16 md:py-20 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,240px)_1fr] lg:gap-20 xl:grid-cols-[minmax(0,280px)_1fr]">
          <div className="flex flex-col gap-6">
            <BrandLogo
              variant="wordmark"
              theme="dark"
              className="site-footer-logo w-fit"
              imageClassName="site-footer-logo__image"
            />

            <ul className="-ml-2 flex items-center gap-1" aria-label="Clea i sosiale medier">
              {BRAND_SOCIAL.map((social) => {
                const Icon = SOCIAL_ICONS[social.id];
                return (
                  <li key={social.id}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-link"
                      aria-label={`Clea på ${social.label}`}
                      title={social.label}
                    >
                      <Icon className="size-[18px]" />
                    </a>
                  </li>
                );
              })}
            </ul>

            <p className="text-sm font-light text-muted-foreground">
              © 2026 {BRAND.name} · Alle rettigheter reservert
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:gap-x-10">
            <FooterColumn title="Oppdag" links={FOOTER_LINKS.discover} />
            <FooterColumn title="Selskap" links={FOOTER_LINKS.company} />
            <FooterColumn title="Ressurser" links={FOOTER_LINKS.resources} />
          </div>
        </div>

        {showCompareCta ? (
          <div className="mt-14 flex justify-center md:mt-20">
            <Link href="/chat" className="footer-cta-pill group">
              <span>Begynn å sammenligne priser</span>
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
