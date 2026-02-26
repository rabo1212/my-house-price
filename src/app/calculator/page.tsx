'use client';

import { useState } from 'react';
import MortgageCalculator from '@/components/MortgageCalculator';
import CashFlowAnalysis from '@/components/CashFlowAnalysis';
import { IconInfo } from '@/components/icons';

export default function CalculatorPage() {
  const [price] = useState(90000);
  const [ltv] = useState(70);
  const [rate] = useState(3.5);
  const [years] = useState(30);
  const [rent, setRent] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-teal-900">대출 계산기</h1>
        <p className="text-sm text-teal-600/60 mt-1">매매가, LTV, 금리를 조정해서 상환 계획을 세워보세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MortgageCalculator initialPrice={price} />

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-teal-900 mb-4">투자 수익 시뮬레이션</h3>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-teal-700">월세 수입</span>
                <span className="font-semibold num text-teal-900">{rent}만원</span>
              </div>
              <input type="range" min={0} max={500} step={10} value={rent} onChange={e => setRent(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs text-teal-500/50 mt-1"><span>없음</span><span>500만원</span></div>
            </div>
          </div>

          <CashFlowAnalysis price={price} ltv={ltv} rate={rate} years={years} monthlyRent={rent} />

          <div className="card bg-teal-50/50 border-teal-200/60">
            <div className="flex gap-3">
              <IconInfo className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-teal-800 text-sm mb-2">참고 사항</h4>
                <ul className="text-xs text-teal-600/70 space-y-1">
                  <li>· 원리금균등상환 방식 기준 계산</li>
                  <li>· 취득세는 1주택 기준 (다주택 중과세 미반영)</li>
                  <li>· 실제 대출은 DSR, 소득 등에 따라 달라질 수 있음</li>
                  <li>· 투자 판단의 참고자료로만 활용하세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
