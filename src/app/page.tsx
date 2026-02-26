import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { POPULAR_REGIONS } from '@/lib/region-codes';
import { IconMapPin, IconCalculator, IconTrendingUp, IconChevronRight } from '@/components/icons';

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="text-center pt-10 pb-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          우리 동네 아파트, 지금 얼마?
        </h1>
        <p className="text-gray-500 mb-8">
          국토교통부 실거래가 데이터로 확인하는 진짜 시세
        </p>
        <div className="max-w-xl mx-auto">
          <SearchBar size="lg" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">인기 지역</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POPULAR_REGIONS.map(r => (
            <Link
              key={r.code}
              href={`/search?code=${r.code}`}
              className="card hover:border-indigo-300 hover:shadow-md text-left p-4 group cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center gap-2.5 mb-1">
                <IconMapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">{r.name}</span>
              </div>
              <div className="text-xs text-gray-400 num pl-6.5">{r.code}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/trend" className="card hover:border-indigo-300 hover:shadow-md flex items-center gap-4 group cursor-pointer transition-all duration-200">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <IconTrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">시세 비교</div>
            <div className="text-sm text-gray-500">지역·아파트별 시세 추이를 비교</div>
          </div>
          <IconChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors duration-200" />
        </Link>
        <Link href="/calculator" className="card hover:border-indigo-300 hover:shadow-md flex items-center gap-4 group cursor-pointer transition-all duration-200">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <IconCalculator className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">대출 계산기</div>
            <div className="text-sm text-gray-500">LTV, 금리, 상환액, 취득세까지 한번에</div>
          </div>
          <IconChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors duration-200" />
        </Link>
      </section>
    </div>
  );
}
