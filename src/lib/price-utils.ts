export function formatPrice(manwon: number): string {
  if (manwon >= 10000) {
    const eok = Math.floor(manwon / 10000);
    const man = manwon % 10000;
    if (man === 0) return `${eok}억`;
    return `${eok}억 ${man.toLocaleString()}만`;
  }
  return `${manwon.toLocaleString()}만`;
}

export function m2ToPyeong(m2: number): number {
  return Math.round(m2 / 3.3058 * 10) / 10;
}

export function formatArea(m2: number): string {
  return `${m2}㎡ (${m2ToPyeong(m2)}평)`;
}
