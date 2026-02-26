'use client';

import { useState } from 'react';
import MortgageCalculator from '@/components/MortgageCalculator';
import CashFlowAnalysis from '@/components/CashFlowAnalysis';

export default function CalculatorPage() {
  const [price] = useState(90000);
  const [ltv] = useState(70);
  const [rate] = useState(3.5);
  const [years] = useState(30);
  const [rent, setRent] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">대출 계산기</h1>
        <p className="text-sm text-slate-500 mt-1">매매가, LTV, 금리를 조정해서 상환 계획을 세워보세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 대출 계산기 */}
        <MortgageCalculator initialPrice={price} />

        {/* 캐시플로우 */}
        <div className="space-y-6">
          {/* 월세 수입 설정 */}
          <div className="card">
            <h3 className="font-semibold text-slate-700 mb-4">투자 수익 시뮬레이션</h3>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">월세 수입</span>
                <span className="font-semibold num">{rent}만원</span>
              </div>
              <input
                type="range"
                min={0}
                max={500}
                step={10}
                value={rent}
                onChange={e => setRent(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>없음</span><span>500만원</span>
              </div>
            </div>
          </div>

          <CashFlowAnalysis
            price={price}
            ltv={ltv}
            rate={rate}
            years={years}
            monthlyRent={rent}
          />

          {/* 참고 사항 */}
          <div className="card bg-amber-50 border-amber-100">
            <h4 className="font-medium text-amber-700 text-sm mb-2">참고 사항</h4>
            <ul className="text-xs text-amber-600 space-y-1">
              <li>• 원리금균등상환 방식 기준 계산</li>
              <li>• 취득세는 1주택 기준 (다주택 중과세 미반영)</li>
              <li>• 실제 대출은 DSR, 소득 등에 따라 달라질 수 있음</li>
              <li>• 투자 판단의 참고자료로만 활용하세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
