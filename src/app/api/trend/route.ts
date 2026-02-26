import { NextRequest, NextResponse } from 'next/server';
import { fetchMultiMonthTrades, runWithConcurrency } from '@/lib/molit-api';
import { REGION_CODES } from '@/lib/region-codes';

export async function GET(req: NextRequest) {
  const rawMonths = parseInt(req.nextUrl.searchParams.get('months') || '6');
  const months = Math.min(Math.max(isNaN(rawMonths) ? 6 : rawMonths, 1), 12);
  const itemsParam = req.nextUrl.searchParams.get('items') || '';

  if (!itemsParam) {
    return NextResponse.json({ items: [], months });
  }

  let items: { code: string; apt?: string }[];
  try {
    items = itemsParam.split(',').slice(0, 5).map(raw => {
      const [code, apt] = raw.split(':');
      return { code: code.trim(), apt: apt ? decodeURIComponent(apt.trim()) : undefined };
    }).filter(i => REGION_CODES[i.code]);
  } catch {
    return NextResponse.json({ error: 'Invalid parameter encoding' }, { status: 400 });
  }

  const tasks = items.map((item) => async () => {
    let trades = await fetchMultiMonthTrades(item.code, months);

    if (item.apt) {
      trades = trades.filter(t => t.apartment === item.apt);
    }

    const label = item.apt
      ? `${item.apt} (${REGION_CODES[item.code]})`
      : REGION_CODES[item.code];

    const monthMap = new Map<string, { sum: number; count: number }>();
    for (const t of trades) {
      const key = t.date.slice(0, 7);
      const cur = monthMap.get(key) || { sum: 0, count: 0 };
      cur.sum += t.price;
      cur.count += 1;
      monthMap.set(key, cur);
    }

    const monthly = Array.from(monthMap.entries())
      .map(([month, { sum, count }]) => ({ month, avg: Math.round(sum / count), count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const prices = trades.map(t => t.price);
    const avg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

    return {
      code: item.code,
      apt: item.apt,
      label,
      total: trades.length,
      avgPrice: avg,
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      monthly,
    };
  });

  const results = await runWithConcurrency(tasks, 2);

  return NextResponse.json({ items: results, months });
}
