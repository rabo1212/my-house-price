export function calculateMonthlyPayment(principal: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 12;
  const n = years * 12;
  if (monthlyRate === 0) return Math.round(principal / n);
  return Math.round(principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1));
}

export function calculateAcquisitionTax(price: number): {
  taxRate: number;
  acquisitionTax: number;
  localEducationTax: number;
  total: number;
} {
  // price in 만원
  const priceWon = price * 10000;
  let taxRate: number;
  if (priceWon <= 600000000) taxRate = 0.01;
  else if (priceWon <= 900000000) taxRate = ((priceWon / 100000000) * 2 / 3 - 3) / 100;
  else taxRate = 0.03;

  const acquisitionTax = Math.round(priceWon * taxRate);
  const localEducationTax = Math.round(acquisitionTax * 0.1);
  return {
    taxRate: Math.round(taxRate * 10000) / 100,
    acquisitionTax: Math.round(acquisitionTax / 10000),
    localEducationTax: Math.round(localEducationTax / 10000),
    total: Math.round((acquisitionTax + localEducationTax) / 10000),
  };
}
