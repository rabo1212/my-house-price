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

export default function PriceChart({ trades }: { trades: Trade[] }) {
  if (!trades.length) return null;

  // 날짜별 평균가 계산
  const dateMap = new Map<string, { sum: number; count: number }>();
  for (const t of trades) {
    const key = t.date.slice(0, 7); // YYYY-MM
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
      <h3 className="font-semibold text-slate-700 mb-4">월별 평균 거래가</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#94A3B8' }}
            tickFormatter={v => v.slice(5) + '월'}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#94A3B8' }}
            tickFormatter={v => formatPrice(v)}
            width={80}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(v: any) => [formatPrice(v as number), '평균가']}
            labelFormatter={l => `${l}`}
            contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#2563EB"
            strokeWidth={2.5}
            dot={{ fill: '#2563EB', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
