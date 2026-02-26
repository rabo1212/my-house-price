import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "내 집 얼마? | 아파트 실거래가 조회",
  description: "국토교통부 실거래가 데이터 기반 아파트 시세 조회, 대출 계산기",
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-teal-700 hover:text-teal-900 font-medium text-sm transition-colors duration-200 cursor-pointer"
    >
      {children}
    </Link>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-teal-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="currentColor">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="font-bold text-lg text-teal-900 group-hover:text-teal-700 transition-colors duration-200">내 집 얼마?</span>
        </Link>
        <nav className="flex items-center gap-5">
          <NavLink href="/trend">시세 트렌드</NavLink>
          <NavLink href="/calculator">대출계산기</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-teal-100 mt-12 py-6 text-center text-xs text-teal-600/60">
          국토교통부 실거래가 공공데이터 기반 · 투자 판단의 책임은 본인에게 있습니다
        </footer>
      </body>
    </html>
  );
}
