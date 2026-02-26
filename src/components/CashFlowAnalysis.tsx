'use client';

import { useMemo } from 'react';
import { calculateMonthlyPayment, calculateAcquisitionTax } from '@/lib/mortgage-calc';
import { formatPrice } from '@/lib/price-utils';

interface Props {
  price: number;
  ltv: number;
  rate: number;
  years: number;
  monthlyRent?: number;
}

export default function CashFlowAnalysis({ price, ltv, rate, years, monthlyRent = 0 }: Props) {
  const analysis = useMemo(() => {
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

  const { loan, monthlyManwon, selfFund, initialCost, monthlyCashFlow, annualCashFlow, totalInterest, totalPayment } = analysis;

  return (
    <div className="card">
      <h3 className="font-semibold text-teal-900 mb-4">자금 분석</h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-teal-50/60 rounded-lg p-3 text-center">
          <div className="text-xs text-teal-600 mb-1">초기 필요자금</div>
          <div className="font-bold text-teal-900 num">{formatPrice(initialCost)}</div>
          <div className="text-xs text-teal-500/50 mt-1">자기자본 + 취득세</div>
        </div>
        <div className="bg-teal-50/60 rounded-lg p-3 text-center">
          <div className="text-xs text-teal-600 mb-1">월 상환금</div>
          <div className="font-bold text-teal-800 num">{monthlyManwon}만원</div>
          <div className="text-xs text-teal-500/50 mt-1">원리금균등상환</div>
        </div>
        <div className="bg-teal-50/60 rounded-lg p-3 text-center">
          <div className="text-xs text-teal-600 mb-1">총 상환금</div>
          <div className="font-bold text-teal-900 num">{formatPrice(totalPayment)}</div>
          <div className="text-xs text-teal-500/50 mt-1">{years}년간</div>
        </div>
        <div className="bg-teal-50/60 rounded-lg p-3 text-center">
          <div className="text-xs text-teal-600 mb-1">총 이자</div>
          <div className="font-bold text-rose-600 num">{formatPrice(totalInterest)}</div>
          <div className="text-xs text-teal-500/50 mt-1">원금 대비 {loan > 0 ? Math.round(totalInterest / loan * 100) : 0}%</div>
        </div>
      </div>

      {/* 구성 바 */}
      <div className="mb-4">
        <div className="text-xs text-teal-600 mb-2">자금 구성</div>
        <div className="h-3 rounded-full overflow-hidden flex bg-teal-100/50">
          <div className="bg-sky-500 h-full rounded-l-full" style={{ width: `${(selfFund / price) * 100}%` }} title="자기자본" />
          <div className="bg-teal-500 h-full rounded-r-full" style={{ width: `${(loan / price) * 100}%` }} title="대출금" />
        </div>
        <div className="flex justify-between text-xs mt-1.5">
          <span className="text-sky-600">자기자본 {formatPrice(selfFund)} ({Math.round((1 - ltv / 100) * 100)}%)</span>
          <span className="text-teal-600">대출 {formatPrice(loan)} ({ltv}%)</span>
        </div>
      </div>

      {monthlyRent > 0 && (
        <div className={`rounded-xl p-3 ${monthlyCashFlow >= 0 ? 'bg-teal-50' : 'bg-rose-50'}`}>
          <div className="flex justify-between text-sm">
            <span className="text-teal-700">월 캐시플로우</span>
            <span className={`font-bold num ${monthlyCashFlow >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
              {monthlyCashFlow >= 0 ? '+' : ''}{monthlyCashFlow}만원
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-teal-700">연 캐시플로우</span>
            <span className={`font-bold num ${annualCashFlow >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
              {annualCashFlow >= 0 ? '+' : ''}{formatPrice(Math.abs(annualCashFlow))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
