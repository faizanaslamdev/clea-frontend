import { formatPrice } from '@/lib/domain/format';
import { getLowestPriceStore } from '@/lib/domain/products/comparison';
import type { PriceAIInsights, Product } from '@/lib/types';

export function getPriceAIInsights(product: Product): PriceAIInsights {
  const history = product.priceHistory;
  const last7 = history.slice(-7).map((p) => p.price);
  const last30 = history.map((p) => p.price);
  const avg7 = last7.reduce((a, b) => a + b, 0) / last7.length;
  const avg30 = last30.reduce((a, b) => a + b, 0) / last30.length;
  const current = product.lowestPrice;
  const comparedToAveragePercent = Math.round(
    ((current - avg30) / avg30) * 100
  );
  const trend7 =
    last7.length >= 2 ? last7[last7.length - 1] - last7[0] : 0;
  const lowestStore = getLowestPriceStore(product);

  let verdict: PriceAIInsights['verdict'] = 'fair';
  let verdictLabel = 'Fair price';
  if (comparedToAveragePercent <= -5) {
    verdict = 'good_deal';
    verdictLabel = 'Below 30-day average';
  } else if (comparedToAveragePercent >= 8) {
    verdict = 'above_average';
    verdictLabel = 'Above recent average';
  }

  let recommendation: PriceAIInsights['recommendation'] = 'buy_now';
  let recommendationLabel = 'Buy now';
  if (trend7 > 0 && comparedToAveragePercent > 3) {
    recommendation = 'wait';
    recommendationLabel = 'Consider waiting';
  } else if (verdict === 'good_deal' && trend7 <= 0) {
    recommendation = 'buy_now';
    recommendationLabel = 'Good time to buy';
  }

  const insights: string[] = [
    `Current lowest price is ${formatPrice(current)} — ${Math.abs(comparedToAveragePercent)}% ${comparedToAveragePercent <= 0 ? 'below' : 'above'} the 30-day tracked average (${formatPrice(Math.round(avg30))}).`,
    `7-day average: ${formatPrice(Math.round(avg7))}. Price trend over the last week: ${trend7 < 0 ? 'falling' : trend7 > 0 ? 'rising' : 'stable'}.`,
  ];

  if (lowestStore) {
    insights.push(
      `Best deal right now at ${lowestStore.store.name} (${formatPrice(lowestStore.price)}).`
    );
  }

  if (product.savingsPercent >= 15) {
    insights.push(
      `You can save up to ${product.savingsPercent}% vs the highest listed store price.`
    );
  }

  const summary =
    recommendation === 'buy_now'
      ? verdict === 'good_deal'
        ? 'Based on collected price history, this is one of the better prices we have seen recently.'
        : 'Current pricing is in line with recent trends. If you need it now, buying is reasonable.'
      : 'Prices have been trending up recently. Waiting may yield a better deal if history repeats.';

  return {
    verdict,
    verdictLabel,
    recommendation,
    recommendationLabel,
    summary,
    insights,
    comparedToAveragePercent,
  };
}
