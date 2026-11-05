import type { Metadata } from 'next';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/page-layout';
import { getProductBrands, type ProductBrand } from '@/lib/domain/brands/product-brands';
import { socialMetadata } from '@/lib/seo/social';

export const revalidate = 86400;

const title = 'Merker A–Å – sammenlign priser på populære merker';
const description =
  'Alle merkene på Clea fra A til Å: adidas, Nike, H&M, Ralph Lauren, Fjällräven og hundrevis til. Se produktene og sammenlign prisene i flere nettbutikker.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/merker' },
  ...socialMetadata({ title: `${title} | Clea`, description, path: '/merker' }),
};

function groupByLetter(brands: ProductBrand[]): Array<[string, ProductBrand[]]> {
  const groups = new Map<string, ProductBrand[]>();
  for (const brand of [...brands].sort((a, b) => a.name.localeCompare(b.name, 'nb'))) {
    const first = brand.name.charAt(0).toUpperCase();
    const letter = /[A-ZÆØÅ]/.test(first) ? first : '#';
    groups.set(letter, [...(groups.get(letter) ?? []), brand]);
  }
  return [...groups.entries()].sort(([a], [b]) =>
    a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b, 'nb'),
  );
}

export default async function BrandsAtoZPage() {
  const brands = await getProductBrands().catch(() => []);
  const groups = groupByLetter(brands);

  return (
    <PageLayout>
      <section className="section-container section-shell">
        <header className="mb-10 max-w-3xl">
          <h1 className="type-heading">Merker A–Å</h1>
          <p className="type-subheading mt-3">
            {brands.length} merker fra butikkene på Clea. Velg et merke for å se produktene og
            sammenligne prisene.
          </p>
        </header>

        {groups.length === 0 ? (
          <p className="text-muted-foreground">Kunne ikke laste merkene. Prøv igjen senere.</p>
        ) : (
          <div className="space-y-10">
            {groups.map(([letter, items]) => (
              <section key={letter} aria-labelledby={`merker-${letter}`}>
                <h2 id={`merker-${letter}`} className="mb-4 text-xl font-medium">
                  {letter}
                </h2>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
                  {items.map((brand) => (
                    <li key={brand.slug}>
                      <Link
                        href={`/merker/${brand.slug}`}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {brand.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </section>
    </PageLayout>
  );
}
