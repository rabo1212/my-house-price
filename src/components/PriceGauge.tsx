'use client';

import { formatPrice } from '@/lib/price-utils';

interface Trade {
  date: string; price: number;
}

interface Props {
  trades: Trade[];
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

function getVerdict(pct: number, trendPct: number, volumeTrend: 'up' | 'down' | 'stable') {
  if (pct <= 25) {
    if (trendPct < -3) return { label: '저점 매수 구간', desc: '가격이 낮고 하락 추세. 추가 하락 가능성도 있지만 저가 매수 기회', color: 'text-emerald-600', bg: 'bg-gradient-to-r from-emerald-50 to-teal-50', border: 'border-emerald-200/60' };
    return { label: '저점 근처', desc: '최근 거래 범위에서 낮은 가격대. 상대적 매수 매력 있음', color: 'text-emerald-600', bg: 'bg-gradient-to-r from-emerald-50 to-teal-50', border: 'border-emerald-200/60' };
  }
  if (pct <= 45) {
    return { label: '평균 이하', desc: '평균보다 낮은 가격대. 괜찮은 진입 시점일 수 있음', color: 'text-teal-600', bg: 'bg-gradient-to-r from-teal-50 to-cyan-50', border: 'border-teal-200/60' };
  }
  if (pct <= 55) {
    if (volumeTrend === 'up') return { label: '평균 수준 · 거래 활발', desc: '평균 가격대이며 거래가 늘고 있어 시장 관심 높음', color: 'text-amber-600', bg: 'bg-gradient-to-r from-amber-50 to-yellow-50', border: 'border-amber-200/60' };
    return { label: '평균 수준', desc: '최근 거래 범위의 중간. 급하지 않다면 관망도 방법', color: 'text-gray-600', bg: 'bg-gradient-to-r from-gray-50 to-slate-50', border: 'border-gray-200/60' };
  }
  if (pct <= 75) {
    return { label: '평균 이상', desc: '평균보다 높은 가격대. 신중한 접근 필요', color: 'text-orange-600', bg: 'bg-gradient-to-r from-orange-50 to-amber-50', border: 'border-orange-200/60' };
  }
  if (trendPct > 5) return { label: '고점 · 상승 중', desc: '고점이지만 아직 오르는 중. 추격 매수 위험 있음', color: 'text-rose-600', bg: 'bg-gradient-to-r from-rose-50 to-pink-50', border: 'border-rose-200/60' };
  return { label: '고점 근처', desc: '최근 거래 범위에서 높은 가격대. 매수 시 주의 필요', color: 'text-rose-600', bg: 'bg-gradient-to-r from-rose-50 to-pink-50', border: 'border-rose-200/60' };
}

export default function PriceGauge({ trades, avgPrice, minPrice, maxPrice }: Props) {
  if (trades.length < 3) return null;

  const sorted = [...trades].sort((a, b) => b.date.localeCompare(a.date));
  const recentAvg = Math.round(sorted.slice(0, 3).reduce((s, t) => s + t.price, 0) / Math.min(3, sorted.length));

  const range = maxPrice - minPrice;
  const pct = range > 0 ? Math.round(((recentAvg - minPrice) / range) * 100) : 50;
  const clampedPct = Math.max(2, Math.min(98, pct));

  const half = Math.floor(sorted.length / 2);
  const recentHalf = sorted.slice(0, half);
  const olderHalf = sorted.slice(half);
  const recentHalfAvg = recentHalf.length ? recentHalf.reduce((s, t) => s + t.price, 0) / recentHalf.length : 0;
  const olderHalfAvg = olderHalf.length ? olderHalf.reduce((s, t) => s + t.price, 0) / olderHalf.length : 0;
  const trendPct = olderHalfAvg > 0 ? ((recentHalfAvg - olderHalfAvg) / olderHalfAvg) * 100 : 0;

  const monthMap = new Map<string, number>();
  for (const t of trades) {
    const key = t.date.slice(0, 7);
    monthMap.set(key, (monthMap.get(key) || 0) + 1);
  }
  const monthCounts = Array.from(monthMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  let volumeTrend: 'up' | 'down' | 'stable' = 'stable';
  if (monthCounts.length >= 2) {
    const last = monthCounts[monthCounts.length - 1][1];
    const prev = monthCounts[monthCounts.length - 2][1];
    if (last > prev * 1.2) volumeTrend = 'up';
    else if (last < prev * 0.8) volumeTrend = 'down';
  }

  const verdict = getVerdict(pct, trendPct, volumeTrend);
  const avgPct = range > 0 ? Math.max(2, Math.min(98, ((avgPrice - minPrice) / range) * 100)) : 50;

  return (
    <div className="card">
      <h3 className="font-bold text-gray-900 mb-4">지금 사도 될까?</h3>

      {/* 판정 */}
      <div className={`${verdict.bg} ${verdict.border} border rounded-xl p-4 mb-5`} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div className={`font-extrabold text-lg ${verdict.color}`}>{verdict.label}</div>
        <p className="text-sm text-gray-600 mt-1">{verdict.desc}</p>
      </div>

      {/* 가격 게이지 — 3D bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>최저 {formatPrice(minPrice)}</span>
          <span>최고 {formatPrice(maxPrice)}</span>
        </div>
        <div className="relative h-5 rounded-full overflow-hidden gauge-bar">
          {/* 평균 마커 */}
          <div className="absolute top-0 h-full w-0.5 bg-white/50" style={{ left: `${avgPct}%` }} />
          {/* 현재가 마커 — 3D sphere */}
          <div
            className="absolute top-1/2 w-6 h-6 rounded-full gauge-marker border-2 border-white"
            style={{ left: `${clampedPct}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>
        <div className="relative mt-1">
          <div className="absolute text-xs text-gray-400" style={{ left: `${avgPct}%`, transform: 'translateX(-50%)' }}>평균</div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            최근 거래가 <span className="font-bold text-gray-900 num">{formatPrice(recentAvg)}</span>
          </div>
          <div className="text-sm">
            상위 <span className="font-bold num text-gray-900">{100 - pct}%</span> 구간
          </div>
        </div>
      </div>

      {/* 보조 지표 — 입체 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3 text-center" style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="text-xs text-gray-500 mb-1">가격 추세</div>
          <div className={`font-bold num ${trendPct > 1 ? 'text-rose-600' : trendPct < -1 ? 'text-indigo-600' : 'text-gray-600'}`}>
            {trendPct > 0 ? '+' : ''}{trendPct.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{trendPct > 1 ? '상승 중' : trendPct < -1 ? '하락 중' : '보합'}</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="text-xs text-gray-500 mb-1">거래량</div>
          <div className={`font-bold ${volumeTrend === 'up' ? 'text-emerald-600' : volumeTrend === 'down' ? 'text-rose-600' : 'text-gray-600'}`}>
            {volumeTrend === 'up' ? '증가 ↑' : volumeTrend === 'down' ? '감소 ↓' : '보합 →'}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">전월 대비</div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 leading-relaxed">
        ※ 공공데이터 실거래가 기반 단순 분석이며, 투자 조언이 아닙니다. 실제 투자는 입지, 개발호재, 금리 등을 종합 고려하세요.
      </p>
    </div>
  );
}
