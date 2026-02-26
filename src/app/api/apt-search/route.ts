import { NextRequest, NextResponse } from 'next/server';
import { fetchMultiMonthTrades } from '@/lib/molit-api';
import { REGION_CODES } from '@/lib/region-codes';

// 특정 지역의 아파트 목록 검색
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code') || '';
  const q = (req.nextUrl.searchParams.get('q') || '').trim();

  if (!code || !REGION_CODES[code]) {
    return NextResponse.json({ apartments: [] });
  }

  const trades = await fetchMultiMonthTrades(code, 3);
  const aptMap = new Map<string, number>();
  for (const t of trades) {
    if (t.apartment) {
      aptMap.set(t.apartment, (aptMap.get(t.apartment) || 0) + 1);
    }
  }

  let apartments = Array.from(aptMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  if (q) {
    apartments = apartments.filter(a => a.name.includes(q));
  }

  return NextResponse.json({ apartments: apartments.slice(0, 20) });
}
