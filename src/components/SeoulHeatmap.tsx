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

// 서울 25개 구 그리드 배치 (대략적 지리 위치 반영)
const SEOUL_GRID: Record<string, [number, number]> = {
  '11350': [0, 3], '11320': [0, 2], '11305': [1, 2], '11290': [1, 3],
  '11380': [1, 0], '11230': [1, 4], '11260': [1, 5], '11410': [2, 0],
  '11110': [2, 1], '11140': [2, 2], '11200': [2, 3], '11215': [2, 4],
  '11440': [3, 0], '11170': [3, 1], '11590': [3, 2], '11650': [3, 3],
  '11680': [3, 4], '11710': [3, 5], '11500': [4, 0], '11470': [4, 1],
  '11560': [4, 2], '11530': [5, 1], '11620': [5, 2], '11545': [5, 0],
  '11740': [4, 5],
};

const GYEONGGI_GRID: Record<string, [number, number]> = {
  '41285': [0, 0], '41117': [0, 1], '41135': [0, 2],
  '41465': [1, 0], '41461': [1, 1], '41173': [1, 2],
};

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
        {region.name}
      </span>
      <span className={`text-xs num mt-0.5 ${color.sub}`}>
        {region.avgPricePerPyeong > 0 ? formatPrice(region.avgPricePerPyeong) : '-'}
      </span>
    </button>
  );
}

export default function SeoulHeatmap({ regions }: Props) {
  const regionMap = new Map(regions.map(r => [r.code, r]));

  const seoulRegions = regions.filter(r => r.code.startsWith('11'));
  const gyeonggiRegions = regions.filter(r => r.code.startsWith('41'));
  const allPrices = regions.filter(r => r.avgPricePerPyeong > 0).map(r => r.avgPricePerPyeong);
  const min = allPrices.length ? Math.min(...allPrices) : 0;
  const max = allPrices.length ? Math.max(...allPrices) : 0;

  const seoulRows = 6;
  const seoulCols = 6;

  const renderGrid = (grid: Record<string, [number, number]>, rows: number, cols: number) => {
    const cells: (RegionData | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

    for (const [code, [row, col]] of Object.entries(grid)) {
      const region = regionMap.get(code);
      if (region) cells[row][col] = region;
    }

    return cells.map((row, ri) => (
      <div key={ri} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {row.map((cell, ci) => (
          cell ? (
            <GridCell
              key={cell.code}
              region={cell}
              min={min}
              max={max}
              onClick={() => { window.location.href = `/search?code=${cell.code}`; }}
            />
          ) : (
            <div key={`empty-${ri}-${ci}`} className="min-h-[72px]" />
          )
        ))}
      </div>
    ));
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-bold text-gray-900 mb-3">서울 ({seoulRegions.length}개 구)</h3>
        <div className="space-y-2">
          {renderGrid(SEOUL_GRID, seoulRows, seoulCols)}
        </div>
      </div>

      {gyeonggiRegions.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3">경기 주요 지역</h3>
          <div className="space-y-2">
            {renderGrid(GYEONGGI_GRID, 2, 3)}
          </div>
        </div>
      )}

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
