import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { POPULAR_REGIONS } from '@/lib/region-codes';
import { IconMapPin, IconCalculator, IconTrendingUp, IconChevronRight, IconBarChart } from '@/components/icons';

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative text-center pt-10 pb-2 overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute -top-16 -left-24 w-72 h-72 bg-gradient-to-br from-indigo-400/20 to-violet-400/20 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute -top-8 -right-20 w-56 h-56 bg-gradient-to-br from-sky-400/15 to-cyan-400/15 rounded-full blur-3xl animate-float-reverse pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-44 h-44 bg-gradient-to-br from-violet-400/10 to-fuchsia-400/10 rounded-full blur-3xl animate-float-slow pointer-events-none" />

        <h1 className="relative text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
          우리 동네 아파트, 지금 얼마?
        </h1>
        <p className="relative text-gray-500 mb-8">
          국토교통부 실거래가 데이터로 확인하는 진짜 시세
        </p>
        <div className="relative max-w-xl mx-auto">
          <SearchBar size="lg" />
        </div>
      </section>

      {/* Popular Regions */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">인기 지역</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POPULAR_REGIONS.map(r => (
            <Link
              key={r.code}
              href={`/search?code=${r.code}`}
              className="card card-hover text-left p-4 group"
            >
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                  <IconMapPin className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <span className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">{r.name}</span>
              </div>
              <div className="text-xs text-gray-400 num pl-9.5">{r.code}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/heatmap" className="card card-hover flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', boxShadow: '0 4px 12px rgba(99,102,241,0.15)' }}>
            <IconBarChart className="w-5.5 h-5.5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">평당가 히트맵</div>
            <div className="text-sm text-gray-500">지역별 평당가 한눈에</div>
          </div>
          <IconChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors duration-200" />
        </Link>
        <Link href="/trend" className="card card-hover flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', boxShadow: '0 4px 12px rgba(139,92,246,0.15)' }}>
            <IconTrendingUp className="w-5.5 h-5.5 text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">시세 비교</div>
            <div className="text-sm text-gray-500">지역·아파트별 추이 비교</div>
          </div>
          <IconChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors duration-200" />
        </Link>
        <Link href="/calculator" className="card card-hover flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', boxShadow: '0 4px 12px rgba(59,130,246,0.15)' }}>
            <IconCalculator className="w-5.5 h-5.5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">대출 계산기</div>
            <div className="text-sm text-gray-500">LTV, 금리, 상환액, 취득세</div>
          </div>
          <IconChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors duration-200" />
        </Link>
      </section>
    </div>
  );
}
