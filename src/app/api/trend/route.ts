import { NextRequest, NextResponse } from 'next/server';
import { fetchMultiMonthTrades } from '@/lib/molit-api';
import { REGION_CODES } from '@/lib/region-codes';

// items 형식: "11680,11650:래미안원베일리,41135" (코드 또는 코드:아파트명)
export async function GET(req: NextRequest) {
  const months = Math.min(parseInt(req.nextUrl.searchParams.get('months') || '6'), 12);
  const itemsParam = req.nextUrl.searchParams.get('items') || '';

  if (!itemsParam) {
    return NextResponse.json({ items: [], months });
  }

  const items = itemsParam.split(',').slice(0, 5).map(raw => {
    const [code, apt] = raw.split(':');
    return { code: code.trim(), apt: apt ? decodeURIComponent(apt.trim()) : undefined };
  }).filter(i => REGION_CODES[i.code]);

  const results = await Promise.all(
    items.map(async (item) => {
      let trades = await fetchMultiMonthTrades(item.code, months);

      // 아파트 필터링
      if (item.apt) {
        trades = trades.filter(t => t.apartment === item.apt);
      }

      const label = item.apt
        ? `${item.apt} (${REGION_CODES[item.code]})`
        : REGION_CODES[item.code];

      // 월별 평균가
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
    })
  );

  return NextResponse.json({ items: results, months });
}
