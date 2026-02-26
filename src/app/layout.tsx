import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "내 집 얼마? | 아파트 실거래가 조회",
  description: "국토교통부 실거래가 데이터 기반 아파트 시세 조회, 대출 계산기",
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/60 font-medium text-sm px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer">
      {children}
    </Link>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/50 backdrop-blur-2xl border-b border-white/60" style={{ boxShadow: '0 4px 30px rgba(99, 102, 241, 0.06)' }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="currentColor">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="font-extrabold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">내 집 얼마?</span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink href="/heatmap">히트맵</NavLink>
          <NavLink href="/trend">시세 비교</NavLink>
          <NavLink href="/calculator">대출계산기</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        <footer className="border-t border-white/50 mt-12 py-6 text-center text-xs text-gray-400" style={{ background: 'rgba(255,255,255,0.3)' }}>
          국토교통부 실거래가 공공데이터 기반 · 투자 판단의 책임은 본인에게 있습니다
        </footer>
      </body>
    </html>
  );
}
