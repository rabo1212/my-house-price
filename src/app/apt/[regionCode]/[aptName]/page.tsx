'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PriceChart from '@/components/PriceChart';
import TradeTable from '@/components/TradeTable';
import MortgageCalculator from '@/components/MortgageCalculator';
import CashFlowAnalysis from '@/components/CashFlowAnalysis';
import { IconChevronRight } from '@/components/icons';
import { formatPrice, m2ToPyeong } from '@/lib/price-utils';

interface Trade {
  date: string; price: number; area_m2: number; floor: number;
  apartment: string; dong: string; build_year: number; price_per_pyeong: number; type: string;
}
interface TradeData {
  region: string; regionCode: string; total: number;
  avgPrice: number; minPrice: number; maxPrice: number; trades: Trade[];
}

export default function AptDetailPage() {
  const params = useParams();
  const regionCode = params.regionCode as string;
  const aptName = decodeURIComponent(params.aptName as string);
  const [data, setData] = useState<TradeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(6);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/trades?code=${regionCode}&apt=${encodeURIComponent(aptName)}&months=${months}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [regionCode, aptName, months]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 mt-3">데이터 불러오는 중...</p>
      </div>
    );
  }
  if (!data) return <div className="text-center py-16 text-gray-400">데이터를 불러올 수 없습니다</div>;

  const areaMap = new Map<number, { count: number; prices: number[] }>();
  for (const t of data.trades) {
    const pyeong = Math.round(m2ToPyeong(t.area_m2));
    const cur = areaMap.get(pyeong) || { count: 0, prices: [] };
    cur.count += 1; cur.prices.push(t.price); areaMap.set(pyeong, cur);
  }
  const areas = Array.from(areaMap.entries())
    .map(([pyeong, v]) => ({ pyeong, count: v.count, avgPrice: Math.round(v.prices.reduce((a, b) => a + b, 0) / v.prices.length) }))
    .sort((a, b) => a.pyeong - b.pyeong);
  const buildYear = data.trades[0]?.build_year;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-400">
        <Link href="/" className="hover:text-indigo-600 cursor-pointer transition-colors duration-200">홈</Link>
        <IconChevronRight className="w-3.5 h-3.5" />
        <Link href={`/search?code=${regionCode}`} className="hover:text-indigo-600 cursor-pointer transition-colors duration-200">{data.region}</Link>
        <IconChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800 font-medium">{aptName}</span>
      </nav>

      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{aptName}</h1>
            <p className="text-sm text-gray-500 mt-1">{data.region} · {buildYear ? `${buildYear}년 준공` : ''} · 최근 {months}개월 {data.total}건</p>
          </div>
          <select value={months} onChange={e => setMonths(Number(e.target.value))} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 cursor-pointer">
            <option value={3}>3개월</option><option value={6}>6개월</option><option value={12}>12개월</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">평균</div>
            <div className="font-bold text-gray-900 num mt-1">{formatPrice(data.avgPrice)}</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">최저</div>
            <div className="font-bold text-indigo-600 num mt-1">{formatPrice(data.minPrice)}</div>
          </div>
          <div className="bg-rose-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">최고</div>
            <div className="font-bold text-rose-600 num mt-1">{formatPrice(data.maxPrice)}</div>
          </div>
        </div>
        {areas.length > 1 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">면적별 평균</h4>
            <div className="flex flex-wrap gap-2">
              {areas.map(a => (
                <div key={a.pyeong} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <span className="font-medium text-gray-700">{a.pyeong}평</span>
                  <span className="text-gray-500 ml-2 num">{formatPrice(a.avgPrice)}</span>
                  <span className="text-gray-400 ml-1 text-xs">({a.count}건)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <PriceChart trades={data.trades} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><TradeTable trades={data.trades} regionCode={regionCode} showAptLink={false} /></div>
        <div className="space-y-6">
          <MortgageCalculator initialPrice={data.avgPrice} />
          <CashFlowAnalysis price={data.avgPrice} ltv={70} rate={3.5} years={30} />
        </div>
      </div>
    </div>
  );
}
