'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PriceChart from '@/components/PriceChart';
import TradeTable from '@/components/TradeTable';
import MortgageCalculator from '@/components/MortgageCalculator';
import CashFlowAnalysis from '@/components/CashFlowAnalysis';
import { formatPrice, m2ToPyeong } from '@/lib/price-utils';

interface Trade {
  date: string;
  price: number;
  area_m2: number;
  floor: number;
  apartment: string;
  dong: string;
  build_year: number;
  price_per_pyeong: number;
  type: string;
}

interface TradeData {
  region: string;
  regionCode: string;
  total: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  trades: Trade[];
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
        <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 mt-3">데이터 불러오는 중...</p>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-16 text-slate-400">데이터를 불러올 수 없습니다</div>;
  }

  // 면적별 분류
  const areaMap = new Map<number, { count: number; avgPrice: number; prices: number[] }>();
  for (const t of data.trades) {
    const pyeong = Math.round(m2ToPyeong(t.area_m2));
    const cur = areaMap.get(pyeong) || { count: 0, avgPrice: 0, prices: [] };
    cur.count += 1;
    cur.prices.push(t.price);
    areaMap.set(pyeong, cur);
  }
  const areas = Array.from(areaMap.entries())
    .map(([pyeong, v]) => ({
      pyeong,
      count: v.count,
      avgPrice: Math.round(v.prices.reduce((a, b) => a + b, 0) / v.prices.length),
    }))
    .sort((a, b) => a.pyeong - b.pyeong);

  const buildYear = data.trades[0]?.build_year;

  return (
    <div className="space-y-6">
      {/* 브레드크럼 */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-blue-600">홈</Link>
        <span>/</span>
        <Link href={`/search?code=${regionCode}`} className="hover:text-blue-600">{data.region}</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">{aptName}</span>
      </div>

      {/* 아파트 헤더 */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{aptName}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {data.region} · {buildYear ? `${buildYear}년 준공` : ''} · 최근 {months}개월 {data.total}건
            </p>
          </div>
          <select
            value={months}
            onChange={e => setMonths(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value={3}>3개월</option>
            <option value={6}>6개월</option>
            <option value={12}>12개월</option>
          </select>
        </div>

        {/* 가격 통계 */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500">평균</div>
            <div className="font-bold text-slate-800 num mt-1">{formatPrice(data.avgPrice)}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500">최저</div>
            <div className="font-bold text-blue-600 num mt-1">{formatPrice(data.minPrice)}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500">최고</div>
            <div className="font-bold text-red-500 num mt-1">{formatPrice(data.maxPrice)}</div>
          </div>
        </div>

        {/* 면적별 */}
        {areas.length > 1 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-slate-600 mb-2">면적별 평균</h4>
            <div className="flex flex-wrap gap-2">
              {areas.map(a => (
                <div key={a.pyeong} className="bg-slate-50 rounded-lg px-3 py-2 text-sm">
                  <span className="font-medium text-slate-700">{a.pyeong}평</span>
                  <span className="text-slate-500 ml-2 num">{formatPrice(a.avgPrice)}</span>
                  <span className="text-slate-400 ml-1 text-xs">({a.count}건)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 차트 */}
      <PriceChart trades={data.trades} />

      {/* 거래 테이블 + 계산기 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TradeTable trades={data.trades} regionCode={regionCode} showAptLink={false} />
        </div>
        <div className="space-y-6">
          <MortgageCalculator initialPrice={data.avgPrice} />
          <CashFlowAnalysis
            price={data.avgPrice}
            ltv={70}
            rate={3.5}
            years={30}
          />
        </div>
      </div>
    </div>
  );
}
