import { NextRequest, NextResponse } from 'next/server';
import { fetchMultiMonthTrades, runWithConcurrency } from '@/lib/molit-api';
import { SIDO_LIST } from '@/lib/region-codes';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sidoCode = req.nextUrl.searchParams.get('sido') || '11';
  const sido = SIDO_LIST.find(s => s.code === sidoCode);
  if (!sido) {
    return NextResponse.json({ regions: [], updatedAt: new Date().toISOString() });
  }

  const codes = Object.keys(sido.regions);
  const sidoShort = sido.name.replace(/특별자치시|특별자치도|특별시|광역시|도$/g, '');

  const tasks = codes.map((code) => async () => {
    const trades = await fetchMultiMonthTrades(code, 3);
    const pyeongPrices = trades
      .filter(t => t.price_per_pyeong > 0)
      .map(t => t.price_per_pyeong);

    const avgPyeong = pyeongPrices.length
      ? Math.round(pyeongPrices.reduce((a, b) => a + b, 0) / pyeongPrices.length)
      : 0;

    const regionName = sido.regions[code];
    const fullName = sido.code === '11' ? regionName : `${sidoShort} ${regionName}`;

    return {
      code,
      name: fullName,
      avgPricePerPyeong: avgPyeong,
      tradeCount: trades.length,
    };
  });

  const results = await runWithConcurrency(tasks, 3);

  return NextResponse.json({
    sido: sidoCode,
    sidoName: sido.name,
    regions: results.filter(r => r.tradeCount > 0),
    updatedAt: new Date().toISOString(),
  });
}
