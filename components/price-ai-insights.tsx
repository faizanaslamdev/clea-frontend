'use client';

import { Product } from '@/lib/types';
import { getPriceAIInsights, getMatchTypeLabel } from '@/lib/services';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingDown, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

interface PriceAIInsightsProps {
  product: Product;
}

export function PriceAIInsightsPanel({ product }: PriceAIInsightsProps) {
  const ai = getPriceAIInsights(product);

  const verdictClass =
    ai.verdict === 'good_deal'
      ? 'border-accent/40 bg-accent/5 text-accent'
      : ai.verdict === 'above_average'
        ? 'border-destructive/30 bg-destructive/5 text-destructive'
        : 'border-primary/30 bg-primary/5 text-primary';

  const RecommendationIcon =
    ai.recommendation === 'buy_now' ? CheckCircle2 : Clock;

  return (
    <Card className="overflow-hidden border-border">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Price AI</h3>
            <p className="text-sm text-muted-foreground">
              Insights from collected price history
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs font-normal">
          Demo · tracked data only
        </Badge>
      </div>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          <span>{getMatchTypeLabel(product.matchType)}</span>
          <span className="text-muted-foreground/60">· SKU {product.sku}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className={`rounded-lg border p-4 ${verdictClass}`}>
            <p className="text-xs font-medium uppercase tracking-wide opacity-80">
              Price verdict
            </p>
            <p className="mt-1 text-lg font-bold">{ai.verdictLabel}</p>
            {ai.verdict === 'good_deal' && (
              <TrendingDown className="mt-2 h-5 w-5" />
            )}
            {ai.verdict === 'above_average' && (
              <TrendingUp className="mt-2 h-5 w-5" />
            )}
          </div>
          <div
            className={`rounded-lg border p-4 ${
              ai.recommendation === 'buy_now'
                ? 'border-accent/40 bg-accent/5'
                : 'border-muted-foreground/30 bg-muted/50'
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Recommendation
            </p>
            <div className="mt-1 flex items-center gap-2">
              <RecommendationIcon
                className={`h-5 w-5 ${
                  ai.recommendation === 'buy_now' ? 'text-accent' : 'text-muted-foreground'
                }`}
              />
              <p className="text-lg font-bold text-foreground">
                {ai.recommendationLabel}
              </p>
            </div>
          </div>
        </div>

        <p className="text-foreground">{ai.summary}</p>

        <ul className="space-y-2">
          {ai.insights.map((insight) => (
            <li
              key={insight}
              className="flex gap-2 text-sm text-muted-foreground"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {insight}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
