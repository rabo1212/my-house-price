import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "내 집 얼마? | 아파트 실거래가 조회",
  description: "국토교통부 실거래가 데이터 기반 아파트 시세 조회, 대출 계산기",
};

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <span className="font-bold text-lg text-slate-800">내 집 얼마?</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/calculator" className="text-slate-500 hover:text-blue-600 font-medium">
            대출계산기
          </Link>
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
        <footer className="border-t border-slate-100 mt-12 py-6 text-center text-xs text-slate-400">
          국토교통부 실거래가 공공데이터 기반 · 투자 판단의 책임은 본인에게 있습니다
        </footer>
      </body>
    </html>
  );
}
