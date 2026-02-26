'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatPrice } from '@/lib/price-utils';
import { IconTrendingUp, IconBarChart, IconSearch, IconMapPin, IconBuilding } from '@/components/icons';
import { REGION_CODES } from '@/lib/region-codes';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
const MAX_ITEMS = 5;

interface CompareItem {
  code: string;
  regionName: string;
  apt?: string;
  label: string;
}

interface TrendResult {
  code: string; apt?: string; label: string; total: number;
  avgPrice: number; minPrice: number; maxPrice: number;
  monthly: { month: string; avg: number; count: number }[];
}

export default function TrendPage() {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [data, setData] = useState<TrendResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [months, setMonths] = useState(6);

  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'region' | 'apt'>('region');
  const [regionResults, setRegionResults] = useState<{ code: string; name: string }[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<{ code: string; name: string } | null>(null);
  const [aptResults, setAptResults] = useState<{ name: string; count: number }[]>([]);
  const [aptLoading, setAptLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchMode !== 'region' || !query.trim()) {
      setRegionResults([]);
      return;
    }
    const results: { code: string; name: string }[] = [];
    for (const [code, name] of Object.entries(REGION_CODES)) {
      if (name.includes(query) || code.includes(query)) results.push({ code, name });
    }
    setRegionResults(results.slice(0, 10));
    setShowDropdown(true);
  }, [query, searchMode]);

  const searchApts = useCallback(async (code: string, q: string) => {
    setAptLoading(true);
    try {
      const res = await fetch(`/api/apt-search?code=${code}&q=${encodeURIComponent(q)}`);
      const d = await res.json();
      setAptResults(d.apartments || []);
      setShowDropdown(true);
    } catch { setAptResults([]); }
    setAptLoading(false);
  }, []);

  const selectRegion = (code: string, name: string) => {
    setSelectedRegion({ code, name });
    setSearchMode('apt');
    setQuery('');
    setShowDropdown(false);
    searchApts(code, '');
  };

  const addRegion = (code: string, name: string) => {
    if (items.length >= MAX_ITEMS) return;
    if (items.some(i => i.code === code && !i.apt)) return;
    setItems(prev => [...prev, { code, regionName: name, label: name }]);
    setQuery('');
    setShowDropdown(false);
    setSelectedRegion(null);
    setSearchMode('region');
  };

  const addApt = (aptName: string) => {
    if (!selectedRegion || items.length >= MAX_ITEMS) return;
    if (items.some(i => i.code === selectedRegion.code && i.apt === aptName)) return;
    setItems(prev => [...prev, {
      code: selectedRegion.code,
      regionName: selectedRegion.name,
      apt: aptName,
      label: `${aptName} (${selectedRegion.name})`,
    }]);
    setQuery('');
    setShowDropdown(false);
    setSelectedRegion(null);
    setSearchMode('region');
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    if (items.length === 0) { setData([]); return; }
    setLoading(true);
    setError(false);
    const itemsParam = items.map(i => i.apt ? `${i.code}:${encodeURIComponent(i.apt)}` : i.code).join(',');
    fetch(`/api/trend?months=${months}&items=${itemsParam}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setData(d.items || []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [items, months]);

  const chartData = (() => {
    if (!data.length) return [];
    const allMonths = new Set<string>();
    for (const r of data) for (const m of r.monthly) allMonths.add(m.month);
    return Array.from(allMonths).sort().map(month => {
      const entry: Record<string, string | number> = { month };
      for (const r of data) {
        const found = r.monthly.find(m => m.month === month);
        if (found) entry[r.label] = found.avg;
      }
      return entry;
    });
  })();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', boxShadow: '0 4px 12px rgba(139,92,246,0.15)' }}>
              <IconTrendingUp className="w-4.5 h-4.5 text-violet-600" />
            </div>
            시세 비교
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 ml-12">지역이나 아파트를 검색해서 시세 추이를 비교하세요 (최대 {MAX_ITEMS}개)</p>
        </div>
        <select aria-label="조회 기간" value={months} onChange={e => setMonths(Number(e.target.value))} className="text-sm rounded-xl px-3 py-2 text-gray-700 cursor-pointer" style={{ border: '1px solid rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.5)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <option value={3}>3개월</option><option value={6}>6개월</option><option value={12}>12개월</option>
        </select>
      </div>

      {/* 검색 + 선택된 아이템 */}
      <div className="card relative z-20">
        <div className="relative" ref={dropdownRef}>
          {selectedRegion && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm px-2.5 py-1 rounded-lg font-medium" style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', color: '#4338ca' }}>{selectedRegion.name}</span>
              <span className="text-xs text-gray-400">에서 아파트를 검색하거나, 지역 전체를 추가하세요</span>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
              <input
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  if (selectedRegion && searchMode === 'apt') {
                    searchApts(selectedRegion.code, e.target.value);
                  }
                }}
                onFocus={() => {
                  if (searchMode === 'region' && query) setShowDropdown(true);
                  if (searchMode === 'apt') { setShowDropdown(true); if (selectedRegion) searchApts(selectedRegion.code, query); }
                }}
                placeholder={selectedRegion ? `${selectedRegion.name} 아파트 검색...` : '지역 검색 (예: 강남구, 마포구, 성남분당)'}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                style={{ border: '1px solid rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.6)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                disabled={items.length >= MAX_ITEMS}
              />
            </div>
            {selectedRegion && (
              <>
                <button
                  onClick={() => addRegion(selectedRegion.code, selectedRegion.name)}
                  disabled={items.length >= MAX_ITEMS || items.some(i => i.code === selectedRegion.code && !i.apt)}
                  className="px-3 py-2 text-sm text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}
                >
                  지역 전체 추가
                </button>
                <button
                  onClick={() => { setSelectedRegion(null); setSearchMode('region'); setQuery(''); setShowDropdown(false); }}
                  className="px-3 py-2 text-sm text-gray-600 rounded-xl hover:bg-white/60 cursor-pointer transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.4)' }}
                >
                  취소
                </button>
              </>
            )}
          </div>

          {/* 지역 드롭다운 */}
          {showDropdown && searchMode === 'region' && regionResults.length > 0 && (
            <div className="absolute z-20 w-full mt-2 bg-white/90 backdrop-blur-xl rounded-2xl max-h-60 overflow-y-auto" style={{ boxShadow: '0 8px 32px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.8)' }}>
              {regionResults.map(r => (
                <button
                  key={r.code}
                  aria-label={`${r.name} 지역 선택`}
                  onClick={() => selectRegion(r.code, r.name)}
                  className="w-full text-left px-4 py-2.5 hover:bg-indigo-50/60 flex items-center gap-2.5 text-sm cursor-pointer transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                    <IconMapPin className="w-3 h-3 text-indigo-500" />
                  </div>
                  <span className="font-medium text-gray-700">{r.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{r.code}</span>
                </button>
              ))}
            </div>
          )}

          {/* 아파트 드롭다운 */}
          {showDropdown && searchMode === 'apt' && selectedRegion && (
            <div className="absolute z-20 w-full mt-2 bg-white/90 backdrop-blur-xl rounded-2xl max-h-60 overflow-y-auto" style={{ boxShadow: '0 8px 32px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.8)' }}>
              {aptLoading ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  <div className="inline-block w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-2" />
                  <p>아파트 목록 조회 중...</p>
                </div>
              ) : aptResults.length > 0 ? (
                aptResults.map(a => (
                  <button
                    key={a.name}
                    aria-label={`${a.name} 아파트 추가`}
                    onClick={() => addApt(a.name)}
                    disabled={items.some(i => i.code === selectedRegion.code && i.apt === a.name)}
                    className="w-full text-left px-4 py-2.5 hover:bg-indigo-50/60 flex items-center gap-2.5 text-sm cursor-pointer transition-colors disabled:opacity-40"
                  >
                    <IconBuilding className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-700">{a.name}</span>
                    <span className="text-xs text-gray-400 ml-auto num">{a.count}건</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-center text-sm text-gray-400">검색 결과 없음</div>
              )}
            </div>
          )}
        </div>

        {/* 선택된 아이템 태그 */}
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {items.map((item, i) => (
              <span key={`${item.code}-${item.apt || 'all'}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border" style={{ backgroundColor: `${COLORS[i]}10`, borderColor: `${COLORS[i]}30`, color: COLORS[i] }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i], boxShadow: `0 0 6px ${COLORS[i]}40` }} />
                {item.label}
                <button aria-label={`${item.label} 제거`} onClick={() => removeItem(i)} className="ml-1 hover:opacity-70 cursor-pointer text-base leading-none w-5 h-5 flex items-center justify-center">&times;</button>
              </span>
            ))}
            {items.length < MAX_ITEMS && (
              <span className="text-xs text-gray-400 self-center">+{MAX_ITEMS - items.length}개 더 추가 가능</span>
            )}
          </div>
        )}
      </div>

      {/* 빈 상태 */}
      {items.length === 0 && (
        <div className="card text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)', boxShadow: '0 4px 12px rgba(99,102,241,0.10)' }}>
            <IconTrendingUp className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-gray-500 text-sm">비교할 지역이나 아파트를 검색해서 추가하세요</p>
          <p className="text-gray-400 text-xs mt-1">최대 {MAX_ITEMS}개까지 동시 비교 가능</p>
        </div>
      )}

      {/* 로딩 */}
      {loading && items.length > 0 && (
        <div className="space-y-4">
          <div className="skeleton h-96 rounded-2xl" />
          <div className="skeleton h-48 rounded-2xl" />
        </div>
      )}

      {/* 에러 */}
      {error && !loading && items.length > 0 && (
        <div className="card text-center py-16">
          <p className="text-rose-500 font-medium">데이터를 불러오지 못했습니다</p>
          <button onClick={() => setError(false)} className="mt-3 text-sm text-indigo-600 hover:underline cursor-pointer">다시 시도</button>
        </div>
      )}

      {/* 차트 + 테이블 */}
      {data.length > 0 && !loading && (
        <>
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">월별 평균가 추이</h3>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => v.slice(5) + '월'} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => formatPrice(Number(v))} width={80} />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any, name: any) => [formatPrice(v as number), name as string]}
                  labelFormatter={l => `${l}`}
                  contentStyle={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.8)', fontSize: '13px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(99,102,241,0.12)' }}
                />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }} />
                {data.map((r, i) => (
                  <Line key={`${r.code}-${r.apt || 'all'}`} type="monotone" dataKey={r.label} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3, fill: COLORS[i % COLORS.length], strokeWidth: 0 }} activeDot={{ r: 5 }} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <IconBarChart className="w-5 h-5 text-indigo-500" />
              비교 요약
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="text-left py-2.5 font-medium">항목</th>
                    <th className="text-right py-2.5 font-medium">거래건수</th>
                    <th className="text-right py-2.5 font-medium">평균가</th>
                    <th className="text-right py-2.5 font-medium hidden sm:table-cell">최저</th>
                    <th className="text-right py-2.5 font-medium hidden sm:table-cell">최고</th>
                    <th className="text-right py-2.5 font-medium">추이</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r, i) => {
                    const trend = r.monthly.length >= 2 ? r.monthly[r.monthly.length - 1].avg - r.monthly[0].avg : 0;
                    const trendPct = r.monthly.length >= 2 && r.monthly[0].avg > 0 ? ((trend / r.monthly[0].avg) * 100).toFixed(1) : '0';
                    return (
                      <tr key={`${r.code}-${r.apt || 'all'}`} className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors duration-150">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length], boxShadow: `0 0 8px ${COLORS[i % COLORS.length]}30` }} />
                            <span className="font-medium text-gray-800">{r.label}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right num text-gray-600">{r.total}건</td>
                        <td className="py-3 text-right num font-semibold text-gray-900">{formatPrice(r.avgPrice)}</td>
                        <td className="py-3 text-right num text-gray-500 hidden sm:table-cell">{formatPrice(r.minPrice)}</td>
                        <td className="py-3 text-right num text-gray-500 hidden sm:table-cell">{formatPrice(r.maxPrice)}</td>
                        <td className="py-3 text-right">
                          <span className={`text-sm font-semibold num ${trend > 0 ? 'text-rose-600' : trend < 0 ? 'text-indigo-600' : 'text-gray-500'}`}>
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
