import { faqJsonLd, JsonLd } from '@/lib/seo/json-ld';
import type { CategoryContent } from '@/lib/seo/category-content';

/** Buying guide and FAQ under a category's products; server-rendered for search engines. */
export function CategoryGuide({ content }: { content: CategoryContent }) {
  return (
    <section className="section-container pb-16 md:pb-24" aria-labelledby="category-guide">
      <JsonLd data={faqJsonLd(content.faq)} />
      <div className="max-w-3xl space-y-4 text-muted-foreground">
        <h2 id="category-guide" className="type-subheading text-foreground">
          {content.heading}
        </h2>
        {content.paragraphs.map((text) => (
          <p key={text.slice(0, 32)}>{text}</p>
        ))}
        <div className="pt-4">
          <h3 className="mb-3 font-medium text-foreground">Ofte stilte spørsmål</h3>
          <div className="divide-y divide-border rounded-2xl border border-border">
            {content.faq.map((item) => (
              <details key={item.q} className="group px-5 py-4">
                <summary className="cursor-pointer list-none font-medium text-foreground">
                  {item.q}
                </summary>
                <p className="mt-2">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
