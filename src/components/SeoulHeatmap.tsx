'use client';

import { formatPrice } from '@/lib/price-utils';

interface RegionData {
  code: string;
  name: string;
  avgPricePerPyeong: number;
  tradeCount: number;
}

interface Props {
  regions: RegionData[];
}

const COLOR_STOPS = [
  { bg: 'linear-gradient(135deg, #e0e7ff, #ede9fe)', text: 'text-gray-700', sub: 'text-gray-500' },
  { bg: 'linear-gradient(135deg, #c7d2fe, #ddd6fe)', text: 'text-gray-700', sub: 'text-gray-500' },
  { bg: 'linear-gradient(135deg, #a5b4fc, #c4b5fd)', text: 'text-white', sub: 'text-white/80' },
  { bg: 'linear-gradient(135deg, #818cf8, #a78bfa)', text: 'text-white', sub: 'text-white/80' },
  { bg: 'linear-gradient(135deg, #6366f1, #7c3aed)', text: 'text-white', sub: 'text-white/80' },
];

function getColorIndex(value: number, min: number, max: number): number {
  if (value === 0) return 0;
  const range = max - min || 1;
  const ratio = (value - min) / range;
  if (ratio < 0.2) return 0;
  if (ratio < 0.4) return 1;
  if (ratio < 0.6) return 2;
  if (ratio < 0.8) return 3;
  return 4;
}

function GridCell({ region, min, max, onClick }: { region: RegionData; min: number; max: number; onClick: () => void }) {
  const ci = getColorIndex(region.avgPricePerPyeong, min, max);
  const color = COLOR_STOPS[ci];
  // 짧은 이름 표시 (시/도 prefix 제거)
  const shortName = region.name.includes(' ') ? region.name.split(' ').slice(1).join(' ') : region.name;

  return (
    <button
      aria-label={`${region.name} 평당가 ${region.avgPricePerPyeong > 0 ? formatPrice(region.avgPricePerPyeong) : '데이터 없음'}`}
      onClick={onClick}
      className="relative rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer min-h-[72px] transition-all duration-300"
      style={{
        background: region.avgPricePerPyeong === 0 ? '#f3f4f6' : color.bg,
        boxShadow: region.avgPricePerPyeong > 0 ? '0 2px 8px rgba(99,102,241,0.10), inset 0 1px 0 rgba(255,255,255,0.25)' : 'none',
      }}
      onMouseEnter={e => {
        if (region.avgPricePerPyeong > 0) {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px) scale(1.05)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(99,102,241,0.20), inset 0 1px 0 rgba(255,255,255,0.25)';
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = region.avgPricePerPyeong > 0 ? '0 2px 8px rgba(99,102,241,0.10), inset 0 1px 0 rgba(255,255,255,0.25)' : 'none';
      }}
    >
      <span className={`text-xs font-bold ${color.text}`}>
        {shortName}
      </span>
      <span className={`text-xs num mt-0.5 ${color.sub}`}>
        {region.avgPricePerPyeong > 0 ? formatPrice(region.avgPricePerPyeong) : '-'}
      </span>
    </button>
  );
}

export default function SeoulHeatmap({ regions }: Props) {
  const allPrices = regions.filter(r => r.avgPricePerPyeong > 0).map(r => r.avgPricePerPyeong);
  const min = allPrices.length ? Math.min(...allPrices) : 0;
  const max = allPrices.length ? Math.max(...allPrices) : 0;

  // 그리드 컬럼 수 (지역 수에 따라 조절)
  const count = regions.length;
  const cols = count <= 3 ? count || 1 : count <= 6 ? 3 : count <= 12 ? 4 : count <= 20 ? 5 : 6;

  return (
    <div className="space-y-4">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {regions.map(region => (
          <GridCell
            key={region.code}
            region={region}
            min={min}
            max={max}
            onClick={() => { window.location.href = `/search?code=${region.code}`; }}
          />
        ))}
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>평당가</span>
        <div className="flex gap-1">
          {COLOR_STOPS.map((c, i) => (
            <div key={i} className="w-8 h-4 rounded-md" style={{ background: c.bg, boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }} />
          ))}
        </div>
        <span>낮음 → 높음</span>
      </div>
    </div>
  );
}
