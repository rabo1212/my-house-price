'use client';

import { useMemo } from 'react';
import { calculateMonthlyPayment, calculateAcquisitionTax } from '@/lib/mortgage-calc';
import { formatPrice } from '@/lib/price-utils';

interface Props { price: number; ltv: number; rate: number; years: number; monthlyRent?: number; }

export default function CashFlowAnalysis({ price, ltv, rate, years, monthlyRent = 0 }: Props) {
  const a = useMemo(() => {
    const loan = Math.round(price * ltv / 100);
    const monthly = calculateMonthlyPayment(loan * 10000, rate / 100, years);
    const monthlyManwon = Math.round(monthly / 10000);
    const tax = calculateAcquisitionTax(price);
    const selfFund = price - loan;
    const initialCost = selfFund + tax.total;
    const monthlyCashFlow = monthlyRent - monthlyManwon;
    const annualCashFlow = monthlyCashFlow * 12;
    const totalInterest = monthlyManwon * years * 12 - loan;
    const totalPayment = monthlyManwon * years * 12;
    return { loan, monthlyManwon, selfFund, initialCost, monthlyCashFlow, annualCashFlow, totalInterest, totalPayment };
  }, [price, ltv, rate, years, monthlyRent]);

  const Stat = ({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: string }) => (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`font-bold num ${accent || 'text-gray-900'}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  );

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4">자금 분석</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Stat label="초기 필요자금" value={formatPrice(a.initialCost)} sub="자기자본 + 취득세" />
        <Stat label="월 상환금" value={`${a.monthlyManwon}만원`} sub="원리금균등상환" accent="text-indigo-700" />
        <Stat label="총 상환금" value={formatPrice(a.totalPayment)} sub={`${years}년간`} />
        <Stat label="총 이자" value={formatPrice(a.totalInterest)} sub={`원금 대비 ${a.loan > 0 ? Math.round(a.totalInterest / a.loan * 100) : 0}%`} accent="text-rose-600" />
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">자금 구성</div>
        <div className="h-3 rounded-full overflow-hidden flex bg-gray-100">
          <div className="bg-indigo-400 h-full rounded-l-full" style={{ width: `${(a.selfFund / price) * 100}%` }} />
          <div className="bg-indigo-600 h-full rounded-r-full" style={{ width: `${(a.loan / price) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs mt-1.5">
          <span className="text-indigo-500">자기자본 {formatPrice(a.selfFund)} ({Math.round((1 - ltv / 100) * 100)}%)</span>
          <span className="text-indigo-700">대출 {formatPrice(a.loan)} ({ltv}%)</span>
        </div>
      </div>

      {monthlyRent > 0 && (
        <div className={`rounded-xl p-3 ${a.monthlyCashFlow >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">월 캐시플로우</span>
            <span className={`font-bold num ${a.monthlyCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {a.monthlyCashFlow >= 0 ? '+' : ''}{a.monthlyCashFlow}만원
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600">연 캐시플로우</span>
            <span className={`font-bold num ${a.annualCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {a.annualCashFlow >= 0 ? '+' : ''}{formatPrice(Math.abs(a.annualCashFlow))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
