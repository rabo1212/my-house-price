'use client';

import { useState, useMemo } from 'react';
import { calculateMonthlyPayment, calculateAcquisitionTax } from '@/lib/mortgage-calc';
import { formatPrice } from '@/lib/price-utils';

export default function MortgageCalculator({ initialPrice = 0 }: { initialPrice?: number }) {
  const [price, setPrice] = useState(initialPrice || 90000); // 만원
  const [ltv, setLtv] = useState(70);
  const [rate, setRate] = useState(3.5);
  const [years, setYears] = useState(30);

  const loan = Math.round(price * ltv / 100);
  const monthly = useMemo(() => calculateMonthlyPayment(loan * 10000, rate / 100, years), [loan, rate, years]);
  const tax = useMemo(() => calculateAcquisitionTax(price), [price]);
  const selfFund = price - loan;

  return (
    <div className="card space-y-5">
      <h3 className="font-semibold text-slate-700">대출 계산기</h3>

      {/* 매매가 */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-500">매매가</span>
          <span className="font-semibold num">{formatPrice(price)}</span>
        </div>
        <input
          type="range"
          min={5000}
          max={300000}
          step={1000}
          value={price}
          onChange={e => setPrice(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>5천만</span><span>30억</span>
        </div>
      </div>

      {/* LTV */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-500">LTV (대출비율)</span>
          <span className="font-semibold num">{ltv}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={90}
          step={5}
          value={ltv}
          onChange={e => setLtv(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>0%</span><span>90%</span>
        </div>
      </div>

      {/* 금리 */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-500">금리</span>
          <span className="font-semibold num">{rate.toFixed(1)}%</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={0.1}
          value={rate}
          onChange={e => setRate(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>1%</span><span>10%</span>
        </div>
      </div>

      {/* 대출기간 */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-500">대출기간</span>
          <span className="font-semibold num">{years}년</span>
        </div>
        <input
          type="range"
          min={5}
          max={40}
          step={5}
          value={years}
          onChange={e => setYears(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>5년</span><span>40년</span>
        </div>
      </div>

      {/* 결과 */}
      <div className="bg-blue-50 rounded-xl p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">대출금</span>
          <span className="font-bold text-blue-700 num">{formatPrice(loan)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">자기자본</span>
          <span className="font-bold text-slate-700 num">{formatPrice(selfFund)}</span>
        </div>
        <div className="border-t border-blue-100 pt-3 flex justify-between">
          <span className="text-sm text-slate-600">월 상환금</span>
          <span className="font-bold text-lg text-blue-700 num">
            {(monthly / 10000).toFixed(0)}만원
          </span>
        </div>
      </div>

      {/* 취득세 */}
      <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
        <h4 className="text-sm font-medium text-emerald-700">취득세 (1주택 기준)</h4>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">세율</span>
          <span className="num">{tax.taxRate}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">취득세</span>
          <span className="num">{formatPrice(tax.acquisitionTax)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">지방교육세</span>
          <span className="num">{formatPrice(tax.localEducationTax)}</span>
        </div>
        <div className="border-t border-emerald-100 pt-2 flex justify-between font-semibold">
          <span className="text-slate-700">합계</span>
          <span className="text-emerald-700 num">{formatPrice(tax.total)}</span>
        </div>
      </div>
    </div>
  );
}
