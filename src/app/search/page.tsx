'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import PriceChart from '@/components/PriceChart';
import TradeTable from '@/components/TradeTable';
import { formatPrice } from '@/lib/price-utils';

interface TradeData {
  region: string;
  regionCode: string;
  total: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  trades: { date: string; price: number; area_m2: number; floor: number; apartment: string; dong: string; build_year: number; price_per_pyeong: number; type: string }[];
  complexes: { name: string; count: number }[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '';
  const [data, setData] = useState<TradeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [months, setMonths] = useState(6);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    fetch(`/api/trades?code=${code}&months=${months}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [code, months]);

  if (!code) {
    return (
      <div className="space-y-6">
        <SearchBar size="lg" />
        <div className="text-center text-slate-400 py-16">지역을 검색해주세요</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SearchBar />

      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 mt-3">실거래 데이터 불러오는 중...</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* 지역 헤더 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{data.region}</h1>
              <p className="text-sm text-slate-500 mt-1">최근 {months}개월 · {data.total}건</p>
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

          {/* 통계 카드 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center">
              <div className="text-xs text-slate-500 mb-1">평균</div>
              <div className="font-bold text-lg text-slate-800 num">{formatPrice(data.avgPrice)}</div>
            </div>
            <div className="card text-center">
              <div className="text-xs text-slate-500 mb-1">최저</div>
              <div className="font-bold text-lg text-blue-600 num">{formatPrice(data.minPrice)}</div>
            </div>
            <div className="card text-center">
              <div className="text-xs text-slate-500 mb-1">최고</div>
              <div className="font-bold text-lg text-red-500 num">{formatPrice(data.maxPrice)}</div>
            </div>
          </div>

          {/* 차트 */}
          <PriceChart trades={data.trades} />

          {/* 단지별 거래 */}
          {data.complexes.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-slate-700 mb-3">단지별 거래 현황</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {data.complexes.map(c => (
                  <a
                    key={c.name}
                    href={`/apt/${data.regionCode}/${encodeURIComponent(c.name)}`}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-blue-50 text-sm"
                  >
                    <span className="font-medium text-slate-700 truncate">{c.name}</span>
                    <span className="text-xs text-slate-400 num ml-2 flex-shrink-0">{c.count}건</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 거래 테이블 */}
          <TradeTable trades={data.trades} regionCode={data.regionCode} />
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-slate-400">로딩중...</div>}>
      <SearchContent />
    </Suspense>
  );
}
