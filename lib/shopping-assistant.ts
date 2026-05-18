import {
  formatPrice,
  getAllProducts,
  getLowestPriceStore,
  getPriceAIInsights,
  getProductById,
  getTrendingProducts,
  searchProducts,
} from './services';
import { Product } from './types';

export type AssistantMessageRole = 'assistant' | 'user';

export interface AssistantMessage {
  id: string;
  role: AssistantMessageRole;
  content: string;
  links?: { label: string; href: string }[];
}

export const ASSISTANT_NAME = 'Nora';
export const ASSISTANT_GREETING = `Hej! I'm ${ASSISTANT_NAME}, your Nordic shopping buddy. Ask me about deals, trending items, or whether to buy now — I only use prices we track in the demo.`;

export const QUICK_PROMPTS = [
  { label: '✨ Trending now', query: 'trending' },
  { label: '💄 Beauty deals', query: 'beauty deals' },
  { label: '👟 Cheapest shoes', query: 'cheapest shoes' },
  { label: '🧥 Fashion under 600', query: 'fashion under 600' },
] as const;

function productLink(product: Product) {
  return {
    label: `${product.name} — from ${formatPrice(product.lowestPrice)}`,
    href: `/product/${product.id}`,
  };
}

export function getAssistantReply(
  userMessage: string,
  contextProductId?: string
): AssistantMessage {
  const q = userMessage.trim().toLowerCase();

  if (!q) {
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Type a question or tap a quick suggestion below.',
    };
  }

  if (
    q.includes('trending') ||
    q.includes('popular') ||
    q.includes('hot')
  ) {
    const trending = getTrendingProducts(3);
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content:
        'These are trending across Nordic stores right now — great starting points for your wishlist:',
      links: trending.map(productLink),
    };
  }

  if (
    q.includes('wait') ||
    q.includes('buy now') ||
    q.includes('should i buy')
  ) {
    const product =
      (contextProductId ? getProductById(contextProductId) : undefined) ??
      getTrendingProducts(1)[0];

    if (product) {
      const ai = getPriceAIInsights(product);
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `For ${product.name}: ${ai.summary} Recommendation: ${ai.recommendationLabel}.`,
        links: [productLink(product)],
      };
    }
  }

  if (q.includes('beauty') || q.includes('skincare') || q.includes('makeup')) {
    const beauty = searchProducts('beauty')
      .slice(0, 3)
      .map((r) => r.product);
    const withDeals = beauty.filter((p) => p.savingsPercent >= 10);
    const picks = (withDeals.length ? withDeals : beauty).slice(0, 3);
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content:
        'Here are strong beauty picks with solid savings in our tracked prices:',
      links: picks.map(productLink),
    };
  }

  if (
    q.includes('shoe') ||
    q.includes('sneaker') ||
    q.includes('cheapest')
  ) {
    const shoes = searchProducts('shoe').map((r) => r.product);
    const sorted = [...shoes].sort((a, b) => a.lowestPrice - b.lowestPrice);
    const pick = sorted[0];
    if (pick) {
      const store = getLowestPriceStore(pick);
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Lowest tracked price for footwear: **${pick.name}** at ${formatPrice(pick.lowestPrice)}${store ? ` (${store.store.name})` : ''}.`,
        links: sorted.slice(0, 3).map(productLink),
      };
    }
  }

  if (q.includes('under') || q.match(/\d+/)) {
    const budget = parseInt(q.match(/\d+/)?.[0] ?? '600', 10);
    const affordable = getAllProducts()
      .filter((p) => p.lowestPrice <= budget)
      .sort((a, b) => b.savingsPercent - a.savingsPercent)
      .slice(0, 4);

    if (affordable.length) {
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Products at or below **${formatPrice(budget)}** with the best savings:`,
        links: affordable.map(productLink),
      };
    }
  }

  const results = searchProducts(q).slice(0, 4);
  if (results.length) {
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `I found ${results.length} match${results.length > 1 ? 'es' : ''} for you:`,
      links: results.map((r) => productLink(r.product)),
    };
  }

  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content:
      "I couldn't find an exact match. Try searching by category (Fashion, Beauty), brand, or ask for **trending** picks.",
    links: [
      { label: 'Browse all products', href: '/search' },
      { label: 'See trending', href: '/trending' },
    ],
  };
}
