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
  trades: Trade[];
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
        <div className="text-center text-teal-500/60 py-16">지역을 검색해주세요</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SearchBar />

      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-teal-600/60 mt-3">실거래 데이터 불러오는 중...</p>
        </div>
      )}

      {data && !loading && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-teal-900">{data.region}</h1>
              <p className="text-sm text-teal-600/60 mt-1">최근 {months}개월 · {data.total}건</p>
            </div>
            <select
              value={months}
              onChange={e => setMonths(Number(e.target.value))}
              className="text-sm border border-teal-200 rounded-lg px-3 py-2 bg-white text-teal-800 cursor-pointer"
            >
              <option value={3}>3개월</option>
              <option value={6}>6개월</option>
              <option value={12}>12개월</option>
            </select>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center py-4">
              <div className="text-xs text-teal-600 mb-1">평균</div>
              <div className="font-bold text-lg text-teal-900 num">{formatPrice(data.avgPrice)}</div>
            </div>
            <div className="card text-center py-4">
              <div className="text-xs text-teal-600 mb-1">최저</div>
              <div className="font-bold text-lg text-sky-700 num">{formatPrice(data.minPrice)}</div>
            </div>
            <div className="card text-center py-4">
              <div className="text-xs text-teal-600 mb-1">최고</div>
              <div className="font-bold text-lg text-rose-600 num">{formatPrice(data.maxPrice)}</div>
            </div>
          </div>

          <PriceChart trades={data.trades} />

          {data.complexes.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-teal-900 mb-3">단지별 거래 현황</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {data.complexes.map(c => (
                  <a
                    key={c.name}
                    href={`/apt/${data.regionCode}/${encodeURIComponent(c.name)}`}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-teal-50 text-sm cursor-pointer transition-colors duration-150"
                  >
                    <IconBuilding className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <span className="font-medium text-teal-800 truncate">{c.name}</span>
                    <span className="text-xs text-teal-500/50 num ml-auto flex-shrink-0">{c.count}건</span>
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
    <Suspense fallback={<div className="text-center py-16 text-teal-500/60">로딩중...</div>}>
      <SearchContent />
    </Suspense>
  );
}
