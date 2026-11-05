import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageLayout } from '@/components/layout/page-layout';
import { BRAND } from '@/lib/constants/brand';
import { findGuide, GUIDES } from '@/lib/seo/guides';
import { articleJsonLd, breadcrumbJsonLd, JsonLd } from '@/lib/seo/json-ld';
import { socialMetadata } from '@/lib/seo/social';

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) return { title: 'Guide' };
  const path = `/guide/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: path },
    ...socialMetadata({ title: `${guide.title} | Clea`, description: guide.description, path }),
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) notFound();
  const path = `/guide/${guide.slug}`;

  return (
    <PageLayout>
      <JsonLd
        data={[
          articleJsonLd({
            url: `${BRAND.siteUrl}${path}`,
            title: guide.title,
            description: guide.description,
            published: guide.published,
            updated: guide.updated,
          }),
          breadcrumbJsonLd([
            { name: 'Clea', path: '/' },
            { name: 'Guider', path: '/guide' },
            { name: guide.title, path },
          ]),
        ]}
      />
      <article className="section-container section-shell">
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Brødsmuler" className="mb-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Clea</Link>
            <span aria-hidden="true"> / </span>
            <Link href="/guide" className="hover:text-foreground">Guider</Link>
          </nav>
          <h1 className="type-heading">{guide.title}</h1>
          <p className="type-subheading mt-4">{guide.intro}</p>

          <div className="mt-10 space-y-10 text-muted-foreground">
            {guide.sections.map((section) => (
              <section key={section.heading} className="space-y-3">
                <h2 className="text-xl font-medium text-foreground">{section.heading}</h2>
                {section.paragraphs?.map((text) => (
                  <p key={text.slice(0, 32)}>{text}</p>
                ))}
                {section.bullets ? (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.bullets.map((item) => (
                      <li key={item.slice(0, 32)}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            {guide.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-border px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/50"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="mt-12 text-sm text-muted-foreground">
            Oppdatert {new Date(guide.updated).toLocaleDateString('nb-NO', { dateStyle: 'long' })}
          </p>
        </div>
      </article>
    </PageLayout>
  );
}
