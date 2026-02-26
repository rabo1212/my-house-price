'use client';

import { useState, useMemo } from 'react';
import { calculateMonthlyPayment, calculateAcquisitionTax } from '@/lib/mortgage-calc';
import { formatPrice } from '@/lib/price-utils';

export default function MortgageCalculator({ initialPrice = 0 }: { initialPrice?: number }) {
  const [price, setPrice] = useState(initialPrice || 90000);
  const [ltv, setLtv] = useState(70);
  const [rate, setRate] = useState(3.5);
  const [years, setYears] = useState(30);

  const loan = Math.round(price * ltv / 100);
  const monthly = useMemo(() => calculateMonthlyPayment(loan * 10000, rate / 100, years), [loan, rate, years]);
  const tax = useMemo(() => calculateAcquisitionTax(price), [price]);
  const selfFund = price - loan;

  const Slider = ({ label, value, min, max, step, unit, inputValue, inputStep, onChange }: {
    label: string; value: number; min: number; max: number; step: number;
    unit: string; inputValue: string; inputStep?: number;
    onChange: (v: number) => void;
  }) => {
    const clamp = (v: number) => Math.min(max, Math.max(min, v));
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">{label}</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={min} max={max} step={inputStep || step}
              value={inputValue}
              onChange={e => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v)) onChange(clamp(v));
              }}
              className="w-24 text-right text-sm font-semibold num text-gray-900 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-white"
            />
            <span className="text-sm text-gray-500 w-6">{unit}</span>
          </div>
        </div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full" />
      </div>
    );
  };

  return (
    <div className="card space-y-5">
      <h3 className="font-semibold text-gray-900">대출 계산기</h3>
      <Slider label="매매가 (만원)" value={price} min={5000} max={300000} step={1000} inputStep={100} unit="" inputValue={String(price)} onChange={setPrice} />
      <Slider label="LTV (대출비율)" value={ltv} min={0} max={90} step={5} inputStep={1} unit="%" inputValue={String(ltv)} onChange={setLtv} />
      <Slider label="금리" value={rate} min={1} max={10} step={0.1} inputStep={0.1} unit="%" inputValue={rate.toFixed(1)} onChange={v => setRate(Math.round(v * 10) / 10)} />
      <Slider label="대출기간" value={years} min={5} max={40} step={5} inputStep={1} unit="년" inputValue={String(years)} onChange={setYears} />

      <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">대출금</span>
          <span className="font-bold text-indigo-700 num">{formatPrice(loan)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">자기자본</span>
          <span className="font-bold text-gray-800 num">{formatPrice(selfFund)}</span>
        </div>
        <div className="border-t border-indigo-100 pt-3 flex justify-between">
          <span className="text-sm text-gray-600">월 상환금</span>
          <span className="font-bold text-lg text-indigo-700 num">{(monthly / 10000).toFixed(0)}만원</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-700">취득세 (1주택 기준)</h4>
        <div className="flex justify-between text-sm"><span className="text-gray-500">세율</span><span className="num">{tax.taxRate}%</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">취득세</span><span className="num">{formatPrice(tax.acquisitionTax)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">지방교육세</span><span className="num">{formatPrice(tax.localEducationTax)}</span></div>
        <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
          <span className="text-gray-700">합계</span><span className="text-gray-900 num">{formatPrice(tax.total)}</span>
        </div>
      </div>
    </div>
  );
}
