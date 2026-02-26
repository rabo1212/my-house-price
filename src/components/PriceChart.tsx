'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatPrice } from '@/lib/price-utils';

interface Trade {
  date: string;
  price: number;
  apartment: string;
  area_m2: number;
  floor: number;
}

export default function PriceChart({ trades, title = '월별 평균 거래가' }: { trades: Trade[]; title?: string }) {
  if (!trades.length) return null;

  const dateMap = new Map<string, { sum: number; count: number }>();
  for (const t of trades) {
    const key = t.date.slice(0, 7);
    const cur = dateMap.get(key) || { sum: 0, count: 0 };
    cur.sum += t.price;
    cur.count += 1;
    dateMap.set(key, cur);
  }

  const data = Array.from(dateMap.entries())
    .map(([month, { sum, count }]) => ({
      month,
      avg: Math.round(sum / count),
      count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  if (data.length < 2) return null;

  return (
    <div className="card">
      <h3 className="font-semibold text-teal-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#CCFBF1" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#5F7A76' }}
            tickFormatter={v => v.slice(5) + '월'}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#5F7A76' }}
            tickFormatter={v => formatPrice(v)}
            width={80}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(v: any) => [formatPrice(v as number), '평균가']}
            labelFormatter={l => `${l}`}
            contentStyle={{ borderRadius: '12px', border: '1px solid #CCFBF1', fontSize: '13px', color: '#134E4A' }}
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#0F766E"
            strokeWidth={2.5}
            dot={{ fill: '#0F766E', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#14B8A6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
