'use client';

import { useState } from 'react';
import { formatPrice, formatArea } from '@/lib/price-utils';
import Link from 'next/link';

interface Trade {
  date: string;
  price: number;
  area_m2: number;
  floor: number;
  apartment: string;
  dong: string;
  build_year: number;
  price_per_pyeong: number;
  type: string;
}

export default function TradeTable({
  trades,
  regionCode,
  showAptLink = true,
}: {
  trades: Trade[];
  regionCode: string;
  showAptLink?: boolean;
}) {
  const [sortKey, setSortKey] = useState<'date' | 'price' | 'area' | 'pyeong'>('date');
  const [asc, setAsc] = useState(false);

  const sorted = [...trades].sort((a, b) => {
    let v = 0;
    if (sortKey === 'date') v = a.date.localeCompare(b.date);
    else if (sortKey === 'price') v = a.price - b.price;
    else if (sortKey === 'area') v = a.area_m2 - b.area_m2;
    else if (sortKey === 'pyeong') v = a.price_per_pyeong - b.price_per_pyeong;
    return asc ? v : -v;
  });

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setAsc(!asc);
    else { setSortKey(key); setAsc(false); }
  };

  const SortBtn = ({ k, label }: { k: typeof sortKey; label: string }) => (
    <button onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:text-blue-600">
      {label}
      {sortKey === k && <span className="text-xs">{asc ? '↑' : '↓'}</span>}
    </button>
  );

  if (!trades.length) {
    return <div className="card text-center text-slate-400 py-10">거래 내역이 없습니다</div>;
  }

  return (
    <div className="card overflow-x-auto">
      <h3 className="font-semibold text-slate-700 mb-4">실거래 내역 ({trades.length}건)</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-500">
            <th className="text-left py-2 font-medium"><SortBtn k="date" label="거래일" /></th>
            <th className="text-left py-2 font-medium">아파트</th>
            <th className="text-right py-2 font-medium"><SortBtn k="price" label="거래가" /></th>
            <th className="text-right py-2 font-medium hidden sm:table-cell"><SortBtn k="area" label="면적" /></th>
            <th className="text-right py-2 font-medium">층</th>
            <th className="text-right py-2 font-medium hidden md:table-cell"><SortBtn k="pyeong" label="평당가" /></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t, i) => (
            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="py-2.5 text-slate-500 num">{t.date}</td>
              <td className="py-2.5">
                {showAptLink ? (
                  <Link
                    href={`/apt/${regionCode}/${encodeURIComponent(t.apartment)}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {t.apartment}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-700">{t.apartment}</span>
                )}
                {t.dong && <span className="text-slate-400 text-xs ml-1">{t.dong}</span>}
              </td>
              <td className="py-2.5 text-right font-semibold num text-slate-800">
                {formatPrice(t.price)}
              </td>
              <td className="py-2.5 text-right text-slate-500 hidden sm:table-cell">
                {formatArea(t.area_m2)}
              </td>
              <td className="py-2.5 text-right text-slate-500 num">{t.floor}층</td>
              <td className="py-2.5 text-right text-slate-500 num hidden md:table-cell">
                {formatPrice(t.price_per_pyeong)}/평
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
