'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Product } from '@/lib/types';
import { getPriceChartData } from '@/lib/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PriceChartProps {
  product: Product;
}

type HistoryPeriod = 7 | 15 | 30;

export function PriceChart({ product }: PriceChartProps) {
  const [period, setPeriod] = useState<HistoryPeriod>(30);
  const data = getPriceChartData(product.id, period);

  if (!data || data.length === 0) {
    return null;
  }

  const groupedData = data.reduce(
    (acc, item) => {
      const existing = acc.find((d) => d.date === item.date);
      if (existing) {
        existing.price = Math.round((existing.price + item.price) / 2);
      } else {
        acc.push({
          date: item.date,
          price: Math.round(item.price),
        });
      }
      return acc;
    },
    [] as Array<{ date: string; price: number }>
  );

  const periods: { label: string; value: HistoryPeriod }[] = [
    { label: '7 days', value: 7 },
    { label: '15 days', value: 15 },
    { label: '30 days', value: 30 },
  ];

  return (
    <Card className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold text-lg text-foreground">
          Price History
        </h3>
                <div className="flex gap-2">
          {periods.map(({ label, value }) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={period === value ? 'default' : 'outline'}
              onClick={() => setPeriod(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={groupedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              stroke="var(--muted-foreground)"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              style={{ fontSize: '12px' }}
              label={{ value: 'Price (SEK)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--card-foreground)',
              }}
              formatter={(value) => `${value} SEK`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="var(--primary)"
              dot={{ fill: 'var(--primary)', r: 4 }}
              activeDot={{ r: 6 }}
              strokeWidth={2}
              name="Lowest tracked price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6">
        <div>
          <p className="text-xs text-muted-foreground">Highest</p>
          <p className="text-lg font-bold text-foreground">
            {Math.max(...groupedData.map((d) => d.price))} SEK
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Lowest</p>
          <p className="text-lg font-bold text-foreground">
            {Math.min(...groupedData.map((d) => d.price))} SEK
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Trend</p>
          <p className="text-lg font-bold text-accent">
            {groupedData[groupedData.length - 1].price > groupedData[0].price
              ? '↑ Up'
              : '↓ Down'}
          </p>
        </div>
      </div>
    </Card>
  );
}
