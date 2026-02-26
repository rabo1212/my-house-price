'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PriceChart from '@/components/PriceChart';
import PriceGauge from '@/components/PriceGauge';
import TradeTable from '@/components/TradeTable';
import MortgageCalculator from '@/components/MortgageCalculator';
import CashFlowAnalysis from '@/components/CashFlowAnalysis';
import { IconChevronRight, IconShare } from '@/components/icons';
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
  const [error, setError] = useState(false);
  const [months, setMonths] = useState(6);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/trades?code=${regionCode}&apt=${encodeURIComponent(aptName)}&months=${months}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [regionCode, aptName, months]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card p-6">
          <div className="skeleton h-8 w-48 mb-3" />
          <div className="skeleton h-4 w-64 mb-5" />
          <div className="grid grid-cols-3 gap-3">
            <div className="skeleton h-20" />
            <div className="skeleton h-20" />
            <div className="skeleton h-20" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><div className="skeleton h-80" /></div>
          <div className="skeleton h-80" />
        </div>
      </div>
    );
  }
  if (error) return <div className="card text-center py-16"><p className="text-rose-500 font-medium">데이터를 불러오지 못했습니다</p><button onClick={() => setMonths(m => m)} className="mt-3 text-sm text-indigo-600 hover:underline cursor-pointer">다시 시도</button></div>;
  if (!data) return <div className="card text-center py-16 text-gray-400">데이터를 불러올 수 없습니다</div>;

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
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{aptName}</h1>
            <p className="text-sm text-gray-500 mt-1">{data.region} · {buildYear ? `${buildYear}년 준공` : ''} · 최근 {months}개월 {data.total}건</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              aria-label="아파트 정보 공유"
              onClick={() => {
                const sortedTrades = [...data.trades].sort((a, b) => b.date.localeCompare(a.date));
                const halfIdx = Math.floor(sortedTrades.length / 2);
                const rh = sortedTrades.slice(0, halfIdx);
                const oh = sortedTrades.slice(halfIdx);
                const rhAvg = rh.length ? rh.reduce((s, t) => s + t.price, 0) / rh.length : 0;
                const ohAvg = oh.length ? oh.reduce((s, t) => s + t.price, 0) / oh.length : 0;
                const trendPctVal = ohAvg > 0 ? ((rhAvg - ohAvg) / ohAvg * 100).toFixed(1) : '0';

                const shareUrl = `${window.location.origin}/apt/${regionCode}/${encodeURIComponent(aptName)}`;
                const shareText = `${aptName} (${data.region}) 실거래가 평균 ${formatPrice(data.avgPrice)}`;

                if (navigator.share) {
                  navigator.share({ title: shareText, url: shareUrl }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                  setShared(true);
                  setTimeout(() => setShared(false), 2000);
                }
                console.log('trend:', trendPctVal);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl text-gray-600 hover:bg-indigo-50 cursor-pointer transition-all duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.5)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <IconShare className="w-4 h-4" />
              {shared ? '복사됨!' : '공유'}
            </button>
            <select aria-label="조회 기간" value={months} onChange={e => setMonths(Number(e.target.value))} className="text-sm rounded-xl px-3 py-2 text-gray-700 cursor-pointer" style={{ border: '1px solid rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.5)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <option value={3}>3개월</option><option value={6}>6개월</option><option value={12}>12개월</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-xl p-3 text-center" style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="text-xs text-gray-500">평균</div>
            <div className="font-bold text-gray-900 num mt-1">{formatPrice(data.avgPrice)}</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 3px rgba(99,102,241,0.06)' }}>
            <div className="text-xs text-gray-500">최저</div>
            <div className="font-bold text-indigo-600 num mt-1">{formatPrice(data.minPrice)}</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 3px rgba(244,63,94,0.06)' }}>
            <div className="text-xs text-gray-500">최고</div>
            <div className="font-bold text-rose-600 num mt-1">{formatPrice(data.maxPrice)}</div>
          </div>
        </div>
        {areas.length > 1 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">면적별 평균</h4>
            <div className="flex flex-wrap gap-2">
              {areas.map(a => (
                <div key={a.pyeong} className="rounded-xl px-3 py-2 text-sm" style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.04)' }}>
                  <span className="font-medium text-gray-700">{a.pyeong}평</span>
                  <span className="text-gray-500 ml-2 num">{formatPrice(a.avgPrice)}</span>
                  <span className="text-gray-400 ml-1 text-xs">({a.count}건)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart trades={data.trades} />
        </div>
        <PriceGauge trades={data.trades} avgPrice={data.avgPrice} minPrice={data.minPrice} maxPrice={data.maxPrice} />
      </div>
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
