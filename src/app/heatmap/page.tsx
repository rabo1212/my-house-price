'use client';

import { useState, useEffect } from 'react';
import SeoulHeatmap from '@/components/SeoulHeatmap';
import { IconMapPin } from '@/components/icons';
import { formatPrice } from '@/lib/price-utils';

interface RegionData {
  code: string;
  name: string;
  avgPricePerPyeong: number;
  tradeCount: number;
}

export default function HeatmapPage() {
  const [data, setData] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/heatmap')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setData(d.regions || []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const sorted = [...data].filter(r => r.avgPricePerPyeong > 0).sort((a, b) => b.avgPricePerPyeong - a.avgPricePerPyeong);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', boxShadow: '0 4px 12px rgba(99,102,241,0.15)' }}>
            <IconMapPin className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          평당가 히트맵
        </h1>
        <p className="text-sm text-gray-500 mt-1.5 ml-12">최근 3개월 실거래가 기준 평당 평균가 비교 · 클릭하면 상세 조회</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="card p-6">
            <div className="skeleton h-6 w-40 mb-4" />
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="skeleton min-h-[72px]" />
              ))}
            </div>
          </div>
          <div className="card p-6">
            <div className="skeleton h-6 w-32 mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-10 mb-2" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="card text-center py-20">
          <p className="text-rose-500 font-medium">데이터를 불러오지 못했습니다</p>
          <button onClick={() => window.location.reload()} className="mt-3 text-sm text-indigo-600 hover:underline cursor-pointer">다시 시도</button>
        </div>
      ) : (
        <>
          <div className="card">
            <SeoulHeatmap regions={data} />
          </div>

          {/* 랭킹 테이블 */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">평당가 랭킹</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="text-left py-2.5 font-medium w-10">#</th>
                    <th className="text-left py-2.5 font-medium">지역</th>
                    <th className="text-right py-2.5 font-medium">평당가</th>
                    <th className="text-right py-2.5 font-medium">거래건수</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, i) => (
                    <tr key={r.code} className="border-b border-gray-50 hover:bg-indigo-50/40 transition-colors duration-150">
                      <td className="py-2.5 num text-gray-400 font-medium">{i + 1}</td>
                      <td className="py-2.5">
                        <a href={`/search?code=${r.code}`} className="font-medium text-gray-800 hover:text-indigo-600 cursor-pointer transition-colors duration-200">
                          {r.name}
                        </a>
                      </td>
                      <td className="py-2.5 text-right num font-semibold text-gray-900">{formatPrice(r.avgPricePerPyeong)}</td>
                      <td className="py-2.5 text-right num text-gray-500">{r.tradeCount}건</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
