import { NextRequest, NextResponse } from 'next/server';
import { fetchMultiMonthTrades } from '@/lib/molit-api';
import { POPULAR_REGIONS, REGION_CODES } from '@/lib/region-codes';

export async function GET(req: NextRequest) {
  const months = Math.min(parseInt(req.nextUrl.searchParams.get('months') || '6'), 12);
  const codesParam = req.nextUrl.searchParams.get('codes');

  const regions = codesParam
    ? codesParam.split(',').filter(c => REGION_CODES[c]).map(code => ({ code, name: REGION_CODES[code] }))
    : POPULAR_REGIONS.slice(0, 6);

  const results = await Promise.all(
    regions.map(async (r) => {
      const trades = await fetchMultiMonthTrades(r.code, months);

      // 월별 평균가 계산
      const monthMap = new Map<string, { sum: number; count: number }>();
      for (const t of trades) {
        const key = t.date.slice(0, 7);
        const cur = monthMap.get(key) || { sum: 0, count: 0 };
        cur.sum += t.price;
        cur.count += 1;
        monthMap.set(key, cur);
      }

      const monthly = Array.from(monthMap.entries())
        .map(([month, { sum, count }]) => ({
          month,
          avg: Math.round(sum / count),
          count,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      const prices = trades.map(t => t.price);
      const avg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

      return {
        code: r.code,
        name: r.name,
        total: trades.length,
        avgPrice: avg,
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        monthly,
      };
    })
  );

  return NextResponse.json({ regions: results, months });
}
