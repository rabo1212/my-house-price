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
        <h1 className="text-2xl font-bold text-gray-900">대출 계산기</h1>
        <p className="text-sm text-gray-500 mt-1">매매가, LTV, 금리를 조정해서 상환 계획을 세워보세요</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MortgageCalculator initialPrice={price} />
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">투자 수익 시뮬레이션</h3>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">월세 수입</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number" min={0} max={500} step={1} value={rent}
                    onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v)) setRent(Math.min(500, Math.max(0, v))); }}
                    className="w-24 text-right text-sm font-semibold num text-gray-900 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-white"
                  />
                  <span className="text-sm text-gray-500">만원</span>
                </div>
              </div>
              <input type="range" min={0} max={500} step={10} value={rent} onChange={e => setRent(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>없음</span><span>500만원</span></div>
            </div>
          </div>
          <CashFlowAnalysis price={price} ltv={ltv} rate={rate} years={years} monthlyRent={rent} />
          <div className="card bg-gray-50 border-gray-200">
            <div className="flex gap-3">
              <IconInfo className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-700 text-sm mb-2">참고 사항</h4>
                <ul className="text-xs text-gray-500 space-y-1">
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
