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
  const [months, setMonths] = useState(6);

  // 검색 상태
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'region' | 'apt'>('region');
  const [regionResults, setRegionResults] = useState<{ code: string; name: string }[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<{ code: string; name: string } | null>(null);
  const [aptResults, setAptResults] = useState<{ name: string; count: number }[]>([]);
  const [aptLoading, setAptLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 지역 검색 (클라이언트)
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

  // 아파트 검색
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

  // 지역 선택 → 아파트 모드 전환
  const selectRegion = (code: string, name: string) => {
    // 지역 전체로 추가할지, 아파트 선택할지
    setSelectedRegion({ code, name });
    setSearchMode('apt');
    setQuery('');
    setShowDropdown(false);
    searchApts(code, '');
  };

  // 지역 전체 추가
  const addRegion = (code: string, name: string) => {
    if (items.length >= MAX_ITEMS) return;
    if (items.some(i => i.code === code && !i.apt)) return;
    setItems(prev => [...prev, { code, regionName: name, label: name }]);
    setQuery('');
    setShowDropdown(false);
    setSelectedRegion(null);
    setSearchMode('region');
  };

  // 아파트 추가
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

  // 아이템 제거
  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  // 데이터 로드
  useEffect(() => {
    if (items.length === 0) { setData([]); return; }
    setLoading(true);
    const itemsParam = items.map(i => i.apt ? `${i.code}:${encodeURIComponent(i.apt)}` : i.code).join(',');
    fetch(`/api/trend?months=${months}&items=${itemsParam}`)
      .then(r => r.json())
      .then(d => { setData(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [items, months]);

  // 차트 데이터 변환
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

  // 외부 클릭으로 드롭다운 닫기
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <IconTrendingUp className="w-6 h-6 text-indigo-500" />
            시세 비교
          </h1>
          <p className="text-sm text-gray-500 mt-1">지역이나 아파트를 검색해서 시세 추이를 비교하세요 (최대 {MAX_ITEMS}개)</p>
        </div>
        <select value={months} onChange={e => setMonths(Number(e.target.value))} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 cursor-pointer">
          <option value={3}>3개월</option><option value={6}>6개월</option><option value={12}>12개월</option>
        </select>
      </div>

      {/* 검색 + 선택된 아이템 */}
      <div className="card">
        <div className="relative" ref={dropdownRef}>
          {/* 선택된 지역 표시 (아파트 검색 모드) */}
          {selectedRegion && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-medium">{selectedRegion.name}</span>
              <span className="text-xs text-gray-400">에서 아파트를 검색하거나, 지역 전체를 추가하세요</span>
            </div>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-white"
                disabled={items.length >= MAX_ITEMS}
              />
            </div>
            {selectedRegion && (
              <>
                <button
                  onClick={() => addRegion(selectedRegion.code, selectedRegion.name)}
                  disabled={items.length >= MAX_ITEMS || items.some(i => i.code === selectedRegion.code && !i.apt)}
                  className="px-3 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors whitespace-nowrap"
                >
                  지역 전체 추가
                </button>
                <button
                  onClick={() => { setSelectedRegion(null); setSearchMode('region'); setQuery(''); setShowDropdown(false); }}
                  className="px-3 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  취소
                </button>
              </>
            )}
          </div>

          {/* 지역 드롭다운 */}
          {showDropdown && searchMode === 'region' && regionResults.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {regionResults.map(r => (
                <button
                  key={r.code}
                  onClick={() => selectRegion(r.code, r.name)}
                  className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 flex items-center gap-2.5 text-sm cursor-pointer transition-colors"
                >
                  <IconMapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-700">{r.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{r.code}</span>
                </button>
              ))}
            </div>
          )}

          {/* 아파트 드롭다운 */}
          {showDropdown && searchMode === 'apt' && selectedRegion && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {aptLoading ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  <div className="inline-block w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-2" />
                  <p>아파트 목록 조회 중...</p>
                </div>
              ) : aptResults.length > 0 ? (
                aptResults.map(a => (
                  <button
                    key={a.name}
                    onClick={() => addApt(a.name)}
                    disabled={items.some(i => i.code === selectedRegion.code && i.apt === a.name)}
                    className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 flex items-center gap-2.5 text-sm cursor-pointer transition-colors disabled:opacity-40"
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
              <span key={`${item.code}-${item.apt || 'all'}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: `${COLORS[i]}15`, color: COLORS[i] }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                {item.label}
                <button onClick={() => removeItem(i)} className="ml-1 hover:opacity-70 cursor-pointer text-base leading-none">&times;</button>
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
          <IconTrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">비교할 지역이나 아파트를 검색해서 추가하세요</p>
          <p className="text-gray-300 text-xs mt-1">최대 {MAX_ITEMS}개까지 동시 비교 가능</p>
        </div>
      )}

      {/* 로딩 */}
      {loading && items.length > 0 && (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 mt-3 text-sm">{items.length}개 항목 데이터 수집 중...</p>
        </div>
      )}

      {/* 차트 + 테이블 */}
      {data.length > 0 && !loading && (
        <>
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">월별 평균가 추이</h3>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => v.slice(5) + '월'} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => formatPrice(Number(v))} width={80} />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any, name: any) => [formatPrice(v as number), name as string]}
                  labelFormatter={l => `${l}`}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }} />
                {data.map((r, i) => (
                  <Line key={`${r.code}-${r.apt || 'all'}`} type="monotone" dataKey={r.label} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3, fill: COLORS[i % COLORS.length], strokeWidth: 0 }} activeDot={{ r: 5 }} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                      <tr key={`${r.code}-${r.apt || 'all'}`} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors duration-150">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
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
