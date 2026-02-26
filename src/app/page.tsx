import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { POPULAR_REGIONS } from '@/lib/region-codes';

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center pt-8 pb-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          우리 동네 아파트, 지금 얼마?
        </h1>
        <p className="text-slate-500 mb-6">
          국토교통부 실거래가 데이터로 확인하는 진짜 시세
        </p>
        <div className="max-w-lg mx-auto">
          <SearchBar size="lg" />
        </div>
      </section>

      {/* 인기 지역 */}
      <section>
        <h2 className="text-lg font-semibold text-slate-700 mb-3">인기 지역</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POPULAR_REGIONS.map(r => (
            <Link
              key={r.code}
              href={`/search?code=${r.code}`}
              className="card hover:shadow-md hover:border-blue-200 text-center py-4 group"
            >
              <div className="text-2xl mb-1">🏙️</div>
              <div className="font-semibold text-slate-700 group-hover:text-blue-600">{r.name}</div>
              <div className="text-xs text-slate-400 mt-1 num">{r.code}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 바로가기 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/calculator" className="card hover:shadow-md hover:border-blue-200 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl flex-shrink-0">
            🧮
          </div>
          <div>
            <div className="font-semibold text-slate-700 group-hover:text-blue-600">대출 계산기</div>
            <div className="text-sm text-slate-500">LTV, 금리, 상환액, 취득세까지 한번에</div>
          </div>
        </Link>
        <div className="card flex items-center gap-4 opacity-60">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl flex-shrink-0">
            📊
          </div>
          <div>
            <div className="font-semibold text-slate-700">시세 트렌드</div>
            <div className="text-sm text-slate-500">준비중</div>
          </div>
        </div>
      </section>
    </div>
  );
}
