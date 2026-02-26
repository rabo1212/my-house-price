import { NextRequest, NextResponse } from 'next/server';
import { fetchMultiMonthTrades } from '@/lib/molit-api';
import { REGION_CODES, NAME_TO_CODE } from '@/lib/region-codes';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  let code = searchParams.get('code') || '';
  const apt = searchParams.get('apt') || '';
  const rawMonths = parseInt(searchParams.get('months') || '6');
  const months = Math.min(Math.max(isNaN(rawMonths) ? 6 : rawMonths, 1), 12);

  // 이름으로도 검색 가능
  if (!code && searchParams.get('region')) {
    code = NAME_TO_CODE[searchParams.get('region')!] || '';
  }

  if (!code || !REGION_CODES[code]) {
    return NextResponse.json({ error: 'Invalid region code' }, { status: 400 });
  }

  const trades = await fetchMultiMonthTrades(code, Math.min(months, 12));
  const filtered = apt ? trades.filter(t => t.apartment.includes(apt)) : trades;

  // 통계
  const prices = filtered.map(t => t.price);
  const avg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

  // 단지 목록
  const complexMap = new Map<string, number>();
  for (const t of filtered) complexMap.set(t.apartment, (complexMap.get(t.apartment) || 0) + 1);
  const complexes = Array.from(complexMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    region: REGION_CODES[code],
    regionCode: code,
    aptFilter: apt || null,
    total: filtered.length,
    avgPrice: avg,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    trades: filtered.slice(0, 100),
    complexes: complexes.slice(0, 30),
  });
}
