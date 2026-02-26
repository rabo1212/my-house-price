import { NextResponse } from 'next/server';
import { fetchMultiMonthTrades, runWithConcurrency } from '@/lib/molit-api';
import { REGION_CODES } from '@/lib/region-codes';

export const dynamic = 'force-dynamic';

export async function GET() {
  const codes = Object.keys(REGION_CODES);

  const tasks = codes.map((code) => async () => {
    const trades = await fetchMultiMonthTrades(code, 3);
    const pyeongPrices = trades
      .filter(t => t.price_per_pyeong > 0)
      .map(t => t.price_per_pyeong);

    const avgPyeong = pyeongPrices.length
      ? Math.round(pyeongPrices.reduce((a, b) => a + b, 0) / pyeongPrices.length)
      : 0;

    return {
      code,
      name: REGION_CODES[code],
      avgPricePerPyeong: avgPyeong,
      tradeCount: trades.length,
    };
  });

  const results = await runWithConcurrency(tasks, 3);

  return NextResponse.json({
    regions: results.filter(r => r.tradeCount > 0),
    updatedAt: new Date().toISOString(),
  });
}
