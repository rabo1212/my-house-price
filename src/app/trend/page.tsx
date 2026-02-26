'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatPrice } from '@/lib/price-utils';
import { IconTrendingUp, IconBarChart } from '@/components/icons';

const COLORS = ['#0F766E', '#0369A1', '#7C3AED', '#DB2777', '#EA580C', '#059669'];

interface RegionTrend {
  code: string;
  name: string;
  total: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  monthly: { month: string; avg: number; count: number }[];
}

interface TrendData {
  regions: RegionTrend[];
  months: number;
}

export default function TrendPage() {
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(6);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/trend?months=${months}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [months]);

  // 멀티라인 차트용 데이터 변환
  const chartData = (() => {
    if (!data) return [];
    const allMonths = new Set<string>();
    for (const r of data.regions) {
      for (const m of r.monthly) allMonths.add(m.month);
    }
    return Array.from(allMonths).sort().map(month => {
      const entry: Record<string, string | number> = { month };
      for (const r of data.regions) {
        const found = r.monthly.find(m => m.month === month);
        if (found) entry[r.name] = found.avg;
      }
      return entry;
    });
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2.5">
            <IconTrendingUp className="w-6 h-6 text-teal-600" />
            시세 트렌드
          </h1>
          <p className="text-sm text-teal-600/60 mt-1">주요 지역 아파트 평균 시세 추이 비교</p>
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

      {loading && (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-teal-600/60 mt-3">6개 지역 데이터 수집 중...</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* 멀티라인 차트 */}
          <div className="card">
            <h3 className="font-semibold text-teal-900 mb-4">월별 평균가 추이</h3>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CCFBF1" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#5F7A76' }}
                  tickFormatter={v => v.slice(5) + '월'}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#5F7A76' }}
                  tickFormatter={v => formatPrice(Number(v))}
                  width={80}
                />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any, name: any) => [formatPrice(v as number), name as string]}
                  labelFormatter={l => `${l}`}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #CCFBF1', fontSize: '13px', color: '#134E4A' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }}
                />
                {data.regions.map((r, i) => (
                  <Line
                    key={r.code}
                    type="monotone"
                    dataKey={r.name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: COLORS[i % COLORS.length], strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 지역별 비교 테이블 */}
          <div className="card">
            <h3 className="font-semibold text-teal-900 mb-4 flex items-center gap-2">
              <IconBarChart className="w-5 h-5 text-teal-600" />
              지역별 비교
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-teal-100 text-teal-600">
                    <th className="text-left py-2.5 font-medium">지역</th>
                    <th className="text-right py-2.5 font-medium">거래건수</th>
                    <th className="text-right py-2.5 font-medium">평균가</th>
                    <th className="text-right py-2.5 font-medium hidden sm:table-cell">최저</th>
                    <th className="text-right py-2.5 font-medium hidden sm:table-cell">최고</th>
                    <th className="text-right py-2.5 font-medium">추이</th>
                  </tr>
                </thead>
                <tbody>
                  {data.regions.map((r, i) => {
                    const trend = r.monthly.length >= 2
                      ? r.monthly[r.monthly.length - 1].avg - r.monthly[0].avg
                      : 0;
                    const trendPct = r.monthly.length >= 2 && r.monthly[0].avg > 0
                      ? ((trend / r.monthly[0].avg) * 100).toFixed(1)
                      : '0';
                    return (
                      <tr key={r.code} className="border-b border-teal-50 hover:bg-teal-50/50 transition-colors duration-150">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <a
                              href={`/search?code=${r.code}`}
                              className="font-medium text-teal-800 hover:text-teal-600 cursor-pointer transition-colors duration-200"
                            >
                              {r.name}
                            </a>
                          </div>
                        </td>
                        <td className="py-3 text-right num text-teal-700">{r.total}건</td>
                        <td className="py-3 text-right num font-semibold text-teal-900">{formatPrice(r.avgPrice)}</td>
                        <td className="py-3 text-right num text-teal-600/70 hidden sm:table-cell">{formatPrice(r.minPrice)}</td>
                        <td className="py-3 text-right num text-teal-600/70 hidden sm:table-cell">{formatPrice(r.maxPrice)}</td>
                        <td className="py-3 text-right">
                          <span className={`text-sm font-semibold num ${trend > 0 ? 'text-rose-600' : trend < 0 ? 'text-sky-600' : 'text-teal-500'}`}>
                            {trend > 0 ? '+' : ''}{trendPct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
