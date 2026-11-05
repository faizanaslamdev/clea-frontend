import type { Metadata } from 'next';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/page-layout';
import { GUIDES } from '@/lib/seo/guides';
import { socialMetadata } from '@/lib/seo/social';

const title = 'Shoppingguider – tips for å handle smartere på nett';
const description =
  'Guider fra Clea: slik sammenligner du priser, finner billige sneakers, velger vinterjakke og bruker prisvarsel og AI-moteassistent.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/guide' },
  ...socialMetadata({ title: `${title} | Clea`, description, path: '/guide' }),
};

export default function GuidesPage() {
  return (
    <PageLayout>
      <section className="section-container section-shell">
        <header className="mb-10 max-w-3xl">
          <h1 className="type-heading">Shoppingguider</h1>
          <p className="type-subheading mt-3">
            Enkle tips for å finne riktig vare og betale minst mulig.
          </p>
        </header>
        <ul className="grid gap-6 md:grid-cols-2">
          {GUIDES.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/guide/${guide.slug}`}
                className="block h-full rounded-2xl border border-border p-6 transition-colors hover:bg-muted/50"
              >
                <h2 className="text-lg font-medium text-foreground">{guide.title}</h2>
                <p className="mt-2 text-muted-foreground">{guide.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageLayout>
  );
}
