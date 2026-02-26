'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import PriceChart from '@/components/PriceChart';
import TradeTable from '@/components/TradeTable';
import { IconBuilding } from '@/components/icons';
import { formatPrice } from '@/lib/price-utils';

interface Trade {
  date: string; price: number; area_m2: number; floor: number;
  apartment: string; dong: string; build_year: number; price_per_pyeong: number; type: string;
}
interface TradeData {
  region: string; regionCode: string; total: number;
  avgPrice: number; minPrice: number; maxPrice: number;
  trades: Trade[]; complexes: { name: string; count: number }[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '';
  const [data, setData] = useState<TradeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [months, setMonths] = useState(6);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    setError(false);
    fetch(`/api/trades?code=${code}&months=${months}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [code, months]);

  if (!code) {
    return (
      <div className="space-y-6">
        <SearchBar size="lg" />
        <div className="card text-center text-gray-400 py-16">지역을 검색해주세요</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SearchBar />
      {loading && (
        <div className="space-y-4">
          <div className="card p-6">
            <div className="skeleton h-8 w-40 mb-3" />
            <div className="skeleton h-4 w-56" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="skeleton h-20 rounded-2xl" />
            <div className="skeleton h-20 rounded-2xl" />
            <div className="skeleton h-20 rounded-2xl" />
          </div>
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      )}
      {error && !loading && (
        <div className="card text-center py-16">
          <p className="text-rose-500 font-medium">데이터를 불러오지 못했습니다</p>
          <button onClick={() => setMonths(m => m)} className="mt-3 text-sm text-indigo-600 hover:underline cursor-pointer">다시 시도</button>
        </div>
      )}
      {data && !loading && !error && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{data.region}</h1>
              <p className="text-sm text-gray-500 mt-1">최근 {months}개월 · {data.total}건</p>
            </div>
            <select aria-label="조회 기간" value={months} onChange={e => setMonths(Number(e.target.value))} className="text-sm rounded-xl px-3 py-2 text-gray-700 cursor-pointer" style={{ border: '1px solid rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.5)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <option value={3}>3개월</option>
              <option value={6}>6개월</option>
              <option value={12}>12개월</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center py-4">
              <div className="text-xs text-gray-500 mb-1">평균</div>
              <div className="font-bold text-lg text-gray-900 num">{formatPrice(data.avgPrice)}</div>
            </div>
            <div className="card text-center py-4" style={{ background: 'linear-gradient(135deg, rgba(238,242,255,0.7), rgba(224,231,255,0.7))' }}>
              <div className="text-xs text-gray-500 mb-1">최저</div>
              <div className="font-bold text-lg text-indigo-600 num">{formatPrice(data.minPrice)}</div>
            </div>
            <div className="card text-center py-4" style={{ background: 'linear-gradient(135deg, rgba(255,241,242,0.7), rgba(255,228,230,0.7))' }}>
              <div className="text-xs text-gray-500 mb-1">최고</div>
              <div className="font-bold text-lg text-rose-600 num">{formatPrice(data.maxPrice)}</div>
            </div>
          </div>
          <PriceChart trades={data.trades} />
          {data.complexes.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-3">단지별 거래 현황</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {data.complexes.map(c => (
                  <a key={c.name} href={`/apt/${data.regionCode}/${encodeURIComponent(c.name)}`} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-indigo-50/60 text-sm cursor-pointer transition-colors duration-150">
                    <IconBuilding className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-700 truncate">{c.name}</span>
                    <span className="text-xs text-gray-400 num ml-auto flex-shrink-0">{c.count}건</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          <TradeTable trades={data.trades} regionCode={data.regionCode} />
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="space-y-4"><div className="skeleton h-12 rounded-2xl" /><div className="skeleton h-64 rounded-2xl" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
